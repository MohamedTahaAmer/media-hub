"use client"
import { useTheme } from "next-themes"
import Image from "next/image"

const ThemeToggleInLine = () => {
	const { theme, setTheme } = useTheme()
	function toggle() {
		theme === "dark" ? setTheme("light") : setTheme("dark")
	}
	return (
		<div
			className="relative flex h-[20px] w-[40px] cursor-pointer items-center justify-between rounded-full bg-foreground px-[3px] duration-300 hover:scale-110"
			onClick={toggle}
		>
			<span className="sr-only">Toggle theme</span>
			<Image src="/moon.png" alt="" width={14} height={14} />
			<div className="absolute right-1 size-[15px] rounded-full bg-background dark:left-1"></div>
			<Image src="/sun.png" alt="" width={14} height={14} />
		</div>
	)
}

export default ThemeToggleInLine
