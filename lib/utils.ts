import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function printImage(url: string, filename: string) {
  try {
    // 1. Fetch the image just to trigger our UI loading state and ensure it's generated
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    
    // 2. Instead of using Blob/DataURLs or navigator.share (which backgrounds the PWA and causes freezes),
    // we use a hidden iframe. Since the API returns Content-Disposition: attachment,
    // the browser will natively download the file without unloading the PWA or launching an intent!
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      // Desktop: Attempt to print the image directly
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
    }

    // Cleanup iframe after a generous delay (15s) to ensure download starts
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 15000);

  } catch (error) {
    console.error("Error printing image:", error);
    window.location.href = url; // Absolute fallback
  }
}
