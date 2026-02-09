"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert1to6 = exports.uuid6 = void 0;
const uuid_1 = require("uuid");
/**
 * Returns an unsigned `x`-bit random integer.
 * @param x - An unsigned integer ranging from 0 to 53, inclusive.
 * @returns An unsigned `x`-bit random integer (`0 <= f(x) < 2^x`).
 */
function getRandomInt(x) {
    if (x < 0 || x > 53) {
        return NaN;
    }
    const n = 0 | (Math.random() * 0x40000000); // 1 << 30
    return x > 30
        ? n + (0 | (Math.random() * (1 << (x - 30)))) * 0x40000000
        : n >>> (30 - x);
}
function uuid6(clockseq) {
    const node = typeof crypto !== "undefined"
        ? crypto.getRandomValues(new Uint8Array(6))
        : [
            getRandomInt(8),
            getRandomInt(8),
            getRandomInt(8),
            getRandomInt(8),
            getRandomInt(8),
            getRandomInt(8),
        ];
    const uuid1 = (0, uuid_1.v1)({ node, clockseq });
    return convert1to6(uuid1);
}
exports.uuid6 = uuid6;
function convert1to6(uuid1) {
    // https://github.com/oittaa/uuid6-python/blob/main/src/uuid6/__init__.py#L81
    const hex = uuid1.replace(/-/g, "");
    const v6 = `${hex.slice(13, 16)}${hex.slice(8, 12)}${hex.slice(0, 1)}-${hex.slice(1, 5)}-6${hex.slice(5, 8)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    return v6;
}
exports.convert1to6 = convert1to6;
