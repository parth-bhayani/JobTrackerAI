import { BaseChannel } from "./base.js";
function* flatten(values) {
    for (const value of values) {
        if (Array.isArray(value)) {
            yield* value;
        }
        else {
            yield value;
        }
    }
}
export class Topic extends BaseChannel {
    constructor(fields) {
        super();
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Topic"
        });
        Object.defineProperty(this, "unique", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "accumulate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "seen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "values", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.unique = fields?.unique ?? this.unique;
        this.accumulate = fields?.accumulate ?? this.accumulate;
        // State
        this.seen = new Set();
        this.values = [];
    }
    fromCheckpoint(checkpoint) {
        const empty = new Topic({
            unique: this.unique,
            accumulate: this.accumulate,
        });
        if (checkpoint) {
            empty.seen = new Set(checkpoint[0]);
            // eslint-disable-next-line prefer-destructuring
            empty.values = checkpoint[1];
        }
        return empty;
    }
    update(values) {
        if (!this.accumulate) {
            this.values = [];
        }
        const flatValues = flatten(values);
        if (flatValues) {
            if (this.unique) {
                for (const value of flatValues) {
                    if (!this.seen.has(value)) {
                        this.seen.add(value);
                        this.values.push(value);
                    }
                }
            }
            else {
                this.values.push(...flatValues);
            }
        }
    }
    get() {
        return this.values;
    }
    checkpoint() {
        return [[...this.seen], this.values];
    }
}
