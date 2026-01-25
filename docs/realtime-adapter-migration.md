# Page Lock Realtime Adapter Migration Guide

## Overview

The page lock feature has been updated to support multiple realtime service providers, not just Supabase. This guide will help you migrate your code from the old API to the new adapter-based API.

## What Changed?

Previously, the page lock feature was tightly coupled to Supabase Realtime. You would pass a Supabase `RealtimeClient` directly via the `websocket` prop:

```tsx
// Old API (Deprecated)
<ChaiWebsiteBuilder
  {...props}
  websocket={supabase.realtime}
/>
```

Now, you use a `realtimeAdapter` prop that accepts any implementation of the `RealtimeAdapter` interface:

```tsx
// New API
import { createRealtimeAdapter } from '@chaibuilder/sdk/pages';

const realtimeAdapter = createRealtimeAdapter(supabase.realtime);

<ChaiWebsiteBuilder
  {...props}
  realtimeAdapter={realtimeAdapter}
/>
```

## Migration Steps

### Option 1: Quick Migration (Recommended)

Use the `createRealtimeAdapter` helper function to wrap your existing Supabase client:

```tsx
import { createClient } from '@supabase/supabase-js';
import { ChaiWebsiteBuilder, createRealtimeAdapter } from '@chaibuilder/sdk/pages';

const supabase = createClient(url, key);
const realtimeAdapter = createRealtimeAdapter(supabase.realtime);

function MyApp() {
  return (
    <ChaiWebsiteBuilder
      {...otherProps}
      realtimeAdapter={realtimeAdapter}
    />
  );
}
```

### Option 2: Create Adapter Manually

For more control, create the adapter manually:

```tsx
import { createClient } from '@supabase/supabase-js';
import { ChaiWebsiteBuilder, SupabaseRealtimeAdapter } from '@chaibuilder/sdk/pages';

const supabase = createClient(url, key);
const realtimeAdapter = new SupabaseRealtimeAdapter(supabase.realtime);

function MyApp() {
  return (
    <ChaiWebsiteBuilder
      {...otherProps}
      realtimeAdapter={realtimeAdapter}
    />
  );
}
```

## Backward Compatibility

The old `websocket` prop is still supported for backward compatibility, but it's **deprecated** and will be removed in a future version. When you use the `websocket` prop, it's automatically wrapped with a `SupabaseRealtimeAdapter` internally.

```tsx
// This still works but is deprecated
<ChaiWebsiteBuilder
  {...props}
  websocket={supabase.realtime}  // ⚠️ Deprecated
/>
```

## Creating Custom Adapters

You can now implement your own realtime adapter for other service providers like Pusher, Ably, Socket.io, etc.

### Adapter Interface

```typescript
interface RealtimeAdapter {
  channel(channelId: string, options?: any): RealtimeChannelAdapter;
}

interface RealtimeChannelAdapter {
  topic: string;
  subscribe(callback: (status: ChannelStatus) => void): Promise<void>;
  unsubscribe(): void;
  onBroadcast(event: string, callback: (payload: any) => void): void;
  onPresence(event: string, callback: () => void): void;
  send(event: string, payload: any): Promise<void>;
  track(state: any): Promise<void>;
  untrack(): void;
  presenceState(): PresenceState;
}
```

### Example: Pusher Adapter

```typescript
import { RealtimeAdapter, RealtimeChannelAdapter } from '@chaibuilder/sdk/pages';
import Pusher from 'pusher-js';

class PusherChannelAdapter implements RealtimeChannelAdapter {
  private channel: any;
  
  constructor(channel: any) {
    this.channel = channel;
  }

  get topic() {
    return this.channel.name;
  }

  async subscribe(callback: (status: string) => void): Promise<void> {
    this.channel.bind('pusher:subscription_succeeded', () => {
      callback('SUBSCRIBED');
    });
  }

  unsubscribe(): void {
    this.channel.unbind_all();
    this.channel.unsubscribe();
  }

  onBroadcast(event: string, callback: (payload: any) => void): void {
    this.channel.bind(event, callback);
  }

  // Implement other methods...
}

class PusherRealtimeAdapter implements RealtimeAdapter {
  private pusher: Pusher;

  constructor(pusher: Pusher) {
    this.pusher = pusher;
  }

  channel(channelId: string, options?: any): RealtimeChannelAdapter {
    const pusherChannel = this.pusher.subscribe(channelId);
    return new PusherChannelAdapter(pusherChannel);
  }
}

// Usage
const pusher = new Pusher(key, { cluster });
const realtimeAdapter = new PusherRealtimeAdapter(pusher);

<ChaiWebsiteBuilder
  {...props}
  realtimeAdapter={realtimeAdapter}
/>
```

## Benefits

1. **Provider Flexibility**: Use any realtime service provider (Supabase, Pusher, Ably, custom WebSocket, etc.)
2. **Better Type Safety**: Strongly typed interfaces for all adapter methods
3. **Easier Testing**: Mock the adapter interface for testing without Supabase
4. **Reduced Coupling**: No hard dependency on Supabase in the core page lock logic

## Support

If you have questions or need help migrating, please:
- Check the [API documentation](https://docs.chaibuilder.com)
- Open an issue on [GitHub](https://github.com/chaibuilder/sdk/issues)
- Join our [Discord community](https://discord.gg/chaibuilder)
