import { Database as DatabaseType } from "better-sqlite3";
import { RunnableConfig } from "@langchain/core/runnables";
import { BaseCheckpointSaver, Checkpoint, CheckpointMetadata, CheckpointTuple } from "./base.js";
import { SerializerProtocol } from "../serde/base.js";
export declare class SqliteSaver extends BaseCheckpointSaver {
    db: DatabaseType;
    protected isSetup: boolean;
    constructor(db: DatabaseType, serde?: SerializerProtocol<Checkpoint>);
    static fromConnString(connStringOrLocalPath: string): SqliteSaver;
    private setup;
    getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined>;
    list(config: RunnableConfig, limit?: number, before?: RunnableConfig): AsyncGenerator<CheckpointTuple>;
    put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig>;
}
