import { RunnableBinding, RunnableConfig } from "@langchain/core/runnables";
import { StructuredTool } from "@langchain/core/tools";
export interface ToolExecutorArgs {
    tools: Array<StructuredTool>;
    /**
     * @default {INVALID_TOOL_MSG_TEMPLATE}
     */
    invalidToolMsgTemplate?: string;
}
/**
 * Interface for invoking a tool
 */
export interface ToolInvocationInterface {
    tool: string;
    toolInput: string;
}
type ToolExecutorInputType = any;
type ToolExecutorOutputType = any;
export declare class ToolExecutor extends RunnableBinding<ToolExecutorInputType, ToolExecutorOutputType> {
    lc_graph_name: string;
    tools: Array<StructuredTool>;
    toolMap: Record<string, StructuredTool>;
    invalidToolMsgTemplate: string;
    constructor(fields: ToolExecutorArgs);
    _execute(toolInvocation: ToolInvocationInterface, config?: RunnableConfig): Promise<string>;
}
export {};
