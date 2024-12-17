import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { resourceGetTreeLevel } from "./chili.js";

export function jsonifyChiliResponse(response, namePrefix = "") {
    const fastXmlParser = new XMLParser({
        ignoreAttributes: false,
        attrNodeName: false,
        attributeNamePrefix: namePrefix,
    });

    let data = fastXmlParser.parse(response);
    const firstKeys = Object.keys(data);
    if (firstKeys.length == 1) {
        if (typeof data[firstKeys[0]] == "object") {
            data = data[firstKeys[0]];
        }
    }
    return data;
}

export function buildURL(environment, isSandbox = false) {
    if(!isSandbox){
        return `https://${environment}.chili-publish.online/rest-api/v1.2`;
    } else {
        return `https://${environment}.chili-publish-sandbox.online/rest-api/v1.2`
    }
}

// Recursively search tree, return found document IDs
export async function getResourceInfo(tree, type, resources, apikey, baseurl) {
    // Check if directory is empty
    if (tree.item != null) {
        // Check if multiple items in directory
        if (tree.item.length != null) {
            for (let i = 0; i < tree.item.length; i++) {
                if (tree.item[i].isFolder != "true") {
                    resources.push(tree.item[i].id);
                }
                else {
                    // Search next tree down
                    let newTree = await resourceGetTreeLevel(type, encodeURIComponent(tree.item[i].path), apikey, baseurl)
                    let newTreeResult = newTree.isOK ? newTree.response : "FAILED";
                    if (newTreeResult != "FAILED") {
                        resources.concat(await getResourceInfo(newTreeResult, type, resources, apikey, baseurl));
                    }
                    else {
                        throw new Error(newTree.error);
                    }
                }
            }
        }
        // Handles edge case of there only being one item in a directory
        else {
            if (tree.item.isFolder != "true") {
                resources.push(tree.item.id);
            }
            else {
                // Search next tree down
                let newTree = await resourceGetTreeLevel(type, encodeURIComponent(tree.item.path), apikey, baseurl)
                let newTreeResult = newTree.isOK ? newTree.response : "FAILED";
                if (newTreeResult != "FAILED") {
                    resources.concat(await getResourceInfo(newTreeResult, type, resources, apikey, baseurl));
                }
                else {
                    throw new Error(newTree.error);
                }
            }
        }
    }
    return resources;
}

// Build output CSV file name
export function buildResultFileName(environment, directory) {
    const regex = /[/\\ ]/;
    return `${environment}${(directory.replace(regex, "")) == "" ? "" : `_${directory}`}.csv`
}