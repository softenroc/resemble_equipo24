const compareImages = require("resemblejs/compareImages")
const config = require("./config.json");
const fs = require('fs');

const { viewportHeight, viewportWidth, browsers, options } = config;

function scenario(index, info){
    return `<div class=" browser" id="test0">
    <div class=" btitle">
        <h2>Escenario #: ${index}</h2>
        <p>Data: ${JSON.stringify(info)}</p>
    </div>
    <div class="imgline">
      <div class="imgcontainer">
        <span class="imgname">Reference Ghost v3.41.1</span>
        <img class="img2" src="../ghost3_kraken/ghost3_1_${index}.png" id="refImage" label="Reference">
      </div>
      <div class="imgcontainer">
        <span class="imgname">Test Ghost 4.40.0</span>
        <img class="img2" src="../ghost4_kraken/ghost4_1_${index}.png" id="refImage" label="Reference">
      </div>
    </div>
    <div class="imgline">
      <div class="imgcontainer">
        <span class="imgname">Diff</span>
        <img class="imgfull" src="./compare_1_${index}.png" id="diffImage" label="Diff">
      </div>
    </div>
  </div>`
}

function createReport(datetime, resInfo){
    return `
    <html>
        <head>
            <title> Equipo 24 Kraken Compare report</title>
            <link href="index.css" type="text/css" rel="stylesheet">
        </head>
        <body>
            <h1>Report Before for 
                 <a href="${config.url_before}"> ${config.url_before}</a>
            </h1>
            <h1>Report After for 
            <a href="${config.url_after}"> ${config.url_after}</a>
       </h1>
            <p>Executed: ${datetime}</p>
            <div id="visualizer">
                ${config.scenarios.map(index=>scenario(index, resInfo[index]))}
            </div>
        </body>
    </html>`
}

async function executeValidateImagesAndCreateReport(){    
    let resultInfo = {}
    let datetime = new Date().toISOString().replace(/:/g,".");

        for (let index = 1; index < config.scenarios.length; index++) {          
  
        const data = await compareImages(
            fs.readFileSync(`./results/ghost3_kraken/ghost3_1_${index}.png`),
            fs.readFileSync(`./results/ghost4_kraken/ghost4_1_${index}.png`),
            options
        );
        resultInfo[index] = {
            isSameDimensions: data.isSameDimensions,
            dimensionDifference: data.dimensionDifference,
            rawMisMatchPercentage: data.rawMisMatchPercentage,
            misMatchPercentage: data.misMatchPercentage,
            diffBounds: data.diffBounds,
            analysisTime: data.analysisTime
        }
        fs.writeFileSync(`./results/compare/compare_1_${index}.png`, data.getBuffer());
        
      }


    fs.writeFileSync(`./results/compare/report.html`, createReport(datetime, resultInfo));
    fs.copyFileSync('./index.css', `./results/compare/index.css`);

    console.log('------------------------------------------------------------------------------------')
    console.log("Execution finished. Check the report under the results folder")
    return resultInfo;  
  }
(async ()=>console.log(await executeValidateImagesAndCreateReport()))();



