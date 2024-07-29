import { getFilesAndFolders } from "@/utils"
import { rootDir } from "@/utils/constants"
import Link from "next/link"
import DisplayFiles from "./_components/display-files"

export default async function Home() {
	const directoryPath = rootDir
	const filesAndFolders = await getFilesAndFolders(directoryPath)
	return (
		<div>
			<h1 className="mx-auto">Media Hub</h1>
			<DisplayFiles filesAndFolders={filesAndFolders} />
		</div>
	)
}
