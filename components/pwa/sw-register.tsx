"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Register SW only on secure contexts (https) or localhost.
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // Silently ignore registration issues.
      });
  }, []);

  return null;
}

