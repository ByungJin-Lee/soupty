"use client";

import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export default function Home() {
  const [txt, setText] = useState("");

  const handleClick = async () => {
    const result = await invoke("analyze_chat", {
      text: txt,
    });

    console.log(result);
  };

  return (
    <div>
      <button onClick={handleClick}>한번</button>
      <input
        type="text"
        value={txt}
        onChange={(e) => setText(e.target.value)}
        name=""
        id=""
      />
    </div>
  );
}
