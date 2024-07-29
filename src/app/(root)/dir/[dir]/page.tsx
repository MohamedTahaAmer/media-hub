import { getFilesAndFolders } from "@/utils"
import { rootDir } from "@/utils/constants"
import path from "path"
import DisplayFiles from "../../_components/display-files"

const Page = async ({ params }: { params: { dir: string } }) => {
	console.log(params)
	const directoryName = decodeURIComponent(params.dir)
	const directoryPath = path.join(rootDir, directoryName)
	const filesAndFolders = await getFilesAndFolders(directoryPath)

	return (
		<>
			<DisplayFiles filesAndFolders={filesAndFolders} directoryName={directoryName} />
		</>
	)
}

export default Page
