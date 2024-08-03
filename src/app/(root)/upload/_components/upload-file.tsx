"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UploadCloud } from "lucide-react"
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
			<form id="upload-files-form" onSubmit={(e) => void handleSubmit(e)} encType="multipart/form-data" className="flex w-full grow flex-col gap-4">
				{!areFilesSelected && (
					<label
						htmlFor="dropzone-file"
						className={cn(
							"group relative flex h-full w-full grow cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-center text-gray-500 transition dark:border-gray-600",
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
			</form>
			{areFilesSelected && (
				<>
					<div className="group relative flex size-full grow cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 transition dark:border-gray-600">
						<ul className="space-y-2">
							{files.map((file, index) => (
								<li key={index} className="flex justify-between">
									<span>{file.name}</span>
									<span>{uploadProgress[index] ? `${uploadProgress[index].toFixed(2)}%` : "0%"}</span>
									<Image
										src={URL.createObjectURL(file)}
										alt="close"
										width={16}
										height={16}
										className="cursor-pointer"
										onClick={() => setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index || i))}
									/>
								</li>
							))}
						</ul>
					</div>
				</>
			)}
			<div className="flex w-full justify-between">
				{areFilesSelected && <Button onClick={() => inputRef.current?.click()}>Select Files</Button>}
				<Button
					type="submit"
					disabled={!areFilesSelected}
					className="ml-auto rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-300 hover:bg-blue-600"
					form="upload-files-form"
				>
					Upload
				</Button>
			</div>
		</div>
	)
}

export default UploadFile
