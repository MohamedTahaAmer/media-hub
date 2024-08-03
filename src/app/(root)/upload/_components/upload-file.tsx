"use client"
import SvgsForTheClient from "@/components/svgs/svgs-for-the-client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BadgeMinus, UploadCloud } from "lucide-react"
import Image from "next/image"
import React, { useRef, useState } from "react"

const UploadFile: React.FC = () => {
	const inputRef = useRef<HTMLInputElement>(null)
	const [files, setFiles] = useState<File[]>([])
	const [dragActive, setDragActive] = useState<boolean>(false)
	const [uploadProgress, setUploadProgress] = useState<number[]>([])
	const areFilesSelected = !!files.length

	const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault()
		setDragActive(false)
		const newFiles = Array.from(event.dataTransfer.files)
		setFiles((prevFiles) => [...prevFiles, ...newFiles])
	}

	const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newFiles = Array.from(event.target.files ?? [])
		setFiles((prevFiles) => [...prevFiles, ...newFiles])
	}

	let handleRemoveFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
	}

	// handle drag events
	const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true)
		} else if (e.type === "dragleave") {
			setDragActive(false)
		}
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const promises = files.map((file, index) => {
			return new Promise<void>((resolve, reject) => {
				const formData = new FormData()
				formData.append("file", file)

				const xhr = new XMLHttpRequest()
				xhr.open("POST", "/api/upload", true)

				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const progress = (event.loaded / event.total) * 100
						setUploadProgress((prevProgress) => {
							const newProgress = [...prevProgress]
							newProgress[index] = progress
							return newProgress
						})
					}
				}

				xhr.onload = () => {
					if (xhr.status === 200) {
						resolve()
					} else {
						reject(new Error("Failed to upload file(s)"))
					}
				}

				xhr.onerror = () => {
					reject(new Error("Error uploading file(s)"))
				}

				xhr.send(formData)
			})
		})

		try {
			await Promise.all(promises)
			console.log("File(s) uploaded successfully")
		} catch (error) {
			console.error("Error uploading file(s):", error)
			console.log("Failed to upload file(s)")
		}
	}

	return (
		<div
			style={{
				height: "calc(100vh - 64px)",
			}}
			className="flex max-w-7xl flex-col items-center justify-center gap-4 p-8"
		>
			<h1 className="text-center text-2xl font-bold">{!areFilesSelected ? "Upload Files" : "Files to be uploaded"}</h1>
			<form onSubmit={(e) => void handleSubmit(e)} encType="multipart/form-data" className="flex w-full grow flex-col gap-4">
				{!areFilesSelected && (
					<label
						htmlFor="dropzone-file"
						className={cn(
							"flex grow cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-center text-gray-500 transition dark:border-gray-600",
							{ "text-blue-500 dark:border-slate-400 dark:bg-slate-800": dragActive },
						)}
						onDrop={handleDrop}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						// onDragOver={(e) => e.preventDefault()}
					>
						<UploadCloud size={48} className="" />
						<span className=" ">
							Drag and drop files here
							<br className="md:hidden" /> or click to select files
						</span>
					</label>
				)}
				<input ref={inputRef} type="file" name="file" multiple onChange={handleFilesChange} className="hidden" id="dropzone-file"></input>
				{areFilesSelected && (
					<ul className="flex grow flex-col space-y-2 rounded-lg border-2 border-dashed border-slate-300 p-4 transition dark:border-gray-600 sm:px-8 md:px-16 lg:px-24">
						{files.map((file, index) => (
							<li key={index} className="flex justify-between gap-2">
								<div className="grow truncate">
									<span>{file.name}</span>
								</div>
								<span className="w-[67px] shrink-0 text-center">{uploadProgress[index] ? `${uploadProgress[index].toFixed(2)}%` : "0%"}</span>
								{file.type.startsWith("image") ? (
									<Image src={URL.createObjectURL(file)} alt={file.name} width={40} height={40} />
								) : (
									<SvgsForTheClient svgName={file.name} className="size-10" type="File" />
								)}
								{/* <DisplayImagePreview file={file} /> */}
								<Button variant="destructive" className="w-[48px] shrink-0" size="icon" onClick={() => handleRemoveFile(index)}>
									<BadgeMinus />
								</Button>
							</li>
						))}
					</ul>
				)}
				<div className="flex w-full justify-between">
					{areFilesSelected && <Button onClick={() => inputRef.current?.click()}>Select Files</Button>}
					<Button
						type="submit"
						disabled={!areFilesSelected}
						className="ml-auto rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-300 hover:bg-blue-600"
					>
						Upload
					</Button>
				</div>
			</form>
		</div>
	)
}

export default UploadFile
