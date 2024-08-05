"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { handleRootChange } from "./actions"

const UpdateRoot = ({ currentRootDir }: { currentRootDir: string }) => {
	const [rootDir, setRootDir] = useState(currentRootDir)
	useEffect(() => {
		setRootDir(currentRootDir)
	}, [currentRootDir])

	let inputId = "new-root"
	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		let form = event.currentTarget as HTMLFormElement
		let newRoot = (form[inputId] as HTMLInputElement).value
		try {
			let res = await handleRootChange(newRoot)

			toast(res, { richColors: true, style: { background: "green", color: "white" } })
			setRootDir(newRoot)
			form.reset()
		} catch (error: any) {
			if (error instanceof Error) {
				toast(error.message ?? "Sorry could not update root folder. Please try again", { richColors: true, style: { background: "red", color: "white" } })
			}
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
				<form id="change-root-form" onSubmit={(e) => void handleSubmit(e)}>
					<div className="grid w-full items-center gap-4">
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor={inputId}>New Root</Label>
							<Input id={inputId} placeholder="Enter Your New Root Folder" required />
						</div>
					</div>
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
