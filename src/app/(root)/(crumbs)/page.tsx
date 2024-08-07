import { getFilesAndFolders } from "@/utils/create-thumbnails/get-files-and-folders"
import { getRootDir } from "@/utils/root-dir"
import DisplayFiles from "./_components/display-files"
import { cleanupOldThumbnails } from "@/utils/create-thumbnails/cleanup-old-thumbnails"

export default async function Home() {
	const filesAndFolders = await getFilesAndFolders(getRootDir())
	void cleanupOldThumbnails(getRootDir())

	return <DisplayFiles filesAndFolders={filesAndFolders} />
}
