import { WebviewOptions } from "@tauri-apps/api/webview";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { WindowOptions } from "@tauri-apps/api/window";

export const openWebviewWindow = async (
  id: string,
  label: string,
  url: string,
  option?: Omit<WebviewOptions, "x" | "y" | "width" | "height"> & WindowOptions
) => {
  const webview = new WebviewWindow(id, {
    ...option,
    url,
    visible: true,
    title: label,
  });

  return webview;
};
