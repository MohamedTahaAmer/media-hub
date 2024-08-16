"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRootDir } from "@/hooks/zustand/rootDir"
import { toastErrorMessage, toastInfoMessage, toastSuccessMessage } from "@/lib/toast-helpers"
import { handleRootChange } from "./actions"

const UpdateRoot = () => {
	let { setRootDir, rootDir } = useRootDir()
	let newRootInput = "new-root"

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		let form = event.target as HTMLFormElement
		let formData = new FormData(form)
		let newRoot = formData.get(newRootInput) as string
		if (newRoot === rootDir) {
			toastInfoMessage("New Root Folder is same as the current Root Folder")
			return
		}
		try {
			let res = await handleRootChange(newRoot)
			toastSuccessMessage(res)
			setRootDir(newRoot)
			form.reset()
		} catch (error) {
			toastErrorMessage(error)
		}
	}
	return (
		<Card className="w-[480px] shrink-0">
			<CardHeader>
				<CardTitle>Update Root Folder</CardTitle>
				<CardDescription className="truncate">
					Your Current Root Folder Is:
					<br />
					{rootDir}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id="change-root-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col space-y-1.5">
					<Label htmlFor={newRootInput}>New Root</Label>
					<Input id={newRootInput} name={newRootInput} placeholder="Enter Your New Root Folder" required />
				</form>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline">Cancel</Button>
				<Button form="change-root-form" type="submit">
					Update
				</Button>
			</CardFooter>
		</Card>
	)
}

export default UpdateRoot
