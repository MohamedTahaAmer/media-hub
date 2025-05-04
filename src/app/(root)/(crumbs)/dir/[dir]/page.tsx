import { getFilesAndFolders } from "@/utils/create-thumbnails/get-files-and-folders"
import { getRootDir } from "@/utils/root-dir"
import path from "path"
import DisplayFiles from "../../_components/display-files"
import { logExecutionTime } from "@/utils"

const Page = async ({ params }: { params: { dir: string } }) => {
	const directoryName = decodeURIComponent(params.dir)
	const directoryPath = path.join(getRootDir(), directoryName)
	let filesAndFolders = await logExecutionTime(() => getFilesAndFolders(directoryPath), "getFilesAndFolders")
	if (typeof filesAndFolders === "string") return <div>{filesAndFolders}</div>

	return (
		<>
			<DisplayFiles filesAndFolders={filesAndFolders} directoryName={directoryName} />
		</>
	)
}

export default Page
