import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "./schema"
import { Database } from "bun:sqlite"
import { env } from "@/env"
const sqlite = new Database(env.SQLITE_DB_NAME)
export const db = drizzle(sqlite)
export { schema }
