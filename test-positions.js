const testData = {
  dobISO: "1989-07-24T06:35:00.000Z",
  targetISO: "2024-01-15T10:30:00.000Z",
  lat: 28.6139,
  lon: 77.209,
  tz: "Asia/Kolkata",
  activity: "general",
};

console.log("Testing planetary positions...");

// Test multiple times
const testTimes = [
  "2024-01-15T10:30:00.000Z", // Original time
  "2024-01-15T11:30:00.000Z", // +1 hour
  "2024-01-15T12:30:00.000Z", // +2 hours
  "2024-01-15T09:30:00.000Z", // -1 hour
  "2024-01-15T08:30:00.000Z", // -2 hours
];

async function testTime(time) {
  const data = { ...testData, targetISO: time };

  try {
    const response = await fetch(
      "http://localhost:3001/api/astrology/enhanced",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    return {
      time: time,
      score: result.activity?.score,
      panchang: result.activity?.breakdown?.panchangScore,
    };
  } catch (error) {
    return { time: time, error: error.message };
  }
}

async function runTests() {
  console.log("Testing different times...");

  for (const time of testTimes) {
    const result = await testTime(time);
    console.log(`${time}: Score=${result.score}, Panchang=${result.panchang}`);
  }
}

runTests();
