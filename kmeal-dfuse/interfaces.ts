import { ActionHandlerOptions } from "demux";

export interface MassiveActionHandlerOptions extends ActionHandlerOptions {
    dbSchema?: string
}
