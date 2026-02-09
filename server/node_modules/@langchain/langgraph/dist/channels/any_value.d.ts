import { BaseChannel } from "./index.js";
/**
 * Stores the last value received, assumes that if multiple values are received, they are all equal.
 *
 * Note: Unlike 'LastValue' if multiple nodes write to this channel in a single step, the values
 * will be continuously overwritten.
 */
export declare class AnyValue<Value> extends BaseChannel<Value, Value, Value> {
    lc_graph_name: string;
    value: Value | undefined;
    constructor();
    fromCheckpoint(checkpoint?: Value): this;
    update(values: Value[]): void;
    get(): Value;
    checkpoint(): Value;
}
