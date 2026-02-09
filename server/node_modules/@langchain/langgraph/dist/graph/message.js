import { StateGraph } from "./state.js";
function addMessages(left, right) {
    const leftArray = Array.isArray(left) ? left : [left];
    const rightArray = Array.isArray(right) ? right : [right];
    return [...leftArray, ...rightArray];
}
export class MessageGraph extends StateGraph {
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
