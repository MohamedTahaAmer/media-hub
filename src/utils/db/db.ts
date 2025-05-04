import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"
import Database from "better-sqlite3"
import { env } from "@/env"
const sqlite = new Database(env.SQLITE_DB_NAME)
export const db = drizzle(sqlite)
export { schema }
