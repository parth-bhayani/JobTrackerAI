import { EmptyChannelError, InvalidUpdateError } from "../errors.js";
import { BaseChannel } from "./index.js";
import { areSetsEqual } from "./named_barrier_value.js";
/**
  A channel that switches between two states

    - in the "priming" state it can't be read from.
        - if it receives a WaitForNames update, it switches to the "waiting" state.
    - in the "waiting" state it collects named values until all are received.
        - once all named values are received, it can be read once, and it switches
          back to the "priming" state.
 */
export class DynamicBarrierValue extends BaseChannel {
    constructor() {
        super();
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "DynamicBarrierValue"
        });
        Object.defineProperty(this, "names", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // Names of nodes that we want to wait for.
        Object.defineProperty(this, "seen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.names = undefined;
        this.seen = new Set();
    }
    fromCheckpoint(checkpoint) {
        const empty = new DynamicBarrierValue();
        if (checkpoint) {
            empty.names = new Set(checkpoint[0]);
            empty.seen = new Set(checkpoint[1]);
        }
        return empty;
    }
    update(values) {
        // switch to priming state after reading it once
        if (this.names && areSetsEqual(this.names, this.seen)) {
            this.seen = new Set();
            this.names = undefined;
        }
        const newNames = values.filter((v) => typeof v === "object" &&
            !!v &&
            "__names" in v &&
            Object.keys(v).join(",") === "__names" &&
            Array.isArray(v.__names));
        if (newNames.length > 1) {
            throw new InvalidUpdateError(`Expected at most one WaitForNames object, got ${newNames.length}`);
        }
        else if (newNames.length === 1) {
            this.names = new Set(newNames[0].__names);
        }
        else if (this.names) {
            for (const value of values) {
                if (this.names.has(value)) {
                    this.seen.add(value);
                }
                else {
                    throw new InvalidUpdateError(`Value ${value} not in names ${this.names}`);
                }
            }
        }
    }
    // If we have not yet seen all the node names we want to wait for,
    // throw an error to prevent continuing.
    get() {
        if (!this.names || !areSetsEqual(this.names, this.seen)) {
            throw new EmptyChannelError();
        }
        return undefined;
    }
    checkpoint() {
        return [this.names ? [...this.names] : undefined, [...this.seen]];
    }
}
