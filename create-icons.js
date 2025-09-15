const fs = require("fs");
const path = require("path");

// Create a simple SVG icon
const createIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" fill="white"/>
  <text x="${size / 2}" y="${
  size / 2 + size / 20
}" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="${
  size / 8
}" font-weight="bold">AT</text>
</svg>`;

// Create 192x192 icon
fs.writeFileSync("public/icon-192x192.png", createIcon(192));

// Create 512x512 icon
fs.writeFileSync("public/icon-512x512.png", createIcon(512));

console.log(
  "Placeholder icons created! Replace with actual app icons before publishing."
);
