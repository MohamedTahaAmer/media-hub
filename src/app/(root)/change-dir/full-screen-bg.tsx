import MediaHub from "@/components/svgs/media-hub"

const FullScreenBg = () => {
	return (
		<>
			<div className="fixed inset-0 z-10 flex h-screen flex-col items-center justify-center pt-16 blur-xl">
				<MediaHub />
			</div>
		</>
	)
}

export default FullScreenBg
