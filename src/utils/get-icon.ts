import type { LucideProps } from "lucide-react"
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from "vscode-icons-js"

let svgFileNameToTSX = (svgFileName: string) => {
	let camelCaseFileName = svgFileName.replace(/[_-]([a-z])/g, (match, p1: string) => p1.toUpperCase())
	const pascalCaseFileName = camelCaseFileName.charAt(0).toUpperCase() + camelCaseFileName.slice(1)
	return pascalCaseFileName.replace(".svg", "")
}

let getTSXIcon = async (svgName: string, defaultIcon: string) => {
	let tsxIconName = svgFileNameToTSX(svgName)

	try {
		let { default: Icon } = (await import(`@/components/svgs/icons/${tsxIconName}`)) as { default: (_: LucideProps) => JSX.Element }
		return Icon
	} catch (error) {
		// the 'vscode-icons-js' usually returns the default icon incase it didn't find a specific icon for the file, but some times it thinks it has the icon, but it doesn't, so we have to handle that case, by catching the error, and returning the default icon
		let { default: Icon } = (await import(`@/components/svgs/icons/${defaultIcon}`)) as { default: (_: LucideProps) => JSX.Element }
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
