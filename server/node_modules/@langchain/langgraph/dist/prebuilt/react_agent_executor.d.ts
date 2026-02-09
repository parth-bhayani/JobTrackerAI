import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { StructuredTool } from "@langchain/core/tools";
import { BaseCheckpointSaver } from "../checkpoint/base.js";
import { START } from "../graph/index.js";
import { MessagesState } from "../graph/message.js";
import { CompiledStateGraph } from "../graph/state.js";
import { All } from "../pregel/types.js";
import { ToolNode } from "./tool_node.js";
export interface AgentState {
    messages: BaseMessage[];
}
export type N = typeof START | "agent" | "tools";
export type CreateReactAgentParams = {
    llm: BaseChatModel;
    tools: ToolNode<MessagesState> | StructuredTool[];
    messageModifier?: SystemMessage | string | ((messages: BaseMessage[]) => BaseMessage[]) | ((messages: BaseMessage[]) => Promise<BaseMessage[]>) | Runnable;
    checkpointSaver?: BaseCheckpointSaver;
    interruptBefore?: N[] | All;
    interruptAfter?: N[] | All;
};
/**
 * Creates a StateGraph agent that relies on a chat llm utilizing tool calling.
 * @param llm The chat llm that can utilize OpenAI-style function calling.
 * @param tools A list of tools or a ToolNode.
 * @param messageModifier An optional message modifier to apply to messages before being passed to the LLM.
 * Can be a SystemMessage, string, function that takes and returns a list of messages, or a Runnable.
 * @param checkpointSaver An optional checkpoint saver to persist the agent's state.
 * @param interruptBefore An optional list of node names to interrupt before running.
 * @param interruptAfter An optional list of node names to interrupt after running.
 * @returns A compiled agent as a LangChain Runnable.
 */
export declare function createReactAgent(props: CreateReactAgentParams): CompiledStateGraph<AgentState, Partial<AgentState>, typeof START | "agent" | "tools">;
