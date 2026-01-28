import { useSavePage } from "@/hooks/use-save-page";
import { useRealtimeAdapter } from "@/pages/hooks/project/use-builder-prop";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { RealtimeChannelAdapter } from "./realtime-adapter";
import {
  BROADCAST_EVENTS,
  EVENT,
  PAGE_STATUS,
  PRESENCE_EVENTS,
  getMinOnlineAt,
  getPageToUser,
  pageLockMetaAtom,
  pageStatusAtom,
  pageUserMapAtom,
  realtimeChannel,
  useChannelId,
  usePageId,
  useUserId,
} from "./page-lock-utils";

const clientId: string = crypto.randomUUID();
let websocketTimeout: any = null;

/**
 * @returns
 * { pageId: { pageId: string; userId: string; clientId: string; onlineAt: number }}
 */
export const usePageToUser = () => {
  const [pageToUser, setPageToUser] = useAtom(pageUserMapAtom);
  return { pageToUser, setPageToUser };
};

/**
 * @returns
 * { pageStatus: string, setPageStatus: (pageStatus: string) => void }
 */
export const usePageLockStatus = () => {
  const [pageStatus, setPageStatus] = useAtom(pageStatusAtom);
  const isLocked = [PAGE_STATUS.LOCKED, PAGE_STATUS.ACTIVE_IN_ANOTHER_TAB].includes(pageStatus as any);
  const isEditing = [PAGE_STATUS.EDITING].includes(pageStatus as any);
  return { pageStatus, setPageStatus, isLocked, isEditing };
};

export const usePageLockMeta = () => {
  const [pageLockMeta, setPageLockMeta] = useAtom(pageLockMetaAtom);
  return { pageLockMeta, setPageLockMeta };
};

/**
 * @returns
 * { pageOwner: { pageId: string; userId: string; clientId: string; onlineAt: number }}
 */
export const useCurrentPageOwner = () => {
  const pageId = usePageId();
  const { pageToUser } = usePageToUser();
  return useMemo(() => pageToUser[pageId], [pageToUser, pageId]);
};

/**
 * @returns
 * null | RealtimeChannelAdapter
 */
const useRealtimeChannel = (): null | RealtimeChannelAdapter => {
  const realtimeAdapter = useRealtimeAdapter();
  const { setPageStatus } = usePageLockStatus();
  const [channel] = useAtom(realtimeChannel);

  // * Checking if `realtimeAdapter` instance is not provided
  useEffect(() => {
    clearTimeout(websocketTimeout);
    if (realtimeAdapter) return;
    websocketTimeout = setTimeout(() => {
      if (!realtimeAdapter) setPageStatus(PAGE_STATUS.EDITING);
    }, 500);
    return () => clearTimeout(websocketTimeout);
  }, [realtimeAdapter, setPageStatus]);

  return channel;
};

/**
 *
 * @description
 * Update online users in the page
 */
export const useUpdateOnlineUsers = () => {
  const pageId = usePageId();
  const userId = useUserId();
  const channel = useRealtimeChannel();
  const { setPageToUser } = usePageToUser();
  const { setPageStatus, pageStatus } = usePageLockStatus();
  const pageRef = useRef<any>(pageId);
  pageRef.current = pageId;

  return useCallback(
    (channelOverride?: RealtimeChannelAdapter) => {
      const targetChannel = channelOverride || channel;
      if (!targetChannel) return [];
      const stateOfPresence = targetChannel?.presenceState();
      const pageToUser = getPageToUser(stateOfPresence);
      setPageToUser(pageToUser);
      const pageOwner = pageToUser[pageRef.current];

      if (!pageOwner) {
        setPageStatus(PAGE_STATUS.CHECKING);
      } else if (!userId) {
        setPageStatus(PAGE_STATUS.CHECKING);
      } else if (pageOwner.userId === userId && pageOwner.clientId === clientId) {
        if (pageStatus === PAGE_STATUS.TAKE_OVER_REQUESTED) {
          return;
        }
        setPageStatus(PAGE_STATUS.EDITING);
      } else if (pageOwner.userId === userId && pageOwner.clientId !== clientId) {
        setPageStatus(PAGE_STATUS.ACTIVE_IN_ANOTHER_TAB);
      } else {
        setPageStatus(PAGE_STATUS.LOCKED);
      }
    },
    [channel, setPageToUser, setPageStatus, userId, pageStatus],
  );
};

/**
 *
 * @description
 * Send realtime event to the channel
 */
export const useSendRealtimeEvent = () => {
  const userId = useUserId();
  const pageId = usePageId();
  const channel = useRealtimeChannel();
  const pageOwner = useCurrentPageOwner();
  const { setPageLockMeta } = usePageLockMeta();
  const pageRef = useRef<any>(pageId);
  pageRef.current = pageId;
  return useCallback(
    async (event: string, _payload?: any) => {
      if (!channel) return;
      const payload = _payload || {};
      payload.userId = userId;
      payload.pageId = pageRef.current;
      payload.senderClientId = clientId;
      payload.receiverClientId = _payload?.requestingClientId || pageOwner?.clientId;
      await channel.send(event, payload);
      setPageLockMeta({});
    },
    [channel, userId, pageOwner, setPageLockMeta],
  );
};

/**
 *
 * @description
 * Receive realtime event from the channel
 */
export const useReceiveRealtimeEvent = () => {
  const userId = useUserId();
  const pageId = usePageId();
  const channel = useRealtimeChannel();
  const { setPageStatus } = usePageLockStatus();
  const { setPageLockMeta } = usePageLockMeta();
  const sendEvent = useSendRealtimeEvent();
  const pageRef = useRef<any>(pageId);
  const { savePageAsync } = useSavePage();

  pageRef.current = pageId;

  return useCallback(
    (event: string) =>
      async ({ payload: _payload }: any) => {
        const payload = _payload || {};
        if (!payload?.pageId || payload?.pageId !== pageRef.current || payload?.receiverClientId !== clientId) return;
        setPageLockMeta({});

        switch (event) {
          case EVENT.FORCE_TAKE_OVER_REQUEST:
          case EVENT.CONTINUE_EDITING_IN_THIS_TAB_REQUEST: {
            try {
              await savePageAsync(true);
            } catch (error) {
              console.error("Failed to save page before releasing lock:", error);
            }
            await sendEvent(EVENT.CONTINUE_EDITING_IN_THIS_CLIENT, { requestingClientId: payload?.senderClientId });
            setTimeout(() => setPageLockMeta({ type: event }), 0);
            break;
          }
          case EVENT.TAKE_OVER_REQUEST: {
            setPageLockMeta({ requestingUserId: payload?.userId, requestingClientId: payload?.senderClientId });
            setPageStatus(PAGE_STATUS.TAKE_OVER_REQUESTED);
            break;
          }
          case EVENT.CONTINUE_EDITING_IN_THIS_CLIENT: {
            const onlineAt = getMinOnlineAt(channel?.presenceState());
            setPageStatus(PAGE_STATUS.CHECKING);
            await channel?.track({ onlineAt, pageId: pageRef.current, userId, clientId });
            break;
          }
          case EVENT.TAKE_OVER_REJECTED: {
            setPageLockMeta({ type: EVENT.TAKE_OVER_REJECTED });
            break;
          }
          default:
            break;
        }
      },
    [sendEvent, setPageLockMeta, setPageStatus, channel, userId, savePageAsync],
  );
};

/**
 *
 *
 * @description
 * Subscribe to realtime events
 */
export const useChaibuilderRealtime = () => {
  const realtimeAdapter = useRealtimeAdapter();
  const userId = useUserId();
  const pageId = usePageId();
  const channelId = useChannelId();
  const [channel, setChannel] = useAtom(realtimeChannel) as [
    RealtimeChannelAdapter | null,
    (value: RealtimeChannelAdapter | null) => void,
  ];

  const onReceiveEvent = useReceiveRealtimeEvent();
  const updateOnlineUsers = useUpdateOnlineUsers();

  // Refs for stable callbacks
  const onReceiveEventRef = useRef(onReceiveEvent);
  const updateOnlineUsersRef = useRef(updateOnlineUsers);

  useEffect(() => {
    onReceiveEventRef.current = onReceiveEvent;
    updateOnlineUsersRef.current = updateOnlineUsers;
  }, [onReceiveEvent, updateOnlineUsers]);

  // Connection Effect
  useEffect(() => {
    if (!realtimeAdapter || !userId || !channelId) return;
    if (channel && channel.topic === channelId) return;

    const newChannel = realtimeAdapter.channel(channelId, {
      config: { presence: { key: clientId } },
    });

    // Attach listeners
    BROADCAST_EVENTS.forEach((event: string) => {
      newChannel.onBroadcast(event, (payload: any) => {
        onReceiveEventRef.current(event)(payload);
      });
    });

    PRESENCE_EVENTS.forEach((event: string) => {
      newChannel.onPresence(event, () => {
        updateOnlineUsersRef.current(newChannel);
      });
    });

    newChannel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        setChannel(newChannel);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.log("Realtime connection failed", status);
      }
    });

    return () => {
      newChannel.unsubscribe();
    };
  }, [realtimeAdapter, userId, channelId, setChannel]);

  // Tracking Effect
  useEffect(() => {
    if (channel && pageId && userId) {
      channel.track({
        pageId: pageId,
        userId: userId,
        clientId: clientId,
        onlineAt: +new Date(),
      });
    }

    return () => {
      if (channel && pageId) {
        channel.untrack();
      }
    };
  }, [channel, pageId, userId]);

  return void 0;
};
