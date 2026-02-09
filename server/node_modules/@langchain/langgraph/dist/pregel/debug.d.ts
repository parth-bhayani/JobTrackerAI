import { BaseChannel } from "../channels/base.js";
import { PregelExecutableTask } from "./types.js";
export declare function printStepStart<N extends PropertyKey, C extends PropertyKey>(step: number, nextTasks: readonly PregelExecutableTask<N, C>[]): void;
export declare function printCheckpoint<Value>(step: number, channels: Record<string, BaseChannel<Value>>): void;
