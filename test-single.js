const testData = {
  dobISO: "1989-07-24T06:35:00.000Z",
  targetISO: "2024-01-15T10:30:00.000Z",
  lat: 28.6139,
  lon: 77.209,
  tz: "Asia/Kolkata",
  activity: "general",
};

console.log("Testing single request...");

fetch("http://localhost:3000/api/astrology/enhanced", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(testData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error("Error:", error);
  });
