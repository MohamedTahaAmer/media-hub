import { env } from "@/env"
import { defineConfig } from "drizzle-kit"
export default defineConfig({
	schema: "./src/utils/db/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: env.SQLITE_DB_NAME,
	},
	verbose: true,
	strict: true,
})
