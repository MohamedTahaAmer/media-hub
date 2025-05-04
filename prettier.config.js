/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
	plugins: ["prettier-plugin-tailwindcss"],
	singleQuote: false,
	jsxSingleQuote: false,
	useTabs: true,
	semi: false,
	printWidth: 160,
	trailingComma: "all",
}

export default config
