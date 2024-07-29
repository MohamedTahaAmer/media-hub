import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const thumbnails = sqliteTable("thumbnails", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	key: text("key").unique(),
	stats: text("stats", { mode: "json" }),
})
