export type FilesAndFolders = {
	name: string
	isDirectory: boolean
	thumbnail: string | undefined
	size: string | undefined
}[]
export type UniqueStats = {
	size: number
	ctime: string
	mtime: string
}
export type Thumbnail = {
	id: number
	key: string
	stats: UniqueStats
}
