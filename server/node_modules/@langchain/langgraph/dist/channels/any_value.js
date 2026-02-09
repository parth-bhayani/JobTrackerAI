import { EmptyChannelError } from "../errors.js";
import { BaseChannel } from "./index.js";
/**
 * Stores the last value received, assumes that if multiple values are received, they are all equal.
 *
 * Note: Unlike 'LastValue' if multiple nodes write to this channel in a single step, the values
 * will be continuously overwritten.
 */
export class AnyValue extends BaseChannel {
    constructor() {
        super();
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AnyValue"
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.value = undefined;
    }
    fromCheckpoint(checkpoint) {
        const empty = new AnyValue();
        if (checkpoint) {
            empty.value = checkpoint;
        }
        return empty;
    }
    update(values) {
        if (values.length === 0) {
            this.value = undefined;
            return;
        }
        // eslint-disable-next-line prefer-destructuring
        this.value = values[values.length - 1];
    }
    get() {
        if (this.value === undefined) {
            throw new EmptyChannelError();
        }
        return this.value;
    }
    checkpoint() {
        if (this.value === undefined) {
            throw new EmptyChannelError();
        }
        return this.value;
    }
}
