import { EmptyChannelError, InvalidUpdateError } from "../errors.js";
import { BaseChannel } from "./index.js";
/**
 * Stores the value received in the step immediately preceding, clears after.
 */
export class EphemeralValue extends BaseChannel {
    constructor(guard = true) {
        super();
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "EphemeralValue"
        });
        Object.defineProperty(this, "guard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.guard = guard;
    }
    fromCheckpoint(checkpoint) {
        const empty = new EphemeralValue();
        if (checkpoint) {
            empty.value = checkpoint;
        }
        return empty;
    }
    update(values) {
        if (values.length === 0) {
            // If there are no updates for this specific channel at the end of the step, wipe it.
            this.value = undefined;
            return;
        }
        if (values.length !== 1 && this.guard) {
            throw new InvalidUpdateError("EphemeralValue can only receive one value per step.");
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
