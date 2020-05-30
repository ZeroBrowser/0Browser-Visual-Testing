import { Browser, Page } from "./node_modules/@types/puppeteer";
import * as puppeteer from 'puppeteer-core';


export class Helper {
    browser: Browser;
    page: Page;

    constructor() {

    }

    async init() {
        console.log(puppeteer);
        this.browser = await puppeteer.connect({
            browserWSEndpoint:
                'wss://proxy.0browser.com?token={your-token}&timeout=160000',
        });
        console.info(`helper is initialized : ${this.browser.isConnected()}`);
        return this.browser;
    }

    async goto(url): Promise<Page> {
        this.page = await this.browser.newPage();
        this.page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        await this.page.setViewport({ width: 1280, height: 1000 });
        await this.page.goto(url);
        return this.page;
    }

    async pressEnter() {
        await Promise.all([
            this.page.keyboard.press(String.fromCharCode(13)),
            this.page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
    }

    async clickAjax(selector: string): Promise<Page> {
        await Promise.all([
            this.page.click(selector),
            this.page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
        return this.page;
    }

    async close() {
        await this.browser.close();
    }
}
