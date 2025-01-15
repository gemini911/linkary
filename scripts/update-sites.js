const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const GIST_URL =
  "https://gist.githubusercontent.com/gemini911/519fc49d3ec876684c42dada6f81a3da/raw/sites.json";
const OUTPUT_PATH = path.join(__dirname, "../../data/sites.json");

async function updateSites() {
  try {
    const response = await fetch(GIST_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch sites.json");
    }

    const data = await response.json();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log("Successfully updated sites.json");
  } catch (error) {
    console.error("Error updating sites:", error);
  }
}

// Run immediately and then every 24 hours
updateSites();
setInterval(updateSites, 24 * 60 * 60 * 1000);
