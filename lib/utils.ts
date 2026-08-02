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
    const file = new File([blob], filename, { type: "image/png" });

    // Native Mobile Share (iOS & Android PWAs)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      // Fire-and-forget: Do NOT await this. If we await it and the OS fails to return a resolve signal 
      // after the user switches apps, the UI will be permanently stuck in a "Printing..." loading state.
      navigator.share({
        files: [file],
        title: "Print Receipt",
      }).catch(e => {
        console.log("Share error:", e);
        // If the fetch took too long (cold start) and the browser revoked the user's click permission, fallback.
        if (e instanceof Error && e.name === "NotAllowedError") {
          const fallbackUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = fallbackUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
      return;
    }

    // Fallback for Desktop or unsupported browsers
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup memory safely after a generous delay
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);

  } catch (error) {
    console.error("Error printing image:", error);
    window.location.href = url; // Absolute final fallback
  }
}
