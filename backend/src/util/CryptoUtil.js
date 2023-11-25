export function jsonToBase64(object) {
    const json = JSON.stringify(object);
    return Buffer.from(json).toString("base64");
}

export function base64toJson(base64String) {
    const json = Buffer.from(base64String, "base64").toString();
    return JSON.parse(json);
}

export function publicEncrypt(pubKey, token) {
    return crypto.publicEncrypt(pubKey, Buffer.from(token));
}

export function publicDecrypt(pubKey, token) {
    return crypto.publicDecrypt(pubKey, token);
}

// Admin-Certified AP
// TO-DO:: object equality check will be implemented 
export function verifyACAP(data, encryptedData) {
    return data == publicDecrypt(adminKey, encryptedData);
}

// PU-Certified AP
// TO-DO:: object equality check will be implemented 
export function verifyPUAP(APData, encryptedAPData, PUData, encryptedPUData) {
    if (PUData == publicDecrypt(adminKey, encryptedPUData)) {
        const PUPubkey = PUData.PUPubkey;
        return APData == publicDecrypt(PUPubkey, encryptedAPData);
    }
    return false;
}