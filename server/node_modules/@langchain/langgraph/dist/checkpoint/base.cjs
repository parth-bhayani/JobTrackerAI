"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCheckpointSaver = exports.copyCheckpoint = exports.emptyCheckpoint = exports.deepCopy = exports.getVersionSeen = exports.getChannelVersion = void 0;
const base_js_1 = require("../serde/base.cjs");
const id_js_1 = require("./id.cjs");
function getChannelVersion(checkpoint, channel) {
    return checkpoint.channel_versions[channel] ?? 0;
}
exports.getChannelVersion = getChannelVersion;
function getVersionSeen(checkpoint, node, channel) {
    return checkpoint.versions_seen[node]?.[channel] ?? 0;
}
exports.getVersionSeen = getVersionSeen;
function deepCopy(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }
    const newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = deepCopy(obj[key]);
        }
    }
    return newObj;
}
exports.deepCopy = deepCopy;
function emptyCheckpoint() {
    return {
        v: 1,
        id: (0, id_js_1.uuid6)(-2),
        ts: new Date().toISOString(),
        channel_values: {},
        channel_versions: {},
        versions_seen: {},
    };
}
exports.emptyCheckpoint = emptyCheckpoint;
function copyCheckpoint(checkpoint) {
    return {
        v: checkpoint.v,
        id: checkpoint.id,
        ts: checkpoint.ts,
        channel_values: { ...checkpoint.channel_values },
        channel_versions: { ...checkpoint.channel_versions },
        versions_seen: deepCopy(checkpoint.versions_seen),
    };
}
exports.copyCheckpoint = copyCheckpoint;
class BaseCheckpointSaver {
    constructor(serde) {
        Object.defineProperty(this, "serde", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: base_js_1.DefaultSerializer
        });
        this.serde = serde || this.serde;
    }
    async get(config) {
        const value = await this.getTuple(config);
        return value ? value.checkpoint : undefined;
    }
}
exports.BaseCheckpointSaver = BaseCheckpointSaver;
