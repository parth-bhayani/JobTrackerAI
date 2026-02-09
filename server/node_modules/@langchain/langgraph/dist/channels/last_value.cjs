"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastValue = void 0;
const errors_js_1 = require("../errors.cjs");
const index_js_1 = require("./index.cjs");
/**
 * Stores the last value received, can receive at most one value per step.
 *
 * Since `update` is only called once per step and value can only be of length 1,
 * LastValue always stores the last value of a single node. If multiple nodes attempt to
 * write to this channel in a single step, an error will be thrown.
 */
class LastValue extends index_js_1.BaseChannel {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_graph_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "LastValue"
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    fromCheckpoint(checkpoint) {
        const empty = new LastValue();
        if (checkpoint) {
            empty.value = checkpoint;
        }
        return empty;
    }
    update(values) {
        if (values.length === 0) {
            return;
        }
        if (values.length !== 1) {
            throw new errors_js_1.InvalidUpdateError();
        }
        // eslint-disable-next-line prefer-destructuring
        this.value = values[values.length - 1];
    }
    get() {
        if (this.value === undefined) {
            throw new errors_js_1.EmptyChannelError();
        }
        return this.value;
    }
    checkpoint() {
        if (this.value === undefined) {
            throw new errors_js_1.EmptyChannelError();
        }
        return this.value;
    }
}
exports.LastValue = LastValue;
