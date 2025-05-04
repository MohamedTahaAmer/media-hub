"use client"

import { ClipboardIcon, DeleteIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { addText, deleteTextEntry, getAllTextEntries } from "./actions"

const Page = () => {
	type TextEntry = {
		id: number
		content: string
	}[]
	const [textInput, setTextInput] = useState("")
	const [textEntries, setTextEntries] = useState<TextEntry>([])

	// Fetch the entries on component mount
	useEffect(() => {
		async function fetchData() {
			const entries = await getAllTextEntries()
			setTextEntries(entries)
		}
		void fetchData()
	}, [])

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (textInput.trim()) {
			await addText(textInput)
			setTextInput("") // Clear input
			const updatedEntries = await getAllTextEntries() // Fetch updated entries
			setTextEntries(updatedEntries) // Update the list
		}
	}

	const handleDelete = async (id: number) => {
		await deleteTextEntry(id)
		const updatedEntries = await getAllTextEntries()
		setTextEntries(updatedEntries)
	}

	// Copy to clipboard function
	const copyToClipboard = (content: string) => {
		void navigator.clipboard.writeText(content)
	}

	return (
		<div className="mx-auto max-w-xl p-4">
			<form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
				<input
					type="text"
					value={textInput}
					onChange={(e) => setTextInput(e.target.value)}
					placeholder="Enter some text"
					className="w-full rounded-md border px-4 py-2 shadow-sm"
				/>
				<button type="submit" className="rounded-md bg-blue-500 px-4 py-2 text-white">
					Add Text
				</button>
			</form>

			<div className="mt-8 space-y-2">
				{textEntries.map((entry) => (
					<div key={entry.id} className="flex items-center justify-between rounded-md border px-4 py-2 shadow-sm">
						<span>{entry.content}</span>
						<div className="flex gap-4">
							<ClipboardIcon className="size-5 cursor-pointer text-gray-500" onClick={() => copyToClipboard(entry.content)} />
							<button onClick={() => void handleDelete(entry.id)} className="text-red-500">
								<XIcon className="size-5 rounded-full border-2 border-red-400" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default Page
