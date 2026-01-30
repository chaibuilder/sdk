import { useSavePage } from "@/hooks/use-save-page";
import { useWebsocket } from "@/pages/hooks/project/use-builder-prop";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
 * null | RealtimeChannel
 */
const useRealtimeChannel = (): null | RealtimeChannel => {
  const websocket = useWebsocket();
  const { setPageStatus } = usePageLockStatus();
  const [channel] = useAtom(realtimeChannel);

  // * Checking if `websocket` instance is not provided
  useEffect(() => {
    clearTimeout(websocketTimeout);
    if (websocket) return;
    websocketTimeout = setTimeout(() => {
      if (!websocket) setPageStatus(PAGE_STATUS.EDITING);
    }, 500);
    return () => clearTimeout(websocketTimeout);
  }, [websocket, setPageStatus]);

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
    (channelOverride?: RealtimeChannel) => {
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
      await channel.send({ event, payload, type: "broadcast" });
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
  const websocket = useWebsocket();
  const userId = useUserId();
  const pageId = usePageId();
  const channelId = useChannelId();
  const [channel, setChannel] = useAtom(realtimeChannel) as [
    RealtimeChannel | null,
    (value: RealtimeChannel | null) => void,
  ];

  const onReceiveEvent = useReceiveRealtimeEvent();
  const updateOnlineUsers = useUpdateOnlineUsers();

  // Refs for stable callbacks and reconnection state
  const onReceiveEventRef = useRef(onReceiveEvent);
  const updateOnlineUsersRef = useRef(updateOnlineUsers);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReconnectingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10; // Maximum number of reconnection attempts

  useEffect(() => {
    onReceiveEventRef.current = onReceiveEvent;
    updateOnlineUsersRef.current = updateOnlineUsers;
  }, [onReceiveEvent, updateOnlineUsers]);

  // Common function to setup channel with event listeners
  const setupChannelListeners = useCallback((newChannel: RealtimeChannel) => {
    // Attach broadcast listeners
    BROADCAST_EVENTS.forEach((event: string) => {
      newChannel.on("broadcast", { event }, (payload: any) => {
        onReceiveEventRef.current(event)(payload);
      });
    });

    // Attach presence listeners
    PRESENCE_EVENTS.forEach((event: string) => {
      newChannel.on("presence" as any, { event }, () => {
        updateOnlineUsersRef.current(newChannel);
      });
    });
  }, []);

  // Function to cleanup and reconnect the channel
  const reconnectChannel = useCallback(() => {
    if (isReconnectingRef.current || !websocket || !userId || !channelId) return;

    // Check if we've exceeded max attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(`Maximum reconnection attempts (${maxReconnectAttempts}) reached. Stopping reconnection attempts.`);
      return;
    }

    isReconnectingRef.current = true;
    reconnectAttemptsRef.current += 1;

    console.log(`Attempting to reconnect realtime channel (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

    // Clear existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Remove old channel if it exists
    if (channel) {
      websocket.removeChannel(channel);
      setChannel(null);
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, max 16s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 16000);

    reconnectTimeoutRef.current = setTimeout(() => {
      const newChannel = websocket.channel(channelId, {
        config: { presence: { key: clientId } },
      });

      // Setup event listeners
      setupChannelListeners(newChannel);

      newChannel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime connection established successfully");
          setChannel(newChannel);
          reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
          isReconnectingRef.current = false;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.log(`Realtime connection failed: ${status}. Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          // Only trigger another reconnection attempt if we haven't exceeded max attempts
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            isReconnectingRef.current = false;
            // Attempt to reconnect after error
            reconnectChannel();
          } else {
            console.error("Maximum reconnection attempts reached");
            isReconnectingRef.current = false;
          }
        } else if (status === "CLOSED") {
          console.log("Realtime connection closed");
          isReconnectingRef.current = false;
        }
      });
    }, delay);
  }, [websocket, userId, channelId, channel, setChannel, setupChannelListeners]);

  // Connection Effect
  useEffect(() => {
    if (!websocket || !userId || !channelId) return;
    if (channel && channel.topic === channelId) return;

    const newChannel = websocket.channel(channelId, {
      config: { presence: { key: clientId } },
    });

    // Setup event listeners using shared function
    setupChannelListeners(newChannel);

    newChannel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        console.log("Realtime connection established successfully");
        setChannel(newChannel);
        reconnectAttemptsRef.current = 0;
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.log(`Realtime connection failed: ${status}. Will attempt to reconnect...`);
        // Only trigger reconnection if not already reconnecting
        if (!isReconnectingRef.current) {
          reconnectChannel();
        }
      } else if (status === "CLOSED") {
        console.log("Realtime connection closed");
      }
    });

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      websocket.removeChannel(newChannel);
    };
  }, [websocket, userId, channelId, setChannel, reconnectChannel, setupChannelListeners]);

  // Handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab became visible, checking realtime connection...");
        
        // Don't attempt reconnection if already reconnecting
        if (isReconnectingRef.current) {
          console.log("Reconnection already in progress, skipping visibility change reconnect");
          return;
        }
        
        // Check if channel exists and is subscribed
        if (channel) {
          const channelState = (channel as any).state;
          
          // If channel is not in a good state, reconnect
          if (channelState !== "joined") {
            console.log(`Channel state is ${channelState}, reconnecting...`);
            reconnectChannel();
          }
        } else {
          // No channel exists, trigger reconnection
          console.log("No active channel found, reconnecting...");
          reconnectChannel();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [channel, reconnectChannel]);

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
