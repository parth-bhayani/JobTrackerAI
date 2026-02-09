import { load } from "@langchain/core/load";
export interface SerializerProtocol<D> {
    stringify(obj: D): string;
    parse(data: string): Promise<D>;
}
export declare const DefaultSerializer: {
    stringify: {
        (value: any, replacer?: ((this: any, key: string, value: any) => any) | undefined, space?: string | number | undefined): string;
        (value: any, replacer?: (string | number)[] | null | undefined, space?: string | number | undefined): string;
    };
    parse: typeof load;
};
