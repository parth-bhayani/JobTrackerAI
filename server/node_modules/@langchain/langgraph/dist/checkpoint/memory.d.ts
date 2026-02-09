import { RunnableConfig } from "@langchain/core/runnables";
import { BaseCheckpointSaver, Checkpoint, CheckpointMetadata, CheckpointTuple } from "./base.js";
import { SerializerProtocol } from "../serde/base.js";
export declare class MemorySaver extends BaseCheckpointSaver {
    storage: Record<string, Record<string, [string, string]>>;
    constructor(serde?: SerializerProtocol<unknown>);
    getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined>;
    list(config: RunnableConfig, limit?: number, before?: RunnableConfig): AsyncGenerator<CheckpointTuple>;
    put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig>;
}
