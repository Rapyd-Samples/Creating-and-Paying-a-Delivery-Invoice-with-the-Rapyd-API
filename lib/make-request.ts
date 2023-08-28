import crypto from "crypto";

const secretKey = process.env.RAPYD_SECRET_KEY || "";
const accessKey = process.env.RAPYD_ACCESS_KEY || "";

function generateRandomString(size: number) {
  try {
    return crypto.randomBytes(size).toString("hex");
  } catch (error) {
    console.error("Error generating salt");
    throw error;
  }
}
function sign(
  method: string,
  urlPath: string,
  salt: string,
  timestamp: number,
  body: object | null
) {
  try {
    let bodyString = "";

    if (body) {
      bodyString = JSON.stringify(body);
      bodyString = bodyString == "{}" ? "" : bodyString;
    }

    const toSign =
      method.toLowerCase() +
      urlPath +
      salt +
      timestamp +
      accessKey +
      secretKey +
      bodyString;
    const hash = crypto.createHmac("sha256", secretKey).update(toSign);
    const signature = Buffer.from(hash.digest("hex")).toString("base64");

    return signature;
  } catch (error) {
    console.error("Error generating signature");
    throw error;
  }
}

export async function makeRequest(
  method: string,
  urlPath: string,
  body: object | null = null
) {
  try {
    const salt = generateRandomString(8);
    const idempotency = new Date().getTime().toString();
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = sign(method, urlPath, salt, timestamp, body);
    const response = await fetch(`https://sandboxapi.rapyd.net${urlPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        salt: salt,
        timestamp: `${timestamp}`,
        signature: signature,
        access_key: accessKey,
        idempotency: idempotency,
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    return response.json();
  } catch (error) {
    console.error("Error generating request options");
    throw error;
  }
}
