import { app } from "@tauri-apps/api";
import useSWR from "swr";

export const useAppVersion = () => {
  const { data } = useSWR("/version", () => app.getVersion());

  return data;
};
