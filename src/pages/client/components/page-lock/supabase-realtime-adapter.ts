/**
 * Supabase Realtime Adapter
 * 
 * Implementation of RealtimeAdapter for Supabase Realtime
 */

import type { RealtimeChannel, RealtimeClient } from "@supabase/supabase-js";
import type {
  ChannelStatus,
  PresenceState,
  RealtimeAdapter,
  RealtimeChannelAdapter,
} from "./realtime-adapter";

/**
 * Wraps a Supabase RealtimeChannel to match the RealtimeChannelAdapter interface
 */
class SupabaseChannelAdapter implements RealtimeChannelAdapter {
  private channel: RealtimeChannel;

  constructor(channel: RealtimeChannel) {
    this.channel = channel;
  }

  get topic(): string {
    return this.channel.topic;
  }

  async subscribe(callback: (status: ChannelStatus) => void): Promise<void> {
    this.channel.subscribe((status: string) => {
      callback(status as ChannelStatus);
    });
  }

  unsubscribe(): void {
    this.channel.unsubscribe();
  }

  onBroadcast(event: string, callback: (payload: any) => void): void {
    this.channel.on("broadcast", { event }, callback);
  }

  onPresence(event: string, callback: () => void): void {
    this.channel.on("presence" as any, { event }, callback);
  }

  async send(event: string, payload: any): Promise<void> {
    await this.channel.send({ event, payload, type: "broadcast" });
  }

  async track(state: any): Promise<void> {
    await this.channel.track(state);
  }

  untrack(): void {
    this.channel.untrack();
  }

  presenceState(): PresenceState {
    return this.channel.presenceState();
  }
}

/**
 * Supabase implementation of RealtimeAdapter
 */
export class SupabaseRealtimeAdapter implements RealtimeAdapter {
  private client: RealtimeClient;

  constructor(client: RealtimeClient) {
    this.client = client;
  }

  channel(channelId: string, options?: any): RealtimeChannelAdapter {
    const supabaseChannel = this.client.channel(channelId, options);
    return new SupabaseChannelAdapter(supabaseChannel);
  }
}
