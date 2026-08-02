import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function printImage(url: string, filename: string) {
  try {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS) {
      // iOS PWA fix: Synchronous window.open opens an ephemeral modal with a "Done" button.
      // Doing this synchronously avoids the strict Safari popup blocker.
      // The user can print from the modal's native share button and safely return to the app.
      window.open(url, "_blank");
      return;
    }

    // Android / Desktop flow
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    const isMobile = /Android|webOS|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
    }

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 15000);

  } catch (error) {
    console.error("Error printing image:", error);
    window.location.href = url;
  }
}
