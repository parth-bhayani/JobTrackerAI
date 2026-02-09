import { Runnable, RunnableConfig, RunnableLike } from "@langchain/core/runnables";
import { RunnableCallable } from "../utils.js";
export declare const SKIP_WRITE: {};
export declare const PASSTHROUGH: {};
/**
 * Mapping of write channels to Runnables that return the value to be written,
 * or None to skip writing.
 */
export declare class ChannelWrite<RunInput = any> extends RunnableCallable {
    writes: Array<ChannelWriteEntry>;
    constructor(writes: Array<ChannelWriteEntry>, tags?: string[]);
    _getWriteValues(input: unknown, config: RunnableConfig): Promise<Record<string, unknown>>;
    _write(input: unknown, config: RunnableConfig): Promise<void>;
    static doWrite(config: RunnableConfig, values: Record<string, unknown>): void;
    static isWriter(runnable: RunnableLike): boolean;
    static registerWriter<T extends Runnable>(runnable: T): T;
}
export interface ChannelWriteEntry {
    channel: string;
    value: unknown;
    skipNone?: boolean;
    mapper?: Runnable;
}
