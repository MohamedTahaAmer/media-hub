import { db } from "@/utils/db/db"

/*
- Webpack error, if you imported db and didn't use it in the function, then you imported this function in a server action, webpack will throw an error

Failed to compile.
./src/utils/db/db.ts + 69 modules
Cannot get final name for export 'and' of ./node_modules/drizzle-orm/sql/expressions/index.js
*/
export function withNoDb() {
	return "no db"
}

// - you must use the db some where in the file so that webpack doesn't strip out the import completely and avoid causing the error you are trying to recreate
function withDb() {
	let x = db
}
