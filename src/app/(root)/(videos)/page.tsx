import { getFilesAndFolders } from "@/utils/create-thumbnails/get-files-and-folders"
import { getRootDir } from "@/utils/root-dir"
import DisplayFiles from "./_components/display-files"

export default async function Home() {
	const filesAndFolders = await getFilesAndFolders(getRootDir())
	return (
		<div>
			<DisplayFiles filesAndFolders={filesAndFolders} />
		</div>
	)
}
