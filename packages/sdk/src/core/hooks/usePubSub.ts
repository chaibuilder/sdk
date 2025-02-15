import { useEffect } from "react";
import { pubsub } from "../pubsub";

export function usePubSub<T>(eventName: string, callback: (data?: T) => void) {
  useEffect(() => {
    const unsubscribe = pubsub.subscribe<T>(eventName, callback);
    return () => unsubscribe();
  }, [eventName, callback]);
}
