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

export const openWebviewWindowWithPayload = async (
  id: string,
  label: string,
  url: string,
  payload: () => unknown,
  option?: Omit<WebviewOptions, "x" | "y" | "width" | "height"> & WindowOptions
) => {
  const webview = new WebviewWindow(id, {
    ...option,
    url,
    visible: true,
    title: label,
  });

  webview.once(id, () => {
    const data = payload();
    webview.emit(id + ":data", data);
  });

  return webview;
};
