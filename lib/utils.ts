import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function printImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: Attempt to use the Web Share API.
      // This pauses the app correctly until the user returns from the intent (e.g., RawBT printer)
      const file = new File([blob], filename, { type: "image/png" });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          // Fire and forget: do NOT await navigator.share. 
          // Some Android WebViews fail to resolve the promise when returning to the app, causing a "hang"
          navigator.share({
            files: [file],
            title: "Print Receipt",
          }).catch(e => console.log("Share cancelled or failed", e));
        } catch (e) {
          console.log("Share synchronous error", e);
        }
      } else {
        // Fallback if Web Share API is unavailable
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } else {
      // Desktop: Attempt to print the image directly via a hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = objectUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Cleanup
          setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            document.body.removeChild(iframe);
          }, 30000);
        }, 500);
      };
    }
  } catch (error) {
    console.error("Error printing image:", error);
    window.open(url, "_blank");
  }
}
