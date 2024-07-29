import { getFilesAndFolders } from "@/utils/get-files-and-folders"
import { rootDir } from "@/utils/constants"
import DisplayFiles from "./_components/display-files"

export default async function Home() {
	const directoryPath = rootDir
	const filesAndFolders = await getFilesAndFolders(directoryPath)
	console.log(filesAndFolders)
	return (
		<div>
			<h1 className="mx-auto">Media Hub</h1>
			<DisplayFiles filesAndFolders={filesAndFolders} />
		</div>
	)
}
