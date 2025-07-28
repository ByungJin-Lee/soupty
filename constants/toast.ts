import { DefaultToastOptions } from "react-hot-toast";

export const toastOptions: DefaultToastOptions = {
  success: {
    style: {
      background: "green",
    },
  },
  error: {
    style: {
      background: "red",
      color: "white",
    },
  },
};
