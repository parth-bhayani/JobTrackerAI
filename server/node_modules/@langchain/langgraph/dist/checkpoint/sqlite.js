import Database from "better-sqlite3";
import { BaseCheckpointSaver, } from "./base.js";
export class SqliteSaver extends BaseCheckpointSaver {
    constructor(db, serde) {
        super(serde);
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isSetup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.db = db;
        this.isSetup = false;
    }
    static fromConnString(connStringOrLocalPath) {
        return new SqliteSaver(new Database(connStringOrLocalPath));
    }
    setup() {
        if (this.isSetup) {
            return;
        }
        try {
            this.db.pragma("journal_mode=WAL");
            this.db.exec(`
CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id TEXT NOT NULL,
  checkpoint_id TEXT NOT NULL,
  parent_id TEXT,
  checkpoint BLOB,
  metadata BLOB,
  PRIMARY KEY (thread_id, checkpoint_id)
);`);
        }
        catch (error) {
            console.log("Error creating checkpoints table", error);
            throw error;
        }
        this.isSetup = true;
    }
    async getTuple(config) {
        this.setup();
        const thread_id = config.configurable?.thread_id;
        const checkpoint_id = config.configurable?.checkpoint_id;
        if (checkpoint_id) {
            try {
                const row = this.db
                    .prepare(`SELECT checkpoint, parent_id, metadata FROM checkpoints WHERE thread_id = ? AND checkpoint_id = ?`)
                    .get(thread_id, checkpoint_id);
                if (row) {
                    return {
                        config,
                        checkpoint: (await this.serde.parse(row.checkpoint)),
                        metadata: (await this.serde.parse(row.metadata)),
                        parentConfig: row.parent_id
                            ? {
                                configurable: {
                                    thread_id,
                                    checkpoint_id: row.parent_id,
                                },
                            }
                            : undefined,
                    };
                }
            }
            catch (error) {
                console.log("Error retrieving checkpoint", error);
                throw error;
            }
        }
        else {
            const row = this.db
                .prepare(`SELECT thread_id, checkpoint_id, parent_id, checkpoint, metadata FROM checkpoints WHERE thread_id = ? ORDER BY checkpoint_id DESC LIMIT 1`)
                .get(thread_id);
            if (row) {
                return {
                    config: {
                        configurable: {
                            thread_id: row.thread_id,
                            checkpoint_id: row.checkpoint_id,
                        },
                    },
                    checkpoint: (await this.serde.parse(row.checkpoint)),
                    metadata: (await this.serde.parse(row.metadata)),
                    parentConfig: row.parent_id
                        ? {
                            configurable: {
                                thread_id: row.thread_id,
                                checkpoint_id: row.parent_id,
                            },
                        }
                        : undefined,
                };
            }
        }
        return undefined;
    }
    async *list(config, limit, before) {
        this.setup();
        const thread_id = config.configurable?.thread_id;
        let sql = `SELECT thread_id, checkpoint_id, parent_id, checkpoint, metadata FROM checkpoints WHERE thread_id = ? ${before ? "AND checkpoint_id < ?" : ""} ORDER BY checkpoint_id DESC`;
        if (limit) {
            sql += ` LIMIT ${limit}`;
        }
        const args = [thread_id, before?.configurable?.checkpoint_id].filter(Boolean);
        try {
            const rows = this.db.prepare(sql).all(...args);
            if (rows) {
                for (const row of rows) {
                    yield {
                        config: {
                            configurable: {
                                thread_id: row.thread_id,
                                checkpoint_id: row.checkpoint_id,
                            },
                        },
                        checkpoint: (await this.serde.parse(row.checkpoint)),
                        metadata: (await this.serde.parse(row.metadata)),
                        parentConfig: row.parent_id
                            ? {
                                configurable: {
                                    thread_id: row.thread_id,
                                    checkpoint_id: row.parent_id,
                                },
                            }
                            : undefined,
                    };
                }
            }
        }
        catch (error) {
            console.log("Error listing checkpoints", error);
            throw error;
        }
    }
    async put(config, checkpoint, metadata) {
        this.setup();
        try {
            const row = [
                config.configurable?.thread_id,
                checkpoint.id,
                config.configurable?.checkpoint_id,
                this.serde.stringify(checkpoint),
                this.serde.stringify(metadata),
            ];
            this.db
                .prepare(`INSERT OR REPLACE INTO checkpoints (thread_id, checkpoint_id, parent_id, checkpoint, metadata) VALUES (?, ?, ?, ?, ?)`)
                .run(...row);
        }
        catch (error) {
            console.log("Error saving checkpoint", error);
            throw error;
        }
        return {
            configurable: {
                thread_id: config.configurable?.thread_id,
                checkpoint_id: checkpoint.id,
            },
        };
    }
}
