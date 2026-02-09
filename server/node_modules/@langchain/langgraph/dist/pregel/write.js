import { CONFIG_KEY_SEND } from "../constants.js";
import { RunnableCallable } from "../utils.js";
export const SKIP_WRITE = {};
export const PASSTHROUGH = {};
const IS_WRITER = Symbol("IS_WRITER");
/**
 * Mapping of write channels to Runnables that return the value to be written,
 * or None to skip writing.
 */
export class ChannelWrite extends RunnableCallable {
    constructor(writes, tags) {
        const name = `ChannelWrite<${writes
            .map(({ channel }) => channel)
            .join(",")}>`;
        super({
            ...{ writes, name, tags },
            func: async (input, config) => this._write(input, config ?? {}),
        });
        Object.defineProperty(this, "writes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.writes = writes;
    }
    async _getWriteValues(input, config) {
        return Promise.all(this.writes
            .map((write) => ({
            channel: write.channel,
            value: write.value === PASSTHROUGH ? input : write.value,
            skipNone: write.skipNone,
            mapper: write.mapper,
        }))
            .map(async (write) => ({
            channel: write.channel,
            value: write.mapper
                ? await write.mapper.invoke(write.value, config)
                : write.value,
            skipNone: write.skipNone,
            mapper: write.mapper,
        }))).then((writes) => writes
            .filter((write) => !write.skipNone || write.value !== null)
            .reduce((acc, write) => {
            acc[write.channel] = write.value;
            return acc;
        }, {}));
    }
    async _write(input, config) {
        const values = await this._getWriteValues(input, config);
        ChannelWrite.doWrite(config, values);
    }
    static doWrite(config, values) {
        const write = config.configurable?.[CONFIG_KEY_SEND];
        write(Object.entries(values).filter(([_channel, value]) => value !== SKIP_WRITE));
    }
    static isWriter(runnable) {
        return (
        // eslint-disable-next-line no-instanceof/no-instanceof
        runnable instanceof ChannelWrite ||
            (IS_WRITER in runnable && !!runnable[IS_WRITER]));
    }
    static registerWriter(runnable) {
        return Object.defineProperty(runnable, IS_WRITER, { value: true });
    }
}
