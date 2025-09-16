/*
  Simple backend test to verify Google Places Autocomplete REST endpoint works
  Usage:
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY npm run test:places -- "mumbai"
*/

import https from "node:https";

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`${key} is not set`);
  }
  return val;
}

function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", (err) => reject(err));
  });
}

async function main() {
  const query = process.argv.slice(2).join(" ") || "Mumbai";
  const apiKey = getEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");

  // Places Autocomplete (new) endpoint via Maps JS WebService is not public; use Places API Text Search as sanity
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&key=${encodeURIComponent(apiKey)}`;

  const raw = await httpGet(url);
  const json = JSON.parse(raw);
  if (json.status !== "OK") {
    console.error("Places API error:", json.status, json.error_message || "");
    process.exit(2);
  }

  const first = json.results?.[0];
  console.log("OK", {
    query,
    name: first?.name,
    formatted_address: first?.formatted_address,
    location: first?.geometry?.location,
  });
}

main().catch((e) => {
  console.error("Test failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
