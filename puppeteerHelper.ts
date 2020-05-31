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

    async goto(url: string): Promise<Page> {
        this.page = await this.browser.newPage();
        this.page.on('console', msg => console.log('PAGE LOG:', (msg ? msg.text() : '')));
        await this.page.setViewport({ width: 1280, height: 1000 });
        await this.page.goto(url);
        this.page.setCacheEnabled(false);
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


    async getBody(): Promise<string> {
        const aHandle = await this.page.evaluateHandle(() => document.body);
        const resultHandle = await this.page.evaluateHandle(body => body.innerHTML, aHandle);
        let results: any = await resultHandle.jsonValue();
        await resultHandle.dispose();
        return results;
    }

    async getHTML(selector: string): Promise<string> {
        return this.page.$eval(selector, (element) => {
            return element.innerHTML
        });
    }

    async elementScreenshot(selector: string, fileName: string) {
        const el = await this.page.$(selector);
        await el.screenshot({ path: fileName });
    }

    async close() {
        await this.browser.close();
    }
}
