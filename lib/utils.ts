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
      // Mobile: Force download. The OS will notify the user, and they can open it directly 
      // in their RawBT thermal printer app which handles PNGs beautifully.
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
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
