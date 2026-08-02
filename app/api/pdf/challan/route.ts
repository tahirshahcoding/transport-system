import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing challan ID", { status: 400 });
  }

  try {
    // Construct the URL to print
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    const printUrl = `${baseUrl}/print/challan/${id}`;

    let browser;
    // Check if we are running in local development
    if (process.env.NODE_ENV === "development") {
      // In development, require the standard puppeteer package (installed as devDependency)
      const puppeteerDev = (await import("puppeteer")).default;
      browser = await puppeteerDev.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      // In production (Vercel), use sparticuz/chromium-min and puppeteer-core
      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
        ),
        headless: true,
      });
    }

    const page = await browser.newPage();
    
    // Set viewport to a typical desktop size
    await page.setViewport({ width: 1200, height: 800 });

    // Forward cookies to bypass authentication (Better-Auth / NextAuth)
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.split("=");
        return {
          name: name.trim(),
          value: rest.join("=").trim(),
          domain: host.split(":")[0], // Extract domain without port
          path: "/",
        };
      });
      await page.setCookie(...cookies);
    }
    
    // Navigate to the print page and wait for network to be idle
    await page.goto(printUrl, { waitUntil: "networkidle0" });

    // Get the exact height of the content
    const contentHeight = await page.evaluate(() => {
      // Find the printable challan wrapper
      const wrapper = document.querySelector('div.w-\\[58mm\\]') || document.body.firstElementChild;
      return wrapper ? wrapper.getBoundingClientRect().height : document.documentElement.scrollHeight;
    });

    // Generate PDF for 58mm thermal receipt printer
    const pdfBuffer = await page.pdf({
      width: "58mm",
      height: `${contentHeight}px`,
      printBackground: true,
      margin: {
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
      }
    });

    await browser.close();

    // Return the PDF as a stream
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="challan-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Internal Server Error generating PDF", { status: 500 });
  }
}
