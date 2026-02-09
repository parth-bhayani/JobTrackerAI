/* eslint-disable @typescript-eslint/no-use-before-define */
import { _coerceToRunnable, } from "@langchain/core/runnables";
import { PregelNode } from "../pregel/read.js";
import { Channel, Pregel } from "../pregel/index.js";
import { EphemeralValue } from "../channels/ephemeral_value.js";
import { ChannelWrite, PASSTHROUGH } from "../pregel/write.js";
import { TAG_HIDDEN } from "../constants.js";
import { RunnableCallable } from "../utils.js";
export const START = "__start__";
export const END = "__end__";
export class Branch {
    constructor(options) {
        Object.defineProperty(this, "condition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ends", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.condition = options.path;
        this.ends = Array.isArray(options.pathMap)
            ? options.pathMap.reduce((acc, n) => {
                acc[n] = n;
                return acc;
            }, {})
            : options.pathMap;
    }
    compile(writer, reader) {
        return ChannelWrite.registerWriter(new RunnableCallable({
            func: (input, config) => this._route(input, config, writer, reader),
        }));
    }
    async _route(input, config, writer, reader) {
        let result = await this.condition(reader ? reader(config) : input, config);
        if (!Array.isArray(result)) {
            result = [result];
        }
        let destinations;
        if (this.ends) {
            destinations = result.map((r) => this.ends[r]);
        }
        else {
            destinations = result;
        }
        if (destinations.some((dest) => !dest)) {
            throw new Error("Branch condition returned unknown or null destination");
        }
        return writer(destinations);
    }
}
export class Graph {
    constructor() {
        Object.defineProperty(this, "nodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "edges", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "branches", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "entryPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "compiled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "supportMultipleEdges", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.nodes = {};
        this.edges = new Set();
        this.branches = {};
    }
    warnIfCompiled(message) {
        if (this.compiled) {
            console.warn(message);
        }
    }
    get allEdges() {
        return this.edges;
    }
    addNode(key, action) {
        this.warnIfCompiled(`Adding a node to a graph that has already been compiled. This will not be reflected in the compiled graph.`);
        if (key in this.nodes) {
            throw new Error(`Node \`${key}\` already present.`);
        }
        if (key === END) {
            throw new Error(`Node \`${key}\` is reserved.`);
        }
        this.nodes[key] = _coerceToRunnable(action);
        return this;
    }
    addEdge(startKey, endKey) {
        this.warnIfCompiled(`Adding an edge to a graph that has already been compiled. This will not be reflected in the compiled graph.`);
        if (startKey === END) {
            throw new Error("END cannot be a start node");
        }
        if (endKey === START) {
            throw new Error("START cannot be an end node");
        }
        if (!this.supportMultipleEdges &&
            Array.from(this.edges).some(([start]) => start === startKey)) {
            throw new Error(`Already found path for ${startKey}`);
        }
        this.edges.add([startKey, endKey]);
        return this;
    }
    addConditionalEdges(source, path, pathMap) {
        const options = typeof source === "object" ? source : { source, path: path, pathMap };
        this.warnIfCompiled("Adding an edge to a graph that has already been compiled. This will not be reflected in the compiled graph.");
        // find a name for condition
        const name = options.path.name || "condition";
        // validate condition
        if (this.branches[options.source] && this.branches[options.source][name]) {
            throw new Error(`Condition \`${name}\` already present for node \`${source}\``);
        }
        // save it
        if (!this.branches[options.source]) {
            this.branches[options.source] = {};
        }
        this.branches[options.source][name] = new Branch(options);
        return this;
    }
    /**
     * @deprecated use `addEdge(START, key)` instead
     */
    setEntryPoint(key) {
        this.warnIfCompiled("Setting the entry point of a graph that has already been compiled. This will not be reflected in the compiled graph.");
        return this.addEdge(START, key);
    }
    /**
     * @deprecated use `addEdge(key, END)` instead
     */
    setFinishPoint(key) {
        this.warnIfCompiled("Setting a finish point of a graph that has already been compiled. This will not be reflected in the compiled graph.");
        return this.addEdge(key, END);
    }
    compile({ checkpointer, interruptBefore, interruptAfter, } = {}) {
        // validate the graph
        this.validate([
            ...(Array.isArray(interruptBefore) ? interruptBefore : []),
            ...(Array.isArray(interruptAfter) ? interruptAfter : []),
        ]);
        // create empty compiled graph
        const compiled = new CompiledGraph({
            builder: this,
            checkpointer,
            interruptAfter,
            interruptBefore,
            autoValidate: false,
            nodes: {},
            channels: {
                [START]: new EphemeralValue(),
                [END]: new EphemeralValue(),
            },
            inputs: START,
            outputs: END,
            streamChannels: [],
            streamMode: "values",
        });
        // attach nodes, edges and branches
        for (const [key, node] of Object.entries(this.nodes)) {
            compiled.attachNode(key, node);
        }
        for (const [start, end] of this.edges) {
            compiled.attachEdge(start, end);
        }
        for (const [start, branches] of Object.entries(this.branches)) {
            for (const [name, branch] of Object.entries(branches)) {
                compiled.attachBranch(start, name, branch);
            }
        }
        return compiled.validate();
    }
    validate(interrupt) {
        // assemble sources
        const allSources = new Set([...this.allEdges].map(([src, _]) => src));
        for (const [start] of Object.entries(this.branches)) {
            allSources.add(start);
        }
        // validate sources
        for (const node of Object.keys(this.nodes)) {
            if (!allSources.has(node)) {
                throw new Error(`Node \`${node}\` is a dead-end`);
            }
        }
        for (const source of allSources) {
            if (source !== START && !(source in this.nodes)) {
                throw new Error(`Found edge starting at unknown node \`${source}\``);
            }
        }
        // assemble targets
        const allTargets = new Set([...this.allEdges].map(([_, target]) => target));
        for (const [start, branches] of Object.entries(this.branches)) {
            for (const branch of Object.values(branches)) {
                if (branch.ends) {
                    for (const end of Object.values(branch.ends)) {
                        allTargets.add(end);
                    }
                }
                else {
                    allTargets.add(END);
                    for (const node of Object.keys(this.nodes)) {
                        if (node !== start) {
                            allTargets.add(node);
                        }
                    }
                }
            }
        }
        // validate targets
        for (const node of Object.keys(this.nodes)) {
            if (!allTargets.has(node)) {
                throw new Error(`Node \`${node}\` is not reachable`);
            }
        }
        for (const target of allTargets) {
            if (target !== END && !(target in this.nodes)) {
                throw new Error(`Found edge ending at unknown node \`${target}\``);
            }
        }
        // validate interrupts
        if (interrupt) {
            for (const node of interrupt) {
                if (!(node in this.nodes)) {
                    throw new Error(`Interrupt node \`${node}\` is not present`);
                }
            }
        }
        this.compiled = true;
    }
}
export class CompiledGraph extends Pregel {
    constructor({ builder, ...rest }) {
        super(rest);
        Object.defineProperty(this, "builder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.builder = builder;
    }
    attachNode(key, node) {
        this.channels[key] = new EphemeralValue();
        this.nodes[key] = new PregelNode({
            channels: [],
            triggers: [],
        })
            .pipe(node)
            .pipe(new ChannelWrite([{ channel: key, value: PASSTHROUGH }], [TAG_HIDDEN]));
        this.streamChannels.push(key);
    }
    attachEdge(start, end) {
        if (end === END) {
            if (start === START) {
                throw new Error("Cannot have an edge from START to END");
            }
            this.nodes[start].writers.push(new ChannelWrite([{ channel: END, value: PASSTHROUGH }], [TAG_HIDDEN]));
        }
        else {
            this.nodes[end].triggers.push(start);
            this.nodes[end].channels.push(start);
        }
    }
    attachBranch(start, name, branch) {
        // add hidden start node
        if (start === START && this.nodes[START]) {
            this.nodes[START] = Channel.subscribeTo(START, { tags: [TAG_HIDDEN] });
        }
        // attach branch writer
        this.nodes[start].pipe(branch.compile((dests) => {
            const channels = dests.map((dest) => dest === END ? END : `branch:${start}:${name}:${dest}`);
            return new ChannelWrite(channels.map((channel) => ({ channel, value: PASSTHROUGH })), [TAG_HIDDEN]);
        }));
        // attach branch readers
        const ends = branch.ends
            ? Object.values(branch.ends)
            : Object.keys(this.nodes);
        for (const end of ends) {
            if (end !== END) {
                const channelName = `branch:${start}:${name}:${end}`;
                this.channels[channelName] =
                    new EphemeralValue();
                this.nodes[end].triggers.push(channelName);
                this.nodes[end].channels.push(channelName);
            }
        }
    }
}
