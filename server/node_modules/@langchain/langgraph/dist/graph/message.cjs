"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageGraph = void 0;
const state_js_1 = require("./state.cjs");
function addMessages(left, right) {
    const leftArray = Array.isArray(left) ? left : [left];
    const rightArray = Array.isArray(right) ? right : [right];
    return [...leftArray, ...rightArray];
}
class MessageGraph extends state_js_1.StateGraph {
    constructor() {
        super({
            channels: {
                __root__: {
                    reducer: addMessages,
                    default: () => [],
                },
            },
        });
    }
}
exports.MessageGraph = MessageGraph;
