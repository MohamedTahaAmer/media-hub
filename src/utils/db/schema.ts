import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const thumbnails = sqliteTable("thumbnails", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	key: text("key").unique().notNull(),
	stats: text("stats", { mode: "json" }),
	thumbnailWidth: int("thumbnail-width").notNull(),
	thumbnailHeight: int("thumbnail-height").notNull(),
})
