import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		SQLITE_DB_NAME: z.string().default("sqlite.db"),
		ROOT_DIR: z.string().default("/media/mohamed/640/DOWNLOADS/IDM/videos"),
		UPLOAD_DIR: z.string().default("/media/mohamed/640/Recordings/Uploads"),
	},

	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		SQLITE_DB_NAME: process.env.SQLITE_DB_NAME,
		ROOT_DIR: process.env.ROOT_DIR,
		UPLOAD_DIR: process.env.UPLOAD_DIR,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
})
