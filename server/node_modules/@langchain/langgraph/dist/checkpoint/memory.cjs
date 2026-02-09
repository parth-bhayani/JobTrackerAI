"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorySaver = void 0;
const base_js_1 = require("./base.cjs");
class MemorySaver extends base_js_1.BaseCheckpointSaver {
    constructor(serde) {
        super(serde);
        Object.defineProperty(this, "storage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.storage = {};
    }
    async getTuple(config) {
        const thread_id = config.configurable?.thread_id;
        const checkpoint_id = config.configurable?.checkpoint_id;
        const checkpoints = this.storage[thread_id];
        if (checkpoint_id) {
            const checkpoint = checkpoints[checkpoint_id];
            if (checkpoint) {
                return {
                    config,
                    checkpoint: (await this.serde.parse(checkpoint[0])),
                    metadata: (await this.serde.parse(checkpoint[1])),
                };
            }
        }
        else {
            if (checkpoints) {
                const maxThreadTs = Object.keys(checkpoints).sort((a, b) => b.localeCompare(a))[0];
                const checkpoint = checkpoints[maxThreadTs];
                return {
                    config: { configurable: { thread_id, checkpoint_id: maxThreadTs } },
                    checkpoint: (await this.serde.parse(checkpoint[0])),
                    metadata: (await this.serde.parse(checkpoint[1])),
                };
            }
        }
        return undefined;
    }
    async *list(config, limit, before) {
        const thread_id = config.configurable?.thread_id;
        const checkpoints = this.storage[thread_id] ?? {};
        // sort in desc order
        for (const [checkpoint_id, checkpoint] of Object.entries(checkpoints)
            .filter((c) => before ? c[0] < before.configurable?.checkpoint_id : true)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, limit)) {
            yield {
                config: { configurable: { thread_id, checkpoint_id } },
                checkpoint: (await this.serde.parse(checkpoint[0])),
                metadata: (await this.serde.parse(checkpoint[1])),
            };
        }
    }
    async put(config, checkpoint, metadata) {
        const thread_id = config.configurable?.thread_id;
        if (this.storage[thread_id]) {
            this.storage[thread_id][checkpoint.id] = [
                this.serde.stringify(checkpoint),
                this.serde.stringify(metadata),
            ];
        }
        else {
            this.storage[thread_id] = {
                [checkpoint.id]: [
                    this.serde.stringify(checkpoint),
                    this.serde.stringify(metadata),
                ],
            };
        }
        return {
            configurable: {
                thread_id,
                checkpoint_id: checkpoint.id,
            },
        };
    }
}
exports.MemorySaver = MemorySaver;
