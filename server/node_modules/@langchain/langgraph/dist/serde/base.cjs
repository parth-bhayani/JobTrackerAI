"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSerializer = void 0;
const load_1 = require("@langchain/core/load");
exports.DefaultSerializer = {
    stringify: JSON.stringify,
    parse: load_1.load,
};
