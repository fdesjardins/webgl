const puppeteer = require('puppeteer')
const fs = require('fs/promises')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const main = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setViewport({ width: 512, height: 512 })
  await page.goto('http://localhost:1234/#/julia-fractal')

  await wait(5000)

  await page.screenshot({ path: 'ss.png' })

  await browser.close()
}

const main2 = async () => {
  const pages = await fs.readdir('src/pages')
  console.log(pages)
  for (const page of pages) {
    const index = await fs.readFile(`src/pages/${page}/index.js`)
    const title = index
      .toString()
      .match(/title: ['"].*/g)[0]
      .split("'")
      .slice(1)
      .join('')
      .replace(',', '')
    console.log(title)
  }
}

main()
