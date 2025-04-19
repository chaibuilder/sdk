import { handlers } from "@/_demo/mock/handlers";
import { setupWorker } from "msw/browser";

export const worker = setupWorker(...handlers);
