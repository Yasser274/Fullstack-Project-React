import { toast, Bounce, type ToastOptions, type ToastContent } from "react-toastify";

// .One place for the toast settings
// before this every toast repeated the same position/autoClose/theme/transition options (about 12 copies)
// and each component needed useTheme() just for the toast theme, now it reads the current theme from <html data-theme>

const baseOptions = (): ToastOptions => ({
   position: "top-center",
   autoClose: 4000,
   transition: Bounce,
   pauseOnHover: true,
   // read it at the moment the toast shows so it always matches the current theme
   theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
});

export const notify = {
   success: (message: ToastContent, options?: ToastOptions) => toast.success(message, { ...baseOptions(), ...options }),
   error: (message: ToastContent, options?: ToastOptions) => toast.error(message, { ...baseOptions(), ...options }),
   info: (message: ToastContent, options?: ToastOptions) => toast.info(message, { ...baseOptions(), ...options }),
};
