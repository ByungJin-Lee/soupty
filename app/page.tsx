"use client";

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useState } from "react";

listen("log:chat", (e) => {
  console.log(e);
});

export default function Home() {
  const [txt, setText] = useState("");

  const handleClick = async () => {
    // const resp = await ipcService.soop.getStreamerStation("");
    // console.log(resp);

    await invoke("start_main_controller", {
      channelId: "yangdoki",
    });
  };

  const handleStop = async () => {
    await invoke("stop_main_controller");
  };

  return (
    <div>
      <button onClick={handleClick}>실행</button>
      <button onClick={handleStop}>중단</button>
      <input
        type="text"
        value={txt}
        onChange={(e) => setText(e.target.value)}
        // onKeyDown={(e) => e.key === "Enter" && handleClick()}
        name=""
        id=""
      />
    </div>
  );
}
