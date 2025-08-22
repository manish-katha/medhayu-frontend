"use client";

export function triggerTokenExpire() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("token-expired"));
  }
}
