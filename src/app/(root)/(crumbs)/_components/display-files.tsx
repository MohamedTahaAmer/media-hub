"use client"
import SvgsForTheClient from "@/components/svgs/svgs-for-the-client"
import { Checkbox } from "@/components/ui/checkbox"
import { toastErrorMessage, toastSuccessMessage } from "@/lib/toast-helpers"
import { cn } from "@/lib/utils"
import type { FilesAndFolders } from "@/utils/create-thumbnails/types"
import { DownloadIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import path from "path"
import { useEffect, useRef, useState } from "react"
import { getFirstLevelFilesFromDir } from "./actions"

export function readableBytesToNumber(size: string): number {
	const units = ["B", "KB", "MB", "GB", "TB"]
	const regex = /^(\d+(?:\.\d+)?)\s?([a-zA-Z]+)$/
	const matches = size.match(regex)

	if (!matches?.length) {
		throw new Error("Invalid size format")
	}

	const value = parseFloat(matches[1]!)
	const unit = matches[2]!.toUpperCase()
	const exponent = units.indexOf(unit)

	if (exponent === -1) {
		throw new Error("Invalid unit")
	}

	return value * Math.pow(1024, exponent)
}

const DisplayFiles = ({ filesAndFolders, directoryName = "" }: { filesAndFolders: FilesAndFolders; directoryName?: string }) => {
	type FileToDownload = { name: string; size: string }
	const [checkedFiles, setCheckedFiles] = useState<Array<FileToDownload>>([])
	const [checkedFolders, setCheckedFolders] = useState<string[]>([])
	const [fileToDownload, setFileToDownload] = useState<string | null>(null)
	const linkRef = useRef<HTMLAnchorElement>(null)

	useEffect(() => {
		if (!linkRef.current) return
		if (!fileToDownload) return
		// - this will download the current file in the fileToDownload state
		linkRef.current.click()
	}, [fileToDownload])

	let handleDownloadClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		// - Collect all files to download from checked files and folders first level files
		let filesToDownload: FileToDownload[] = []
		if (checkedFolders.length) {
			try {
				for (let folder of checkedFolders) {
					let rowFiles = await getFirstLevelFilesFromDir(folder)
					let filesWithFullPath = rowFiles.map((file) => ({ ...file, name: encodeURIComponent(path.join(folder, file.name)) }))
					filesToDownload.push(...filesWithFullPath)
				}
			} catch (error) {
				toastErrorMessage(error)
			}
		}
		if (checkedFiles.length) {
			filesToDownload.push(...checkedFiles)
		}

		// - Initiate download for each file
		let downloadedFiles = 0
		let totalFiles = filesToDownload.length
		let totalFilesSize = filesToDownload.reduce((acc, file) => acc + readableBytesToNumber(file.size), 0)
		const LOCAL_WIFI_SPEED_PER_SEC = readableBytesToNumber("5 MB")
		let downloadedFilesSize = 0
		for (let file of filesToDownload) {
			setFileToDownload(file.name)
			let fileSize = readableBytesToNumber(file.size)
			// - wait for the download to finish, estimated time is based on the file size and the local wifi speed, then toast the message and start the loop for the next download
			await new Promise((resolve) => setTimeout(resolve, (fileSize / LOCAL_WIFI_SPEED_PER_SEC) * 1000))
			downloadedFiles++
			downloadedFilesSize += fileSize
			toastSuccessMessage(`${downloadedFiles} of ${totalFiles} -- ${Math.round((downloadedFilesSize / totalFilesSize) * 100)}%`)
		}
	}

	type HandleCheckboxClick = {
		({ e, isDirectory, name }: { e: React.MouseEvent<HTMLButtonElement, MouseEvent>; isDirectory: true; name: string }): void
		({ e, isDirectory, name, size }: { e: React.MouseEvent<HTMLButtonElement, MouseEvent>; isDirectory: false; name: string; size: string }): void
	}
	let handleCheckboxClick: HandleCheckboxClick = ({
		e,
		isDirectory,
		name,
		size,
	}: {
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
		isDirectory: boolean
		name: string
		size?: string
	}) => {
		if (!isDirectory && size === undefined) {
			throw new Error("Size is required when isDirectory is false.")
		}
		e.stopPropagation()
		let target = e.target as HTMLInputElement
		// - this getAttribute returns the current state of the checkbox, before ShadCN state updates, so we have to negate it to match the new state
		let checked = !(target.getAttribute("aria-checked") === "true")
		if (checked) {
			isDirectory ? setCheckedFolders((prev) => [...prev, name]) : setCheckedFiles((prev) => [...prev, { name, size: size! }])
		} else {
			isDirectory ? setCheckedFolders((prev) => prev.filter((folder) => folder !== name)) : setCheckedFiles((prev) => prev.filter((file) => file.name !== name))
		}
	}

	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{filesAndFolders.map((item) => (
				<div key={item.name} className="relative overflow-hidden rounded-md pb-2 shadow-xl shadow-slate-200 dark:shadow-slate-800">
					{/* Folders*/}
					{item.isDirectory && (
						<>
							<Link prefetch={false} href={`/dir/${encodeURIComponent(path.join(directoryName, item.name))}`}>
								<SvgsForTheClient name={item.name} type="Folder" className={cn("-m-4 aspect-[4/3]")} />
							</Link>
							<DisplayTitle isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />
							<Checkbox
								id="terms"
								className="absolute right-4 top-4 size-8 shadow-lg shadow-slate-400"
								onClick={(e) => handleCheckboxClick({ e, isDirectory: true, name: `${directoryName}/${item.name}` })}
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
								onClick={(e) => handleCheckboxClick({ e, isDirectory: false, name: encodeURIComponent(`${directoryName}/${item.name}`), size: item.size! })}
							/>
						</>
					)}

					{/* Files without thumbnails */}
					{!item.isDirectory && !item.thumbnail && (
						<>
							<Link href={`/dir/${encodeURIComponent(path.join(directoryName, item.name))}`}>
								<SvgsForTheClient name={item.name} type={item.isDirectory ? "Folder" : "File"} className={cn("aspect-[16/9]")} />
							</Link>
							<DisplayTitle isDirectory={item.isDirectory} name={item.name} dir={encodeURIComponent(path.join(directoryName, item.name))} />
							<Footer fullDir={encodeURIComponent(path.join(directoryName, item.name))} size={item.size ?? ""} />
							<Checkbox
								id="terms"
								className="absolute right-4 top-4 size-8 shadow-lg shadow-slate-400"
								onClick={(e) => handleCheckboxClick({ e, isDirectory: false, name: encodeURIComponent(`${directoryName}/${item.name}`), size: item.size! })}
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
			{/* - This link is used to hold the state of the current file to download then programmatically click it to download the file */}
			<Link ref={linkRef} href={`/api/download/file/${fileToDownload}`} prefetch={false} />
		</div>
	)
}

export default DisplayFiles

function DynamicImage({ name, width, height }: { name: string; width: number; height: number }) {
	let Host = "192.168.1.106"
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
