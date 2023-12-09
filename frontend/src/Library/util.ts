export function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
export function stringToArrayBuffer(str: string): ArrayBuffer {
  // Encode the string as a Uint8Array
  const utf8Encoder = new TextEncoder();
  const uint8Array = utf8Encoder.encode(str);

  // Convert the Uint8Array to an ArrayBuffer
  return uint8Array.buffer;
}
export function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function base64ToJson(base64String: string): any {
  try {
    // Decode the Base64 string
    const decodedString = atob(base64String);

    // Parse the decoded string as JSON
    return JSON.parse(decodedString);
  } catch (error) {
    console.error("Error parsing Base64 string:", error);
    throw error;
  }
}
