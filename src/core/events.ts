import { createEvent } from "react-event-hook";

const { useChaiBuilderMsgListener, emitChaiBuilderMsg } = createEvent("chaiBuilderMsg")<{ name: string; data?: any }>();

export { useChaiBuilderMsgListener, emitChaiBuilderMsg };

export const BUILDER_EVENTS = {
  SHOW_SETTINGS: "SHOW_SETTINGS",
};
