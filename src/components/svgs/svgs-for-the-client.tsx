"use client"

import type { LucideProps } from "lucide-react"
import { useEffect, useState } from "react"
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from "vscode-icons-js"
import DefaultFile from "./icons/DefaultFile"
import DefaultFolder from "./icons/DefaultFolder"
import DefaultFolderOpened from "./icons/DefaultFolderOpened"

// - we can't import these methods from the utils file, because they will be called from a client dynamic import, and it will work with absolute imports or with files that higher in the tree, the dynamically imported file must be in the same folder or lower in the tree from the importing file
let svgFileNameToTSX = (svgFileName: string) => {
	let camelCaseFileName = svgFileName.replace(/[_-]([a-z])/g, (match, p1: string) => p1.toUpperCase())
	const pascalCaseFileName = camelCaseFileName.charAt(0).toUpperCase() + camelCaseFileName.slice(1)
	return pascalCaseFileName.replace(".svg", "")
}

let getTSXIcon = async (name: string, defaultIcon: string) => {
	let tsxIconName = svgFileNameToTSX(name)
	try {
		let { default: Icon } = (await import(`./icons/${tsxIconName}`)) as { default: (_: LucideProps) => JSX.Element }
		return Icon
	} catch (error) {
		let { default: Icon } = (await import(`./icons/${defaultIcon}`)) as { default: (_: LucideProps) => JSX.Element }
		return Icon
	}
}

export let getIcon = async (name: string, type: "File" | "Folder" | "OpenFolder"): Promise<(_: LucideProps) => JSX.Element> => {
	if (type === "File") {
		let svgFileName = getIconForFile(name)
		if (!svgFileName) return getTSXIcon("", "DefaultFile")
		return getTSXIcon(svgFileName, "DefaultFile")
	} else if (type === "Folder") {
		let svgFileName = getIconForFolder(name)
		if (!svgFileName) return getTSXIcon("", "DefaultFolder")
		return getTSXIcon(svgFileName, "DefaultFolder")
	} else if (type === "OpenFolder") {
		let svgFileName = getIconForOpenFolder(name)
		if (!svgFileName) return getTSXIcon("", "DefaultFolderOpened")
		return getTSXIcon(svgFileName, "DefaultFolderOpened")
	}
	return getTSXIcon("", "DefaultFile")
}

type IconTypes = "File" | "Folder" | "OpenFolder"
interface SvgsForTheClientProps extends LucideProps {
	name: string
	type: IconTypes
}

const SvgsForTheClient = ({ name, type, ...props }: SvgsForTheClientProps) => {
	const [importedComponent, setImportedComponent] = useState<JSX.Element>(<SVGPlaceHolder type={type} {...props} />)
	useEffect(() => {
		const importComponent = async () => {
			const Icon = await getIcon(name, type)
			setImportedComponent(<Icon {...props} />)
		}

		void importComponent()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type, name])

	return importedComponent
}

let SVGPlaceHolder = ({ type, ...props }: Omit<SvgsForTheClientProps, "name">) => {
	if (type === "Folder") return <DefaultFolder {...props} />
	if (type === "OpenFolder") return <DefaultFolderOpened {...props} />
	return <DefaultFile {...props} />
}

export default SvgsForTheClient
