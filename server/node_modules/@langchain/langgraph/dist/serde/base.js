import { load } from "@langchain/core/load";
export const DefaultSerializer = {
    stringify: JSON.stringify,
    parse: load,
};
