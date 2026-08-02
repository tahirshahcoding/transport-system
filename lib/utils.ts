import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function printPdf(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: force a file download. This allows the OS to open it via native PDF viewers 
      // or directly via Thermal Printer apps (like RawBT) which register as PDF handlers.
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } else {
      // Desktop: use a hidden iframe to directly pop up the native print dialog
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Cleanup
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            document.body.removeChild(iframe);
          }, 30000);
        }, 200);
      };
    }
  } catch (error) {
    console.error("Error printing PDF:", error);
    window.open(url, "_blank");
  }
}
