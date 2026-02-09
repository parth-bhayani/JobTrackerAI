import { BaseChannel } from "./index.js";
export type BinaryOperator<Value> = (a: Value, b: Value) => Value;
/**
 * Stores the result of applying a binary operator to the current value and each new value.
 */
export declare class BinaryOperatorAggregate<Value> extends BaseChannel<Value, Value, Value> {
    lc_graph_name: string;
    value: Value | undefined;
    operator: BinaryOperator<Value>;
    initialValueFactory?: () => Value;
    constructor(operator: BinaryOperator<Value>, initialValueFactory?: () => Value);
    fromCheckpoint(checkpoint?: Value): this;
    update(values: Value[]): void;
    get(): Value;
    checkpoint(): Value;
}
