export type FilesAndFolders = {
	name: string
	isDirectory: boolean
	thumbnail: { name: string; width: number; height: number } | undefined
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
	thumbnailWidth: number
	thumbnailHeight: number
}
