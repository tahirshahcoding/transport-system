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
    const file = new File([blob], filename, { type: "application/pdf" });

    // Use native share on mobile devices which gives access to "Print" and "Share to Printer" apps
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: filename,
      });
    } else {
      // Fallback for desktop: open blob URL
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      
      // Cleanup the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
  } catch (error) {
    console.error("Error printing PDF:", error);
    // Absolute fallback
    window.open(url, "_blank");
  }
}
