import mongoose from "mongoose";
import { Package } from "../models/Package";

/** Canonical Big Bull Energies packages (brochure / Our Plan). */
export const BIG_BULL_PACKAGES = [
  {
    packageName: "Package 1",
    minAmount: "10",
    maxAmount: "9999",
    duration: 200,
    roi: 1.0,
    totalOutputPct: 200,
    referralPct: 10,
    levelOneReferral: 10,
    binaryPct: 12,
    binaryBonus: 12,
    renewablePrinciplePct: 70,
    principleReturn: 70,
    powerCapacity: "2000",
    cappingLimit: "2000",
    status: "Active" as const,
  },
  {
    packageName: "Package 2",
    minAmount: "10000",
    maxAmount: "24999",
    duration: 180,
    roi: 1.4,
    totalOutputPct: 252,
    referralPct: 11,
    levelOneReferral: 11,
    binaryPct: 12,
    binaryBonus: 12,
    renewablePrinciplePct: 80,
    principleReturn: 80,
    powerCapacity: "4000",
    cappingLimit: "4000",
    status: "Active" as const,
  },
  {
    packageName: "Package 3",
    minAmount: "25000",
    maxAmount: "44999",
    duration: 160,
    roi: 1.8,
    totalOutputPct: 288,
    referralPct: 12,
    levelOneReferral: 12,
    binaryPct: 12,
    binaryBonus: 12,
    renewablePrinciplePct: 90,
    principleReturn: 90,
    powerCapacity: "8000",
    cappingLimit: "8000",
    status: "Active" as const,
  },
  {
    packageName: "Package 4",
    minAmount: "45000",
    maxAmount: "74999",
    duration: 140,
    roi: 2.2,
    totalOutputPct: 308,
    referralPct: 13,
    levelOneReferral: 13,
    binaryPct: 12,
    binaryBonus: 12,
    renewablePrinciplePct: 100,
    principleReturn: 100,
    powerCapacity: "12000",
    cappingLimit: "12000",
    status: "Active" as const,
  },
  {
    packageName: "Package 5",
    minAmount: "75000",
    maxAmount: "150000",
    duration: 120,
    roi: 2.6,
    totalOutputPct: 312,
    referralPct: 13,
    levelOneReferral: 13,
    binaryPct: 12,
    binaryBonus: 12,
    renewablePrinciplePct: 100,
    principleReturn: 100,
    powerCapacity: "25000",
    cappingLimit: "25000",
    status: "Active" as const,
  },
];

const LEGACY_PACKAGE_NAMES = [
  "Solar Starter",
  "Power Growth",
  "Elite Energy",
  "Turbo Watt",
  "Solar Mini",
  "Basic $100",
  "Premium $2500",
];

/**
 * Upsert Big Bull packages and deactivate legacy Crown Bankers package names.
 * Safe to run on every server boot.
 */
export async function ensureBigBullPackages(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    console.warn("[Packages] Skipping ensure — MongoDB not connected");
    return;
  }

  for (const pkg of BIG_BULL_PACKAGES) {
    await Package.findOneAndUpdate(
      { packageName: pkg.packageName },
      { $set: pkg },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const deactivated = await Package.updateMany(
    { packageName: { $in: LEGACY_PACKAGE_NAMES } },
    { $set: { status: "InActive" } },
  );

  const active = await Package.countDocuments({ status: "Active" });
  console.log(
    `[Packages] Ensured ${BIG_BULL_PACKAGES.length} Big Bull packages (${active} Active). Deactivated ${deactivated.modifiedCount} legacy package(s).`,
  );
}
