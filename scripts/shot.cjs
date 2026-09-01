const puppeteer = require("puppeteer-core");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto("file://" + path.resolve(__dirname, "og-image.html"));
  await page.screenshot({ path: path.resolve(__dirname, "../public/og-image.png") });
  await browser.close();
  console.log("done");
})();
