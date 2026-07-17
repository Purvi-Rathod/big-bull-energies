/**
 * Diagnostic Script: User Payment and Investment Analysis
 * 
 * Analyzes NOWPayments payment records and investments for a specific user
 * to diagnose duplicate payment/investment issues.
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/diagnoseUserPayments.ts [userId]
 * Example: npx ts-node -r dotenv/config src/scripts/diagnoseUserPayments.ts 000282
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as fs from "fs";
import * as path from "path";

// Import all models to ensure they're registered with Mongoose
import { User } from "../models/User";
import { Payment } from "../models/Payment";
import { Investment } from "../models/Investment";
import { Package } from "../models/Package";

// Load environment variables - try multiple paths
try {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
} catch (e) {
  // Ignore if .env not found
}
try {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (e) {
  // Ignore if .env not found
}
dotenv.config(); // Try default .env in current directory

const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_PRODUCTION || "mongodb://localhost:27017/crown-bankers";

interface PaymentAnalysis {
  payment: any;
  linkedInvestment?: any;
  hasInvestment: boolean;
  investmentMatchType?: 'byInvestmentId' | 'byVoucherId' | 'byPaymentId' | 'none';
  issues: string[];
}

interface InvestmentAnalysis {
  investment: any;
  linkedPayments: any[];
  paymentMatchType?: 'byInvestmentId' | 'byVoucherId' | 'byPaymentId' | 'none';
  issues: string[];
}

interface DiagnosticReport {
  user: any;
  payments: PaymentAnalysis[];
  investments: InvestmentAnalysis[];
  summary: {
    totalPayments: number;
    totalInvestments: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    paymentsWithInvestments: number;
    paymentsWithoutInvestments: number;
    investmentsWithPayments: number;
    investmentsWithoutPayments: number;
    duplicatePayments: number;
    duplicateInvestments: number;
    totalAmountPaid: number;
    totalAmountInvested: number;
    discrepancies: string[];
  };
}

function formatDecimal128(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value.toString) return parseFloat(value.toString());
  return 0;
}

function formatDate(date: any): string {
  if (!date) return 'N/A';
  return new Date(date).toISOString();
}

async function connectDB() {
  try {
    if (!MONGODB_URI || MONGODB_URI === "mongodb://localhost:27017/crown-bankers") {
      console.log("⚠️  Using default MongoDB URI. Make sure MongoDB is running locally.");
      console.log("   Or set MONGODB_URL_DEVELOPMENT in your .env file\n");
    }
    
    console.log("🔌 Connecting to MongoDB...");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
    
    // Ensure all models are registered by accessing them
    // This forces the model schemas to be registered with mongoose
    User.modelName;
    Payment.modelName;
    Investment.modelName;
    Package.modelName;
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB!");
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

async function diagnoseUser(userId: string): Promise<DiagnosticReport> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 DIAGNOSING USER: ${userId}`);
  console.log(`${'='.repeat(80)}\n`);

  // Find user by userId - try exact match first, then try with BIGBULL- prefix, then try with CNEOX- prefix
  let user = await User.findOne({ userId }).lean();
  if (!user && !userId.includes('-')) {
    // Try with BIGBULL- prefix
    user = await User.findOne({ userId: `BIGBULL-${userId}` }).lean();
  }
  if (!user && !userId.includes('-')) {
    // Try with CNEOX- prefix
    user = await User.findOne({ userId: `CNEOX-${userId}` }).lean();
  }
  if (!user) {
    // Try MongoDB ObjectId if userId looks like one
    if (Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).lean();
    }
  }
  if (!user) {
    throw new Error(`User with userId "${userId}" not found. Tried: "${userId}", "BIGBULL-${userId}", "CNEOX-${userId}"`);
  }

  console.log(`✅ User Found:`);
  console.log(`   - Name: ${user.name || 'N/A'}`);
  console.log(`   - Email: ${user.email || 'N/A'}`);
  console.log(`   - MongoDB ID: ${user._id}`);
  console.log(`   - Status: ${user.status || 'N/A'}\n`);

  // Get all payments for this user
  const payments = await Payment.find({ user: user._id })
    .populate('package', 'packageName')
    .populate('investmentId', 'investedAmount voucherId')
    .sort({ createdAt: -1 })
    .lean();

  console.log(`📋 Found ${payments.length} Payment Records\n`);

  // Get all investments for this user
  const investments = await Investment.find({ user: user._id })
    .populate('packageId', 'packageName')
    .sort({ createdAt: -1 })
    .lean();

  console.log(`💰 Found ${investments.length} Investment Records\n`);

  // Analyze payments
  const paymentAnalyses: PaymentAnalysis[] = payments.map(payment => {
    const analysis: PaymentAnalysis = {
      payment,
      hasInvestment: false,
      issues: []
    };

    // Check if payment has investmentId
    if (payment.investmentId) {
      analysis.hasInvestment = true;
      analysis.linkedInvestment = payment.investmentId;
      analysis.investmentMatchType = 'byInvestmentId';
    } else {
      // Try to find investment by voucherId/paymentId
      const paymentId = payment.paymentId;
      const matchingInvestment = investments.find(inv => {
        const invVoucherId = inv.voucherId;
        return invVoucherId === paymentId || invVoucherId === payment.orderId;
      });

      if (matchingInvestment) {
        analysis.hasInvestment = true;
        analysis.linkedInvestment = matchingInvestment;
        analysis.investmentMatchType = 'byVoucherId';
        analysis.issues.push(`Investment found by voucherId but payment.investmentId not set`);
      } else {
        analysis.investmentMatchType = 'none';
        if (payment.status === 'completed') {
          analysis.issues.push(`Payment completed but no investment found`);
        }
      }
    }

    // Check for duplicate paymentIds
    const duplicatePayments = payments.filter(p => 
      p.paymentId === payment.paymentId && p._id.toString() !== payment._id.toString()
    );
    if (duplicatePayments.length > 0) {
      analysis.issues.push(`Duplicate paymentId found: ${duplicatePayments.length} other payments share paymentId "${payment.paymentId}"`);
    }

    // Check for duplicate orderIds (shouldn't happen due to unique constraint)
    const duplicateOrderIds = payments.filter(p => 
      p.orderId === payment.orderId && p._id.toString() !== payment._id.toString()
    );
    if (duplicateOrderIds.length > 0) {
      analysis.issues.push(`CRITICAL: Duplicate orderId found: ${duplicateOrderIds.length} other payments share orderId "${payment.orderId}"`);
    }

    // Check status consistency
    if (payment.status === 'completed' && !analysis.hasInvestment) {
      analysis.issues.push(`Payment marked as completed but has no linked investment`);
    }

    return analysis;
  });

  // Analyze investments
  const investmentAnalyses: InvestmentAnalysis[] = investments.map(investment => {
    const analysis: InvestmentAnalysis = {
      investment,
      linkedPayments: [],
      issues: []
    };

    // Find payments linked to this investment
    const paymentsByInvestmentId = payments.filter(p => 
      p.investmentId && p.investmentId.toString() === investment._id.toString()
    );

    const paymentsByVoucherId = payments.filter(p => {
      const invVoucherId = investment.voucherId;
      return invVoucherId === p.paymentId || invVoucherId === p.orderId;
    });

    if (paymentsByInvestmentId.length > 0) {
      analysis.linkedPayments = paymentsByInvestmentId;
      analysis.paymentMatchType = 'byInvestmentId';
    } else if (paymentsByVoucherId.length > 0) {
      analysis.linkedPayments = paymentsByVoucherId;
      analysis.paymentMatchType = 'byVoucherId';
      analysis.issues.push(`Investment linked to payment by voucherId but payment.investmentId not set`);
    } else {
      analysis.paymentMatchType = 'none';
      analysis.issues.push(`Investment has no linked payment record`);
    }

    // Check for duplicate investments with same voucherId
    const duplicateInvestments = investments.filter(inv => 
      inv.voucherId === investment.voucherId && 
      inv.voucherId && 
      inv._id.toString() !== investment._id.toString()
    );
    if (duplicateInvestments.length > 0) {
      analysis.issues.push(`CRITICAL: Duplicate investment found: ${duplicateInvestments.length} other investments share voucherId "${investment.voucherId}"`);
    }

    // Check if multiple payments link to same investment
    if (analysis.linkedPayments.length > 1) {
      analysis.issues.push(`Multiple payments (${analysis.linkedPayments.length}) link to this investment`);
    }

    return analysis;
  });

  // Calculate summary
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing').length;
  const failedPayments = payments.filter(p => p.status === 'failed' || p.status === 'expired' || p.status === 'cancelled').length;
  const paymentsWithInvestments = paymentAnalyses.filter(p => p.hasInvestment).length;
  const paymentsWithoutInvestments = paymentAnalyses.filter(p => !p.hasInvestment && p.payment.status === 'completed').length;
  const investmentsWithPayments = investmentAnalyses.filter(i => i.linkedPayments.length > 0).length;
  const investmentsWithoutPayments = investmentAnalyses.filter(i => i.linkedPayments.length === 0).length;

  // Find duplicate paymentIds
  const paymentIdGroups = new Map<string, any[]>();
  payments.forEach(p => {
    if (!paymentIdGroups.has(p.paymentId)) {
      paymentIdGroups.set(p.paymentId, []);
    }
    paymentIdGroups.get(p.paymentId)!.push(p);
  });
  const duplicatePayments = Array.from(paymentIdGroups.values()).filter(group => group.length > 1).length;

  // Find duplicate investments by voucherId
  const voucherIdGroups = new Map<string, any[]>();
  investments.forEach(inv => {
    if (inv.voucherId) {
      if (!voucherIdGroups.has(inv.voucherId)) {
        voucherIdGroups.set(inv.voucherId, []);
      }
      voucherIdGroups.get(inv.voucherId)!.push(inv);
    }
  });
  const duplicateInvestments = Array.from(voucherIdGroups.values()).filter(group => group.length > 1).length;

  const totalAmountPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + formatDecimal128(p.amount), 0);

  const totalAmountInvested = investments.reduce((sum, inv) => 
    sum + formatDecimal128(inv.investedAmount), 0);

  const discrepancies: string[] = [];
  if (Math.abs(totalAmountPaid - totalAmountInvested) > 0.01) {
    discrepancies.push(`Amount mismatch: Paid $${totalAmountPaid.toFixed(2)} but invested $${totalAmountInvested.toFixed(2)}`);
  }
  if (completedPayments !== investments.length) {
    discrepancies.push(`Payment count mismatch: ${completedPayments} completed payments but ${investments.length} investments`);
  }

  const summary = {
    totalPayments: payments.length,
    totalInvestments: investments.length,
    completedPayments,
    pendingPayments,
    failedPayments,
    paymentsWithInvestments,
    paymentsWithoutInvestments,
    investmentsWithPayments,
    investmentsWithoutPayments,
    duplicatePayments,
    duplicateInvestments,
    totalAmountPaid,
    totalAmountInvested,
    discrepancies
  };

  return {
    user,
    payments: paymentAnalyses,
    investments: investmentAnalyses,
    summary
  };
}

function generateReport(report: DiagnosticReport): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('NOWPAYMENTS DIAGNOSTIC REPORT');
  lines.push('='.repeat(80));
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`User ID: ${report.user.userId}`);
  lines.push(`User Name: ${report.user.name || 'N/A'}`);
  lines.push(`User Email: ${report.user.email || 'N/A'}`);
  lines.push('');

  // Summary
  lines.push('─'.repeat(80));
  lines.push('SUMMARY');
  lines.push('─'.repeat(80));
  lines.push(`Total Payment Records: ${report.summary.totalPayments}`);
  lines.push(`Total Investment Records: ${report.summary.totalInvestments}`);
  lines.push(`Completed Payments: ${report.summary.completedPayments}`);
  lines.push(`Pending Payments: ${report.summary.pendingPayments}`);
  lines.push(`Failed Payments: ${report.summary.failedPayments}`);
  lines.push(`Payments With Investments: ${report.summary.paymentsWithInvestments}`);
  lines.push(`Payments Without Investments: ${report.summary.paymentsWithoutInvestments}`);
  lines.push(`Investments With Payments: ${report.summary.investmentsWithPayments}`);
  lines.push(`Investments Without Payments: ${report.summary.investmentsWithoutPayments}`);
  lines.push(`Duplicate Payment IDs: ${report.summary.duplicatePayments}`);
  lines.push(`Duplicate Investment voucherIds: ${report.summary.duplicateInvestments}`);
  lines.push(`Total Amount Paid: $${report.summary.totalAmountPaid.toFixed(2)}`);
  lines.push(`Total Amount Invested: $${report.summary.totalAmountInvested.toFixed(2)}`);
  if (report.summary.discrepancies.length > 0) {
    lines.push('');
    lines.push('⚠️ DISCREPANCIES:');
    report.summary.discrepancies.forEach(d => lines.push(`  - ${d}`));
  }
  lines.push('');

  // Payment Details
  lines.push('─'.repeat(80));
  lines.push('PAYMENT RECORDS');
  lines.push('─'.repeat(80));
  report.payments.forEach((analysis, index) => {
    const p = analysis.payment;
    lines.push(`\nPayment #${index + 1}:`);
    lines.push(`  ID: ${p._id}`);
    lines.push(`  Order ID: ${p.orderId}`);
    lines.push(`  Payment ID: ${p.paymentId}`);
    lines.push(`  Amount: $${formatDecimal128(p.amount).toFixed(2)}`);
    lines.push(`  Status: ${p.status}`);
    lines.push(`  Package: ${(p.package as any)?.packageName || 'N/A'}`);
    lines.push(`  Created: ${formatDate(p.createdAt)}`);
    lines.push(`  Updated: ${formatDate(p.updatedAt)}`);
    if (p.actuallyPaid) {
      lines.push(`  Actually Paid: $${formatDecimal128(p.actuallyPaid).toFixed(2)} ${p.payCurrency || ''}`);
    }
    lines.push(`  Has Investment: ${analysis.hasInvestment ? '✅ YES' : '❌ NO'}`);
    if (analysis.linkedInvestment) {
      lines.push(`  Linked Investment ID: ${analysis.linkedInvestment._id}`);
      lines.push(`  Match Type: ${analysis.investmentMatchType}`);
    }
    if (analysis.issues.length > 0) {
      lines.push(`  ⚠️ Issues:`);
      analysis.issues.forEach(issue => lines.push(`    - ${issue}`));
    }
  });
  lines.push('');

  // Investment Details
  lines.push('─'.repeat(80));
  lines.push('INVESTMENT RECORDS');
  lines.push('─'.repeat(80));
  report.investments.forEach((analysis, index) => {
    const inv = analysis.investment;
    lines.push(`\nInvestment #${index + 1}:`);
    lines.push(`  ID: ${inv._id}`);
    lines.push(`  Amount: $${formatDecimal128(inv.investedAmount).toFixed(2)}`);
    lines.push(`  voucherId: ${inv.voucherId || 'N/A'}`);
    lines.push(`  Package: ${(inv.packageId as any)?.packageName || 'N/A'}`);
    lines.push(`  Status: ${inv.isActive ? 'Active' : 'Inactive'}`);
    lines.push(`  Created: ${formatDate(inv.createdAt)}`);
    lines.push(`  Start Date: ${formatDate(inv.startDate)}`);
    lines.push(`  End Date: ${formatDate(inv.endDate)}`);
    lines.push(`  Linked Payments: ${analysis.linkedPayments.length}`);
    if (analysis.linkedPayments.length > 0) {
      analysis.linkedPayments.forEach((p, i) => {
        lines.push(`    Payment ${i + 1}: Order ID ${p.orderId}, Payment ID ${p.paymentId}, Status ${p.status}`);
      });
      lines.push(`  Match Type: ${analysis.paymentMatchType}`);
    }
    if (analysis.issues.length > 0) {
      lines.push(`  ⚠️ Issues:`);
      analysis.issues.forEach(issue => lines.push(`    - ${issue}`));
    }
  });
  lines.push('');

  // Duplicate Analysis
  lines.push('─'.repeat(80));
  lines.push('DUPLICATE ANALYSIS');
  lines.push('─'.repeat(80));
  
  // Group payments by paymentId
  const paymentIdGroups = new Map<string, any[]>();
  report.payments.forEach(analysis => {
    const paymentId = analysis.payment.paymentId;
    if (!paymentIdGroups.has(paymentId)) {
      paymentIdGroups.set(paymentId, []);
    }
    paymentIdGroups.get(paymentId)!.push(analysis.payment);
  });

  const duplicatePaymentIds = Array.from(paymentIdGroups.entries()).filter(([_, payments]) => payments.length > 1);
  if (duplicatePaymentIds.length > 0) {
    lines.push('\n⚠️ DUPLICATE PAYMENT IDs:');
    duplicatePaymentIds.forEach(([paymentId, payments]) => {
      lines.push(`\n  Payment ID: ${paymentId}`);
      lines.push(`  Found in ${payments.length} payment records:`);
      payments.forEach(p => {
        lines.push(`    - Order ID: ${p.orderId}, Status: ${p.status}, Amount: $${formatDecimal128(p.amount).toFixed(2)}`);
      });
    });
  }

  // Group investments by voucherId
  const voucherIdGroups = new Map<string, any[]>();
  report.investments.forEach(analysis => {
    const voucherId = analysis.investment.voucherId;
    if (voucherId) {
      if (!voucherIdGroups.has(voucherId)) {
        voucherIdGroups.set(voucherId, []);
      }
      voucherIdGroups.get(voucherId)!.push(analysis.investment);
    }
  });

  const duplicateVoucherIds = Array.from(voucherIdGroups.entries()).filter(([_, investments]) => investments.length > 1);
  if (duplicateVoucherIds.length > 0) {
    lines.push('\n⚠️ DUPLICATE INVESTMENT voucherIds:');
    duplicateVoucherIds.forEach(([voucherId, investments]) => {
      lines.push(`\n  voucherId: ${voucherId}`);
      lines.push(`  Found in ${investments.length} investment records:`);
      investments.forEach(inv => {
        lines.push(`    - Investment ID: ${inv._id}, Amount: $${formatDecimal128(inv.investedAmount).toFixed(2)}, Created: ${formatDate(inv.createdAt)}`);
      });
    });
  }

  if (duplicatePaymentIds.length === 0 && duplicateVoucherIds.length === 0) {
    lines.push('\n✅ No duplicates found');
  }

  lines.push('');
  lines.push('='.repeat(80));
  lines.push('END OF REPORT');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

async function main() {
  const userId = process.argv[2] || 'BIGBULL-000282';

  try {
    await connectDB();

    console.log(`\n🔍 Starting diagnostic for user: ${userId}\n`);

    const report = await diagnoseUser(userId);

    // Generate report
    const reportText = generateReport(report);
    console.log('\n' + reportText);

    // Save report to file
    const reportDir = path.join(__dirname, '../../diagnostic-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportFile = path.join(reportDir, `diagnostic-${userId}-${Date.now()}.txt`);
    fs.writeFileSync(reportFile, reportText);
    console.log(`\n✅ Report saved to: ${reportFile}`);

    // Also save JSON for programmatic analysis
    const jsonFile = path.join(reportDir, `diagnostic-${userId}-${Date.now()}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(report, null, 2));
    console.log(`✅ JSON data saved to: ${jsonFile}`);

    await disconnectDB();
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { diagnoseUser, generateReport };
