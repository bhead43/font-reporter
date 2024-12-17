import { resourceGetItem, resourceItemSave, resourceGetTreeLevel, generateAPIKey } from "./chili.js";
import { buildURL, getResourceInfo, jsonifyChiliResponse, buildResultFileName} from "./utils.js";
import { readFileSync, existsSync, mkdirSync, writeFileSync, appendFileSync } from "fs";
const config = JSON.parse(readFileSync("./config.json").toString());
const resultFileName = buildResultFileName(config.environment, config.startingDirectory);

// Get API key
let apikey;
let baseurl = buildURL(config.environment, config.sandbox);
console.log(baseurl);
// Check if credentials were supplied, otherwise use direct API key
if (!(config.user === "")) {
    const apikeyResult = await generateAPIKey(config.user, config.pass, config.environment, baseurl);
    if (!apikeyResult.isOK) {
        throw apikeyResult.error;
    }
    apikey = apikeyResult.response;
} else {
    apikey = config.apikey;
}

// Grab all document IDs in a given directory
const initTreeFetch = await resourceGetTreeLevel('documents', encodeURIComponent(config.startingDirectory), apikey, baseurl);
const initTree = initTreeFetch.isOK ? initTreeFetch.response : "FAILED";
if (initTree == "FAILED") {
    throw new Error(initTreeFetch.error);
}
const resources = await getResourceInfo(initTree, 'documents', [], apikey, baseurl);

const fonts = [];

// Cycle through each document, add found fonts to a list
for(let i = 0; i < resources.length; i++){
    let docFetch = await resourceGetItem("documents", resources[i], apikey, baseurl);
    if (!docFetch.isOK) {
        throw docFetch.error;
    }
    let docXML = docFetch.response;

    // Grab the <fonts> element out of the string, could skip this but makes things simpler just dealing with a simple XML
    const fontStart = docXML.indexOf("<fonts>") + 7;
    let fontEnd = docXML.indexOf("</fonts>");
    // jsonifyChiliResponse just parses XML as JSON
    let fontsJSON = jsonifyChiliResponse(docXML.substring(fontStart, fontEnd));

    // For each font in the base document:
    //  - Check if the font is in the swap list
    //  - If it is, add that XML string to the removals list and add XML string for new font to additions list
    try {
        fontsJSON.forEach(font => {
            // Check if this ID is already in the found font list
            let search = fonts.find(({id}) => id == font.id);
            if(search){
                // Check if config has a font search target
                if(config.fontToSearch === "" || font.name === config.fontToSearch){
                    search.documents.push(resources[i]);
                }
            } else {
                if(config.fontToSearch === "" || font.name === config.fontToSearch){
                    let foundFont = {id: font.id, name: font.name, documents: [resources[i]]};
                    fonts.push(foundFont);
                }
            }
        });
    } catch (e) {
        if(e instanceof TypeError) {
            let search = fonts.find(({id}) => id == fontsJSON.id);
            if(search) {
                if(config.fontToSearch === "" || fontsJSON.name === config.fontToSearch){
                    search.documents.push(resources[i]);
                }
            } else {
                if(config.fontToSearch === "" || fontsJSON.name === config.fontToSearch){
                    let foundFont = {id: fontsJSON.id, name: fontsJSON.name, documents: [resources[i]]};
                    fonts.push(foundFont);
                }
            }

        }
    }
}

// Write results to file
// Find/create output directory
if (!existsSync('./results')) {
    mkdirSync('./results');
}
// Create CSV with headers column to write to, replace if report already exists
writeFileSync(
    `./results/${resultFileName}`,
    'ID, Font Name, Documents'
);
// Append results of each resource to file
fonts.forEach(font => {
    appendFileSync(
        `./results/${resultFileName}`,
        `\n${font.id}, ${font.name}, ${font.documents.toString().replaceAll(",", " & ")}`
    );
});