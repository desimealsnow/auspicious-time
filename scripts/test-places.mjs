/*
  Backend unit test for Google Places Autocomplete (v1 REST)
  Usage (PowerShell):
    $env:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_KEY"
    npm run test:places -- "Mum"
*/

import https from "node:https";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`${name} is not set in environment`);
  }
  return v;
}

function httpPostJson(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        path: `${u.pathname}${u.search}`,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 0, json: JSON.parse(raw) });
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const apiKey = requireEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  const input = process.argv.slice(2).join(" ") || "Mum";

  const url = "https://places.googleapis.com/v1/places:autocomplete";
  const body = {
    input,
    // Bias to India to make results deterministic-ish; adjust as needed
    locationBias: {
      rectangle: {
        low: { latitude: 6.0, longitude: 68.0 },
        high: { latitude: 36.0, longitude: 97.0 },
      },
    },
    includedPrimaryTypes: ["locality"],
    languageCode: "en",
    regionCode: "IN",
  };

  const { status, json } = await httpPostJson(url, body, {
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask":
      "suggestions.placePrediction.text,suggestions.placePrediction.placeId",
  });

  if (status !== 200) {
    console.error("HTTP", status, json);
    process.exit(2);
  }

  const suggestions = json.suggestions || [];
  if (!suggestions.length) {
    console.error("No suggestions returned.");
    console.error(JSON.stringify(json, null, 2));
    process.exit(3);
  }

  const first = suggestions[0]?.placePrediction;
  console.log("OK", {
    input,
    suggestion: first?.text?.text,
    placeId: first?.placeId,
    total: suggestions.length,
  });
}

main().catch((e) => {
  console.error("Test failed:", e?.message || e);
  process.exit(1);
});
