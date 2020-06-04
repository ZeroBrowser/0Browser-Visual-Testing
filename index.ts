import { Helper } from "./puppeteerHelper";
import fs = require('fs');
import { PathLike } from 'fs';
import * as BlinkDiff from 'blink-diff';

class Startup {

    constructor() {

    }

    public async main() {

        let baseImageName: PathLike = "before-deployment.png";
        let newImageName: PathLike = "after-deployment.png";

        let helper = new Helper();
        await helper.init();
        let page = await helper.goto('https://www.0browser.com');
        
        await helper.delay(4000);

        if (fs.existsSync(baseImageName))
            await page.screenshot({ path: newImageName });

        await this.detectChange(baseImageName, newImageName);

        await page.screenshot({ path: baseImageName });

        //we are done
        await helper.close();
    }


    async detectChange(beforDeploymentImage: string, afterDeploymentImage: string) {
        if (fs.existsSync(beforDeploymentImage)) {

            var diff = new BlinkDiff({
                imageAPath: beforDeploymentImage, // Use file-path
                imageBPath: afterDeploymentImage,

                thresholdType: BlinkDiff.THRESHOLD_PERCENT,
                threshold: 0.01, // 1% threshold
                //delta: 10,
                //perceptual: true,
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
