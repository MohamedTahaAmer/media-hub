import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		SQLITE_DB_NAME: z.string().default("sqlite.db"),
	},

	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		SQLITE_DB_NAME: process.env.SQLITE_DB_NAME,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
})
