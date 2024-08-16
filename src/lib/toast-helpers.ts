import { toast } from "sonner"

export function toastErrorMessage(error: unknown, message = "Sorry Something went wrong. Please try again") {
	if (error instanceof Error) {
		toast(error.message ?? message, {
			richColors: true,
			style: { background: "red", color: "white" },
		})
	}
}

export function toastSuccessMessage(message: string) {
	toast(message, { richColors: true, style: { background: "green", color: "white" } })
}

export function toastInfoMessage(message: string) {
	toast(message, { richColors: true })
}
