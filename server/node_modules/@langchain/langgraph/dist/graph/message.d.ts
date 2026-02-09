import { BaseMessage } from "@langchain/core/messages";
import { StateGraph } from "./state.js";
type Messages = Array<BaseMessage> | BaseMessage;
export declare class MessageGraph extends StateGraph<BaseMessage[], Messages> {
    constructor();
}
export interface MessagesState {
    messages: BaseMessage[];
}
export {};
