import { env } from "@/env"
import { create } from "zustand"

type RootDirStore = {
	rootDir: string
	setRootDir: (newRoot: string) => void
}
export const useRootDir = create<RootDirStore>((set) => ({
	rootDir: env.NEXT_PUBLIC_ROOT_DIR,
	setRootDir: (newRoot: string) => set({ rootDir: newRoot }),
}))
