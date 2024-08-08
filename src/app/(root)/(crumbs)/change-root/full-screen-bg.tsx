import MediaHub from "@/components/svgs/media-hub"

const FullScreenBg = () => {
	return (
		<>
			<div className="fixed inset-0 flex items-center justify-center pt-40 blur-xl">
				<MediaHub
					style={{
						height: "calc(100vh - 4rem)",
					}}
				/>
			</div>
		</>
	)
}

export default FullScreenBg
