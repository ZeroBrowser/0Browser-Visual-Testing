import { Helper } from "./puppeteerHelper";
import * as compare from 'dom-compare';
import fs = require('fs');
import { PathLike } from 'fs';
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class Startup {


    constructor() {

    }

    public async main() {

        let fileName: PathLike = "last-dom-body.txt";

        let helper = new Helper();
        await helper.init();
        let page = await helper.goto('https://medium.com/0browser');

        let selector = `div.js-collectionStream`;
        let currentContent = await helper.getHTML(selector);
        let oldContent: string = null;

        //if we have an older snapshot lets read and compare it with the new one
        if (fs.existsSync(fileName)) {
            oldContent = await this.getLastSnapshot(fileName);
        }

        await this.detectChange(oldContent, currentContent);

        //lets save the most updated html body
        await this.save(currentContent, fileName);

        //we are done
        await helper.close();
    }


    async detectChange(oldContent: String, currentContent: String) {
        //lets compare if we have an older version
        if (oldContent !== null) {
            var options = {
                stripSpaces: false,
                compareComments: false,
                collapseSpaces: false,
                normalizeNewlines: false
            };

            let oldDocument = new JSDOM(oldContent).window.document;;
            let currentDocument = new JSDOM(currentContent).window.document;;

            let result = compare.compare(oldDocument, currentDocument, options);

            if (result.getDifferences().length > 0) {
                console.log("Your page is changed !");

                // differences, grouped by node XPath
                let groupedDiff = compare.GroupingReporter.getDifferences(result);
                console.log(groupedDiff);
            }
            else
                console.log("Nothing changed!");
        }
    }

    async save(html: string, fileName: PathLike) {
        //lets save it to disk, prettify
        fs.writeFile(fileName, html, function (err) {
            if (err)
                throw err;

            console.log(`${fileName} Saved!`);
        });
    }

    async getLastSnapshot(fileName: PathLike): Promise<string> {
        return new Promise<string>((resolve, reject) =>
            fs.readFile(fileName, (err, data) => {
                //if has error reject, otherwise resolve
                return err ? reject(err) : resolve(data.toString());
            })
        );
    }

}

//start the app
new Startup().main();