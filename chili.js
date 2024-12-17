import { jsonifyChiliResponse } from "./utils.js";

// Get API key
export async function generateAPIKey(user, pass, environment, url) {
    // Rewrite to better handle errors
    let result = {
        response: "",
        isOK: false,
        error: "",
    };

    try {
        const response = await fetch(
            url + `/system/apikey?environmentNameOrURL=${environment}`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ userName: user, password: pass }),
            },
        );

        if (!response.ok) {
            result.isOK = false;
            result.error = Error(`GenerateApiKey failed with message: ${response.status} ${response.statusText}, ${await response.text()}`);
        } else {
            const responseJSON = jsonifyChiliResponse(await response.text());
            if (responseJSON.succeeded == "false") {
                result.isOK = false;
                result.error = Error(responseJSON.errorMessage);
            } else {
                result.isOK = true;
                result.response = responseJSON.key;
            }
        }
    } catch (err) {
        result.isOK = false;
        result.error = err;
    }
    return result;
}

// Get docs from folder
export async function resourceGetTreeLevel(type, path, apikey, url) {
    let result = {
        response: "",
        isOK: false,
        error: ""
    };
    try {
        const response = await fetch(
            url + `/resources/${type}/treelevel?parentFolder=${path}&numLevels=1&includeSubDirectories=true&includeFiles=true`, {
            method: "GET",
            headers: {
                "api-key": apikey
            }
        }
        );
        if (!response.ok) {
            result.isOK = false;
            result.error = Error(`ResourceGetTreeLevel failed with message: ${response.status} ${response.statusText}, ${await response.text()}`);
        } else {
            const responseJSON = jsonifyChiliResponse(await response.text());
            result.isOK = true;
            result.response = responseJSON;
        }
    } catch (err) {
        result.isOK = false;
        result.error = err;
    }
    return result;
}

// Get document XML
export async function resourceGetItem(resourceType, id, apikey, url) {
    let result = {
        response: "",
        isOK: false,
        error: ""
    };

    try {
        const response = await fetch(url + `/resources/${resourceType}/items?itemIdOrPath=${id}`,{
                method: "GET",
                headers: {
                    "api-key": apikey
                }
        });

        if (!response.ok) {
            result.isOK = false;
            result.error = Error(`ResourceItemGetByIdOrPath failed with message: ${response.status} ${response.statusText}, ${await response.text()}`);
        } else {
            result.isOK = true;
            result.response = await response.text();
        }
    } catch (err) {
        result.isOK = false;
        result.error = err;
    }
    return result;
}

// Save document
export async function resourceItemSave(xml, id, apikey, url) {
    let result = {
        response: "",
        isOK: false,
        error: ""
    };
    try {
        const response = await fetch(
            url + `/resources/documents/items/${id}/save`, {
            method: "PUT",
            headers: {
                "api-key": apikey,
                "content-type": "application/xml"
            },
            body: `<?xml version="1.0"?><ResourceItemSaveBodyWrapper><xml><![CDATA[${xml}]]></xml></ResourceItemSaveBodyWrapper>`
        }
        );
        if (!response.ok) {
            result.isOK = false;
            result.error = Error(`ResourceItemSave failed with message: ${response.status} ${response.statusText}, ${await response.text()}`)
        } else {
            result.isOK = true;
            result.response = await response.text();
        }
    } catch (err) {
        result.isOK = false;
        result.error = err;
    }
    return result;
}
