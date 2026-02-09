import { DefaultSerializer } from "../serde/base.js";
import { uuid6 } from "./id.js";
export function getChannelVersion(checkpoint, channel) {
    return checkpoint.channel_versions[channel] ?? 0;
}
export function getVersionSeen(checkpoint, node, channel) {
    return checkpoint.versions_seen[node]?.[channel] ?? 0;
}
export function deepCopy(obj) {
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
export function emptyCheckpoint() {
    return {
        v: 1,
        id: uuid6(-2),
        ts: new Date().toISOString(),
        channel_values: {},
        channel_versions: {},
        versions_seen: {},
    };
}
export function copyCheckpoint(checkpoint) {
    return {
        v: checkpoint.v,
        id: checkpoint.id,
        ts: checkpoint.ts,
        channel_values: { ...checkpoint.channel_values },
        channel_versions: { ...checkpoint.channel_versions },
        versions_seen: deepCopy(checkpoint.versions_seen),
    };
}
export class BaseCheckpointSaver {
    constructor(serde) {
        Object.defineProperty(this, "serde", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: DefaultSerializer
        });
        this.serde = serde || this.serde;
    }
    async get(config) {
        const value = await this.getTuple(config);
        return value ? value.checkpoint : undefined;
    }
}
