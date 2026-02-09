import { BaseChannel } from "./base.js";
export declare class Topic<Value> extends BaseChannel<Array<Value>, Value | Value[], [
    Value[],
    Value[]
]> {
    lc_graph_name: string;
    unique: boolean;
    accumulate: boolean;
    seen: Set<Value>;
    values: Value[];
    constructor(fields?: {
        unique?: boolean;
        accumulate?: boolean;
    });
    fromCheckpoint(checkpoint?: [Value[], Value[]]): this;
    update(values: Array<Value | Value[]>): void;
    get(): Array<Value>;
    checkpoint(): [Value[], Value[]];
}
