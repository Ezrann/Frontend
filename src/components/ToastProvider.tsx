"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#1f2937",
          color: "#ffffff",
        },
        success: {
          style: {
            background: "#065f46",
          },
        },
        error: {
          style: {
            background: "#7f1d1d",
          },
        },
      }}
    />
  );
}
