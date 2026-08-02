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
    
    // Convert blob to Base64 Data URL to avoid ObjectURL memory/background crashing issues
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        const file = new File([blob], filename, { type: "image/png" });
        
        const fallbackToDownload = () => {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            navigator.share({
              files: [file],
              title: "Print Receipt",
            }).catch(e => {
              console.log("Share cancelled or failed", e);
              // If share fails because the API took too long (losing the user gesture context), it throws NotAllowedError.
              // AbortError is thrown if the user simply cancels the share sheet.
              if (e instanceof Error && e.name === "NotAllowedError") {
                fallbackToDownload();
              }
            });
          } catch (e) {
            console.log("Share synchronous error", e);
            fallbackToDownload();
          }
        } else {
          fallbackToDownload();
        }
      } else {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = dataUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Remove iframe after printing dialog is closed
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 5000);
        };
      }
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Error printing image:", error);
    window.open(url, "_blank");
  }
}
