import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Package } from "../models/Package";
import connectdb from "../db/index";
import { BIG_BULL_PACKAGES } from "./ensureBigBullPackages";

// Same DNS fix as server entrypoint (local resolvers often refuse mongodb+srv querySrv)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config({ path: "./.env" });

async function seedPackages() {
  try {
    console.log("🌱 Starting Big Bull Energies package seeding...");

    await connectdb();
    console.log("✅ Database connected");

    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }

    const deleted = await Package.deleteMany({});
    console.log(`🗑️  Removed ${deleted.deletedCount} existing package(s)`);

    const packages = await Package.insertMany(BIG_BULL_PACKAGES);
    console.log(`✅ Successfully seeded ${packages.length} packages`);

    console.log("\n📦 Seeded Packages:");
    packages.forEach((pkg, index) => {
      console.log(
        `${index + 1}. ${pkg.packageName} | $${pkg.minAmount}–$${pkg.maxAmount} | ROI ${pkg.roi}%/day | ${pkg.duration} days | status ${pkg.status}`,
      );
    });

    console.log("\n✨ Package seeding completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding packages:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

if (require.main === module) {
  seedPackages();
}

export { seedPackages };
