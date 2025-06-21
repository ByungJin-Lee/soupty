"use client";

import { useState } from "react";
import { ipcService } from "~/services/ipc";

export default function Home() {
  const [txt, setText] = useState("");

  const handleClick = async () => {
    const resp = await ipcService.soop.getStreamerStation("");
    console.log(resp);
  };

  return (
    <div>
      <button onClick={handleClick}>한번</button>
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
