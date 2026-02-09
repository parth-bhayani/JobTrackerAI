import { BaseChannel } from "./index.js";
/**
 * Stores the value received in the step immediately preceding, clears after.
 */
export declare class EphemeralValue<Value> extends BaseChannel<Value, Value, Value> {
    lc_graph_name: string;
    guard: boolean;
    value?: Value;
    constructor(guard?: boolean);
    fromCheckpoint(checkpoint?: Value): this;
    update(values: Value[]): void;
    get(): Value;
    checkpoint(): Value;
}
