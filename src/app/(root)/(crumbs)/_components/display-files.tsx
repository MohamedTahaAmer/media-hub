"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { toastErrorMessage, toastSuccessMessage } from "@/lib/toast-helpers"
import { cn } from "@/lib/utils"
import type { FilesAndFolders } from "@/utils/create-thumbnails/types"
import { DownloadIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import path from "path"
import { useState } from "react"
import { getFirstLevelFilesFromDir } from "./actions"
import { downloadFile, readableBytesToNumber } from "./utils"
import { FileIcon, FolderIcon } from "react-files-icons"

const DisplayFiles = ({ filesAndFolders, directoryName = "" }: { filesAndFolders: FilesAndFolders; directoryName?: string }) => {
	type FileToDownload = { name: string; size: string; url: string }
	type ButtonClickEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>
	const [checkedFiles, setCheckedFiles] = useState<Array<FileToDownload>>([])
	const [checkedFolders, setCheckedFolders] = useState<string[]>([])

	let handleDownloadClick = async (e: ButtonClickEvent) => {
		// - Collect all files to download from checked files and folders first level files
		let filesToDownload: FileToDownload[] = []
		if (checkedFolders.length) {
			try {
				for (let folder of checkedFolders) {
					let rowFiles = await getFirstLevelFilesFromDir(folder)
					let filesWithFullPath = rowFiles.map((file) => ({ ...file, url: encodeURIComponent(path.join(folder, file.name)) }))
					filesToDownload.push(...filesWithFullPath)
				}
			} catch (error) {
				toastErrorMessage(error)
			}
		}
		if (checkedFiles.length) filesToDownload.push(...checkedFiles)

		let downloadedFiles = 0
		let downloadedFilesSize = 0
		const totalFiles = filesToDownload.length
		const totalFilesSize = filesToDownload.reduce((acc, file) => acc + readableBytesToNumber(file.size), 0)

		for (let file of filesToDownload) {
			await downloadFile(`/api/download/file/${file.url}`, file.name)
			let fileSize = readableBytesToNumber(file.size)
			downloadedFiles++
			downloadedFilesSize += fileSize
			toastSuccessMessage(`${downloadedFiles} of ${totalFiles} -- ${Math.round((downloadedFilesSize / totalFilesSize) * 100)}%`)
		}
	}

	type HandleCheckboxClick = {
		({ e, isDirectory, name, url }: { e: ButtonClickEvent; isDirectory: true; name: string; url: string }): void
		({ e, isDirectory, name, size, url }: { e: ButtonClickEvent; isDirectory: false; name: string; size: string; url: string }): void
	}
	let handleCheckboxClick: HandleCheckboxClick = ({
		e,
		isDirectory,
		name,
		size,
		url,
	}: {
		e: ButtonClickEvent
		isDirectory: boolean
		name: string
		size?: string
		url: string
	}) => {
		if (!isDirectory && size === undefined) throw new Error("Size is required when isDirectory is false.")
		e.stopPropagation()
		let target = e.target as HTMLInputElement
		// - this getAttribute returns the current state of the checkbox, before ShadCN state updates, so we have to negate it to match the new state
		let checked = !(target.getAttribute("aria-checked") === "true")
		if (checked) {
			isDirectory ? setCheckedFolders((prev) => [...prev, name]) : setCheckedFiles((prev) => [...prev, { name, size: size!, url }])
			return
		}
		isDirectory ? setCheckedFolders((prev) => prev.filter((folder) => folder !== name)) : setCheckedFiles((prev) => prev.filter((file) => file.name !== name))
	}

	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{filesAndFolders.map((item) => (
				<div key={item.name} className="relative overflow-hidden rounded-md pb-2 shadow-xl shadow-slate-200 dark:shadow-slate-800">
					{/* Folders*/}
					{item.isDirectory && (
						<>
							<Link prefetch={false} href={`/dir/${encodeURIComponent(path.join(directoryName, item.name))}`}>
								<FolderIcon name={item.name} className={cn("-m-4 aspect-[4/3]")} />
							</Link>
							<DisplayTitle isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />
							<Checkbox
								id="terms"
								className="absolute right-4 top-4 size-8 shadow-lg shadow-slate-400"
								onClick={(e) => handleCheckboxClick({ e, isDirectory: true, name: item.name, url: `${directoryName}/${item.name}` })}
							/>
						</>
					)}

					{/* Files with thumbnails */}
					{!item.isDirectory && item.thumbnail && (
						<>
							<div className="flex aspect-[16/9] items-center justify-center">
								<DynamicImage name={item.thumbnail.name} width={item.thumbnail.width} height={item.thumbnail.height} />
							</div>
							<DisplayTitle isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />
							<Footer fullDir={encodeURIComponent(path.join(directoryName, item.name))} size={item.size ?? ""} />
							<Checkbox
								id="terms"
								className="absolute right-4 top-4 size-8 shadow-lg shadow-slate-400"
								onClick={(e) =>
									handleCheckboxClick({ e, isDirectory: false, name: item.name, url: encodeURIComponent(`${directoryName}/${item.name}`), size: item.size! })
								}
							/>
						</>
					)}

					{/* Files without thumbnails */}
					{!item.isDirectory && !item.thumbnail && (
						<>
							<Link href={`/dir/${encodeURIComponent(path.join(directoryName, item.name))}`}>
								{item.isDirectory ? (
									<FolderIcon name={item.name} className={cn("-m-4 aspect-[4/3]")} />
								) : (
									<FileIcon name={item.name} className={cn("aspect-[16/9]")} />
								)}
							</Link>
							<DisplayTitle isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />
							<Footer fullDir={encodeURIComponent(path.join(directoryName, item.name))} size={item.size ?? ""} />
							<Checkbox
								id="terms"
								className="absolute right-4 top-4 size-8 shadow-lg shadow-slate-400"
								onClick={(e) =>
									handleCheckboxClick({ e, isDirectory: false, name: item.name, url: encodeURIComponent(`${directoryName}/${item.name}`), size: item.size! })
								}
							/>
						</>
					)}
				</div>
			))}
			{/* global download button */}
			{(checkedFiles.length > 0 || checkedFolders.length > 0) && (
				<div className="fixed bottom-4 right-4 flex items-center justify-between gap-2 px-2">
					<button onClick={(e) => void handleDownloadClick(e)} className="flex items-center gap-2 rounded-md bg-slate-300 p-2 dark:bg-slate-600">
						<DownloadIcon />
						<div className="flex gap-2">{checkedFiles.length + checkedFolders.length} Selected</div>
					</button>
				</div>
			)}
		</div>
	)
}

export default DisplayFiles

function DynamicImage({ name, width, height }: { name: string; width: number; height: number }) {
	let Host = "192.168.1.110"
	let port = "3001"
	let imgURL = `http://${Host}:${port}${name}`

	return (
		<Image src={imgURL} alt={`thumbnail for ${name}`} className={cn("object-contain", { grow: width / height === 16 / 9 })} width={width} height={height} />
	)
}

function DisplayTitle({ isDirectory, name, dir }: { isDirectory: boolean; name: string; dir: string }) {
	let baseEndPoint = isDirectory ? "/dir/" : "/api/download/file"
	return (
		<div className="truncate-two-lines pl-2">
			<Link prefetch={false} href={`${baseEndPoint}/${dir}`} className="font-bold">
				{name}
			</Link>
		</div>
	)
}

function Footer({ fullDir, size }: { fullDir: string; size: string }) {
	return (
		<>
			{/* size and download button for files */}
			<div className="py-5"></div>
			<div className="absolute bottom-2 flex w-full items-center justify-between gap-2 px-2">
				<Link href={`/api/download/file/${fullDir}`} prefetch={false} className="flex items-center gap-2 rounded-md bg-slate-300 p-2 dark:bg-slate-600">
					<DownloadIcon /> Download
				</Link>
				<div className="">{size}</div>
			</div>
		</>
	)
}
