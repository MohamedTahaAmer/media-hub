interface StaticImageData {
	src: string
	height: number
	width: number
	blurDataURL?: string
	blurWidth?: number
	blurHeight?: number
}
type StaticImport = StaticImageData

type X = {
	default: StaticImport // Replace with the appropriate type if necessary
}

declare namespace NodeJS {
	interface Require {
		context: (
			directory: string,
			useSubdirectories: boolean,
			regExp: RegExp,
		) => {
			keys: () => string[]
			(id: string): X
		}
	}
}
