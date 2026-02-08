import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config();

const execAsync = promisify(exec);

// Production database URL
const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URL_PRODUCTION or MONGODB_URL_DEVELOPMENT not found in environment variables");
  process.exit(1);
}

// Create backup directory with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split(".")[0];
const backupDir = path.join(__dirname, "../../backups", `backup-${timestamp}`);
const jsonBackupDir = path.join(backupDir, "json");
const bsonBackupDir = path.join(backupDir, "bson");

async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    const maskedUri = MONGODB_URI.replace(/\/\/.*@/, "//***@");
    console.log(`   URI: ${maskedUri}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB!");
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB\n");
}

async function getAllCollections(): Promise<string[]> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }
  
  const collections = await db.listCollections().toArray();
  return collections.map(col => col.name);
}

async function exportCollectionToJSON(collectionName: string): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }

  const collection = db.collection(collectionName);
  const documents = await collection.find({}).toArray();
  
  // Convert ObjectId and other MongoDB types to JSON-serializable format
  const jsonData = JSON.stringify(documents, null, 2);
  
  const filePath = path.join(jsonBackupDir, `${collectionName}.json`);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  
  const count = documents.length;
  const sizeKB = (Buffer.byteLength(jsonData, "utf-8") / 1024).toFixed(2);
  console.log(`   ✓ ${collectionName}: ${count} documents (${sizeKB} KB)`);
}

async function exportAllCollectionsToJSON(): Promise<void> {
  console.log("📦 Exporting all collections to JSON...\n");
  
  const collections = await getAllCollections();
  console.log(`Found ${collections.length} collections:\n`);
  
  for (const collectionName of collections) {
    try {
      await exportCollectionToJSON(collectionName);
    } catch (error: any) {
      console.error(`   ✗ Error exporting ${collectionName}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ JSON export completed: ${collections.length} collections\n`);
}

async function exportWithMongodump(): Promise<boolean> {
  try {
    // Check if mongodump is available
    await execAsync("which mongodump");
    
    console.log("📦 Attempting mongodump export...\n");
    
    // Extract database name from URI
    const dbMatch = MONGODB_URI.match(/\/([^?]+)/);
    const dbName = dbMatch ? dbMatch[1] : "prod";
    
    // Create mongodump command
    // Note: mongodump handles connection strings directly
    const dumpCommand = `mongodump --uri="${MONGODB_URI}" --out="${bsonBackupDir}"`;
    
    console.log(`Running: mongodump --uri="***" --out="${bsonBackupDir}"\n`);
    
    const { stdout, stderr } = await execAsync(dumpCommand);
    
    if (stderr && !stderr.includes("writing")) {
      console.warn(`⚠️  mongodump warnings: ${stderr}`);
    }
    
    console.log("✅ mongodump completed successfully\n");
    return true;
  } catch (error: any) {
    if (error.message.includes("which mongodump")) {
      console.log("ℹ️  mongodump not found, skipping BSON export\n");
      return false;
    }
    console.warn(`⚠️  mongodump failed: ${error.message}\n`);
    return false;
  }
}

async function createBackupManifest(): Promise<void> {
  const collections = await getAllCollections();
  const db = mongoose.connection.db;
  
  const manifest = {
    timestamp: new Date().toISOString(),
    database: db?.databaseName || "unknown",
    uri: MONGODB_URI.replace(/\/\/.*@/, "//***@"),
    collections: collections.map(name => ({
      name,
      backupPath: `json/${name}.json`
    })),
    backupInfo: {
      jsonBackup: jsonBackupDir,
      bsonBackup: fs.existsSync(bsonBackupDir) ? bsonBackupDir : null,
      totalCollections: collections.length
    }
  };
  
  const manifestPath = path.join(backupDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`📄 Backup manifest created: manifest.json\n`);
}

async function main() {
  console.log("🚀 Starting Database Backup Process\n");
  console.log("=" .repeat(60) + "\n");
  
  try {
    // Create backup directories
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    if (!fs.existsSync(jsonBackupDir)) {
      fs.mkdirSync(jsonBackupDir, { recursive: true });
    }
    if (!fs.existsSync(bsonBackupDir)) {
      fs.mkdirSync(bsonBackupDir, { recursive: true });
    }
    
    console.log(`📁 Backup directory: ${backupDir}\n`);
    
    // Connect to database
    await connectDB();
    
    // Export all collections to JSON
    await exportAllCollectionsToJSON();
    
    // Try mongodump (optional, requires MongoDB tools)
    await exportWithMongodump();
    
    // Create manifest
    await createBackupManifest();
    
    // Disconnect
    await disconnectDB();
    
    console.log("=" .repeat(60));
    console.log("✅ BACKUP COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(60));
    console.log(`\n📁 Backup location: ${backupDir}`);
    console.log(`📊 JSON files: ${jsonBackupDir}`);
    if (fs.existsSync(bsonBackupDir) && fs.readdirSync(bsonBackupDir).length > 0) {
      console.log(`📦 BSON files: ${bsonBackupDir}`);
    }
    console.log("\n");
    
  } catch (error: any) {
    console.error("\n" + "=" .repeat(60));
    console.error("❌ BACKUP FAILED!");
    console.error("=" .repeat(60));
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the backup
main();
