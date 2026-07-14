import dns from 'dns';
import dotenv from 'dotenv';
// SECURITY FIX: Removed execSync import - dangerous and not needed
// import { execSync } from 'child_process';
import  app  from './app';
import verifyEnvVariables from './utils/checkURI';
import connectdb from "./db/index";
import { setupROICron } from './cron/roi-cron';
import { reconciliationCron } from './cron/reconciliation-cron';
import chalk from 'chalk'

// ./src/index.ts
export const ReportBuilder = {};
export const Secure3dBuilder = {};
export const ApplicationCryptogramType = {};
export const IRequestLogger = {};
export const ConnectionConfig = {};


dotenv.config({ path: './.env' });

// Fix SRV DNS failures for mongodb+srv (local resolver at 127.0.0.1 refuses querySrv)
dns.setServers(['8.8.8.8', '1.1.1.1']);

console.log(chalk.blue(`Environment set to ${process.env.NODE_ENV}`));

const requiredEnvVars = ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET", "PORT", "MONGODB_URL_DEVELOPMENT"];
verifyEnvVariables(requiredEnvVars);

const PORT = process.env.PORT || 8000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS as string
// Kill any process using the port before starting the server
// try {
//     console.log(`Checking and killing process on port ${PORT}...`);
//     execSync(`npx kill-port ${PORT}`);
//     console.log(`Port ${PORT} is now free.`);
// } catch (err) {
//     console.log(`Failed to kill process on port ${PORT} or no process found.`);
// }

app.get('/', (req, res) => {
    res.send('Hello World');
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'API OK' });
  });
  
connectdb()
    .then(() => {
        // Setup cron jobs
        setupROICron();
        
        // Setup reconciliation cron (runs daily at 2:00 AM)
        // reconciliationCron.start(); // Uncomment to enable daily reconciliation
        console.log("[Cron] Reconciliation cron available (currently disabled - uncomment in index.ts to enable)");
        
        const server = app.listen(PORT as number,'0.0.0.0' , () => {
            console.log(`🚀 Server is running at port: ${PORT}`);
        });
        
        server.on("error", (error) => {
            console.log("❌ Server Error:", error); 
            throw error;
        });
    })
    .catch((error) => {
        console.log("❌ MongoDB connection failed: " + error);
});
