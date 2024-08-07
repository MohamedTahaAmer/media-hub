export let globalCache = globalThis as unknown as {
	rootDir: string
	didCleanUp: boolean
}
