"use client";

import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

export const AppTracker = () => {
  useEffect(() => {
    Clarity.init("spfx9hp5xg");
  }, []);

  return null;
};
