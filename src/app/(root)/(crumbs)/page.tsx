import { getFilesAndFolders } from "@/utils/create-thumbnails/get-files-and-folders"
import { getRootDir } from "@/utils/root-dir"
import DisplayFiles from "./_components/display-files"
import { cleanupOldThumbnails } from "@/utils/create-thumbnails/cleanup-old-thumbnails"
import { logExecutionTime } from "@/utils"

export default async function Home() {
	let filesAndFolders = await logExecutionTime(() => getFilesAndFolders(getRootDir()), "getFilesAndFolders")
	// - the cleanup should be called after the files and folders are fetched, cause both of them will call getFilesAndFolders and I don't wanna to cause conflicts if I ran the cleanup on the background while fetching the files and folders for the current page
	void cleanupOldThumbnails(getRootDir())

	// - if the function returns a string, it means that there was an error
	if (typeof filesAndFolders === "string") return <div>{filesAndFolders}</div>
	return <DisplayFiles filesAndFolders={filesAndFolders} />
}
