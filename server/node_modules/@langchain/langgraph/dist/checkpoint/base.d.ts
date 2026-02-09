import { RunnableConfig } from "@langchain/core/runnables";
import { SerializerProtocol } from "../serde/base.js";
export interface CheckpointMetadata {
    source: "input" | "loop" | "update";
    /**
     * The source of the checkpoint.
     * - "input": The checkpoint was created from an input to invoke/stream/batch.
     * - "loop": The checkpoint was created from inside the pregel loop.
     * - "update": The checkpoint was created from a manual state update. */
    step: number;
    /**
     * The step number of the checkpoint.
     * -1 for the first "input" checkpoint.
     * 0 for the first "loop" checkpoint.
     * ... for the nth checkpoint afterwards. */
    writes: Record<string, unknown> | null;
}
export interface Checkpoint<N extends string = string, C extends string = string> {
    /**
     * Version number
     */
    v: number;
    /**
     * Checkpoint ID {uuid6}
     */
    id: string;
    /**
     * Timestamp {new Date().toISOString()}
     */
    ts: string;
    /**
     * @default {}
     */
    channel_values: Record<C, unknown>;
    /**
     * @default {}
     */
    channel_versions: Record<C, number>;
    /**
     * @default {}
     */
    versions_seen: Record<N, Record<C, number>>;
}
export interface ReadonlyCheckpoint extends Readonly<Checkpoint> {
    readonly channel_values: Readonly<Record<string, unknown>>;
    readonly channel_versions: Readonly<Record<string, number>>;
    readonly versions_seen: Readonly<Record<string, Readonly<Record<string, number>>>>;
}
export declare function getChannelVersion(checkpoint: ReadonlyCheckpoint, channel: string): number;
export declare function getVersionSeen(checkpoint: ReadonlyCheckpoint, node: string, channel: string): number;
export declare function deepCopy<T>(obj: T): T;
export declare function emptyCheckpoint(): Checkpoint;
export declare function copyCheckpoint(checkpoint: ReadonlyCheckpoint): Checkpoint;
export interface CheckpointTuple {
    config: RunnableConfig;
    checkpoint: Checkpoint;
    metadata?: CheckpointMetadata;
    parentConfig?: RunnableConfig;
}
export declare abstract class BaseCheckpointSaver {
    serde: SerializerProtocol<unknown>;
    constructor(serde?: SerializerProtocol<unknown>);
    get(config: RunnableConfig): Promise<Checkpoint | undefined>;
    abstract getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined>;
    abstract list(config: RunnableConfig, limit?: number, before?: RunnableConfig): AsyncGenerator<CheckpointTuple>;
    abstract put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig>;
}
