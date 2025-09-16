/*
  Simple backend test to verify Google Places Autocomplete REST endpoint works
  Usage:
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY npm run test:places -- "mumbai"
*/

import https from "node:https";

/**
 * Retrieves the value of an environment variable by its key.
 */
function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`${key} is not set`);
  }
  return val;
}

/**
 * Sends an HTTP GET request to the specified URL and returns the response data as a Promise.
 */
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

/**
 * Main function to fetch and display place information based on a query.
 *
 * It constructs a URL for the Google Places API using the provided query or defaults to "Mumbai".
 * The function then makes an HTTP GET request to the API, checks the response status, and logs the
 * name, formatted address, and location of the first result if the request is successful.
 *
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws Error If the Places API returns an error status.
 */
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
