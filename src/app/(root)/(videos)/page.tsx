import { env } from "@/env"
import { getFilesAndFolders } from "@/utils/get-files-and-folders"
import DisplayFiles from "./_components/display-files"

export default async function Home() {
	const directoryPath = env.ROOT_DIR
	const filesAndFolders = await getFilesAndFolders(directoryPath)
	return (
		<div>
			<DisplayFiles filesAndFolders={filesAndFolders} />
		</div>
	)
}
