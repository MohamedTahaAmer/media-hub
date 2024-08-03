import { getFilesAndFolders } from "@/utils/get-files-and-folders"
import path from "path"
import DisplayFiles from "../../../_components/display-files"
import { env } from "@/env"

const Page = async ({ params }: { params: { dir: string } }) => {
	const directoryName = decodeURIComponent(params.dir)
	const directoryPath = path.join(env.ROOT_DIR, directoryName)
	const filesAndFolders = await getFilesAndFolders(directoryPath)

	return (
		<>
			<DisplayFiles filesAndFolders={filesAndFolders} directoryName={directoryName} />
		</>
	)
}

export default Page
