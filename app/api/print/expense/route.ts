import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing expense ID", { status: 400 });
  }

  try {
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    const printUrl = `${baseUrl}/print/expense/${id}`;

    let browser;
    if (process.env.NODE_ENV === "development") {
      const puppeteerDev = (await import("puppeteer")).default;
      browser = await puppeteerDev.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
        ),
        headless: true,
      });
    }

    const page = await browser.newPage();
    
    // Forward cookies
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.split("=");
        return {
          name: name.trim(),
          value: rest.join("=").trim(),
          domain: host.split(":")[0],
          path: "/",
        };
      });
      await page.setCookie(...cookies);
    }
    
    await page.goto(printUrl, { waitUntil: "networkidle0" });

    const height = await page.evaluate(() => {
      return document.body.scrollHeight;
    });

    await page.setViewport({
      width: 384, // 58mm thermal printer standard
      height
    });

    const pngBuffer = await page.screenshot({
      type: "png",
      fullPage: true
    });

    await browser.close();

    return new NextResponse(Buffer.from(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="expense-voucher-${id}.png"`,
      },
    });
  } catch (error) {
    console.error("Error generating PNG:", error);
    return new NextResponse("Internal Server Error generating PNG", { status: 500 });
  }
}
