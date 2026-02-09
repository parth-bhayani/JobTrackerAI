import { BaseChannel } from "../channels/base.js";
import { PregelExecutableTask } from "./types.js";
export declare function readChannel<C extends PropertyKey>(channels: Record<C, BaseChannel>, chan: C, catch_?: boolean, returnException?: boolean): unknown | null;
export declare function readChannels<C extends PropertyKey>(channels: Record<C, BaseChannel>, select: C | Array<C>, skipEmpty?: boolean): Record<string, any> | any;
/**
 * Map input chunk to a sequence of pending writes in the form [channel, value].
 */
export declare function mapInput<C extends PropertyKey>(inputChannels: C | Array<C>, chunk?: any): Generator<[C, any]>;
/**
 * Map pending writes (a sequence of tuples (channel, value)) to output chunk.
 */
export declare function mapOutputValues<C extends PropertyKey>(outputChannels: C | Array<C>, pendingWrites: readonly [C, unknown][], channels: Record<C, BaseChannel>): Generator<Record<string, any>, any>;
/**
 * Map pending writes (a sequence of tuples (channel, value)) to output chunk.
 */
export declare function mapOutputUpdates<N extends PropertyKey, C extends PropertyKey>(outputChannels: C | Array<C>, tasks: readonly PregelExecutableTask<N, C>[]): Generator<Record<N, any | Record<string, any>>>;
export declare function single<T>(iter: IterableIterator<T>): T | null;
