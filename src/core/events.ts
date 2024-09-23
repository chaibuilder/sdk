import { createEvent } from "react-event-hook";

const { useChaiBuilderMsgListener, emitChaiBuilderMsg } = createEvent("chaiBuilderMsg")<{ name: string; data?: any }>();

export { useChaiBuilderMsgListener, emitChaiBuilderMsg };

export const CHAI_BUILDER_EVENTS = {
  OPEN_ADD_BLOCK: "OPEN_ADD_BLOCK",
  CLOSE_ADD_BLOCK: "CLOSE_ADD_BLOCK",
  SHOW_BLOCK_SETTINGS: "SHOW_BLOCK_SETTINGS",
};
