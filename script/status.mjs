import mongoose from "mongoose";
import fetch from "node-fetch";
import cron from "node-cron";
import Numbers from "../models/Numbers.js";
import Country from "../models/Countires.js";
import Panel from "../models/Panel.js"; // Panel schema
import CronStatus from "../models/Cron.js"; // Cron status model

// 🔗 MongoDB connection - use local MongoDB from .env.local
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mydatabase";
await mongoose.connect(MONGO_URI);

// 🔎 Ensure "India" exists in Country collection with all required fields
async function getIndiaId() {
  let country = await Country.findOne({ name: "india" });
  if (!country) {
    // Create India country with all required fields
    country = await Country.create({
      name: "india",
      flag: "🇮🇳", // Default flag emoji
      code: "IN", // Country code
      dial: 91 // Country dial code
    });
    console.log("🆕 Country 'India' created in DB");
  }
  return country._id;
}

// 🚀 Sync function
async function syncGatewayStatus() {
  try {
    // 📌 Fetch Panel URL from DB
    const panel = await Panel.findOne({ code: 1 });
    if (!panel || !panel.url) {
      console.error("❌ No panel URL found in DB (code:1)");
      return;
    }

    const GATEWAY_URL = panel.url;
    console.log(`🌐 Using Gateway URL: ${GATEWAY_URL}`);

    const res = await fetch(GATEWAY_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Validate JSON structure
    if (!data.status || !Array.isArray(data.status)) {
      throw new Error("Invalid JSON response: missing or invalid status array");
    }

    const ports = data.status;
    const indiaId = await getIndiaId();

    // Collect all numbers returned by the API
    const apiNumbers = ports.filter(p => p.inserted === 1 && p.sn).map(p => p.sn);

    for (const p of ports) {
      if (p.inserted === 1 && p.sn) {
        const isActive = p.st === 3 || p.st === 7;

        const updated = await Numbers.findOneAndUpdate(
          { number: p.sn }, // match by SIM phone number
          {
            $set: {
              countryid: indiaId,
              port: p.port,
              iccid: p.iccid || null,
              imsi: p.imsi || null,
              operator: p.opr || null,
              signal: isActive ? p.sig || 0 : 0,
              locked: p.active === 0,
              lastRotation: new Date(),
              active: isActive,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (updated.wasNew) {
          console.log(`🆕 Added new number: ${p.sn} (Port ${p.port})`);
        } else {
          console.log(`🔄 Updated number: ${p.sn} (Port ${p.port})`);
        }
      }
    }

    // ⚠️ Mark numbers not in API response as inactive
    const result = await Numbers.updateMany(
      { number: { $nin: apiNumbers } },
      { $set: { active: false, signal: 0 } }
    );
    console.log(`🔒 Marked ${result.modifiedCount} numbers as inactive`);

    console.log(`[${new Date().toISOString()}] ✅ Synced ${ports.length} ports`);
    
    // Update cron status
    await CronStatus.findOneAndUpdate(
      { name: "syncGatewayStatus" },
      { lastRun: new Date() },
      { upsert: true, new: true }
    );
    
  } catch (err) {
    console.error("❌ Error syncing:", err.message);
  }
}

// Prevent overlapping runs
let running = false;

// 🕒 Run every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
  if (running) {
    console.log("⏭ Previous run still in progress — skipping this tick");
    return;
  }
  running = true;

  console.log("\n==============================");
  console.log("⏳ Gateway sync start:", new Date().toISOString());

  try {
    await syncGatewayStatus();
    console.log("⏹ Gateway sync finished:", new Date().toISOString());
  } catch (err) {
    console.error("❌ Gateway sync runtime error:", err);
  } finally {
    running = false;
  }
});
