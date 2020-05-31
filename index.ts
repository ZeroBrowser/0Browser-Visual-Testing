import { Helper } from "./puppeteerHelper";
import fs = require('fs');
import { PathLike } from 'fs';
import * as BlinkDiff from 'blink-diff';

class Startup {

    constructor() {

    }

    public async main() {

        //let fileName: PathLike = "last-dom-body.txt";

        let baseImageName: PathLike = "base.png";
        let newImageName: PathLike = "new.png";

        let helper = new Helper();
        await helper.init();
        let page = await helper.goto('https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en');

        //let selector = `div.js-collectionStream`;
        let selector = 'div.xrnccd';

        await helper.elementScreenshot(selector, newImageName);

        await this.detectChange(baseImageName, newImageName);

        await helper.elementScreenshot(selector, baseImageName);

        //we are done
        await helper.close();
    }


    async detectChange(baseImageName: string, newImageName: string) {
        if (fs.existsSync(baseImageName)) {
            var diff = new BlinkDiff({
                imageAPath: baseImageName, // Use file-path
                imageBPath: newImageName,

                thresholdType: BlinkDiff.THRESHOLD_PERCENT,
                threshold: 0.01, // 1% threshold

                imageOutputPath: 'comparison.png'
            });

            diff.run(function (error, result) {
                if (error) {
                    throw error;
                } else {
                    console.log(diff.hasPassed(result.code) ? 'Passed' : 'Failed');
                    console.log('Found ' + result.differences + ' differences.');
                }
            });
        }
    }

}

//start the app
new Startup().main();