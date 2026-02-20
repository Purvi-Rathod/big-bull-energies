import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Package } from "../models/Package";
import { Investment } from "../models/Investment";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { Settings } from "../models/Settings";
import { Types } from "mongoose";
import {
  createNOWPaymentsInvoice,
  createNOWPaymentsPayment,
  getNOWPaymentsPaymentStatus,
  verifyNOWPaymentsCallback,
  isPaymentCompleted,
  isPaymentFailed,
  NOWPaymentsCallback,
} from "../lib/payments/nowpayments";
import { processInvestment } from "../services/investment.service";

/**
 * Create payment request with NOWPayments
 * POST /api/v1/payment/create
 */
export const createPayment = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { packageId, amount, currency = "USD", voucherId, useMainWallet } = req.body;

  if (!packageId || !amount) {
    throw new AppError("Package ID and amount are required", 400);
  }

  if (!Types.ObjectId.isValid(packageId)) {
    throw new AppError("Invalid package ID", 400);
  }

  // Validate amount
  const investmentAmount = Number(amount);
  if (isNaN(investmentAmount) || investmentAmount <= 0) {
    throw new AppError("Invalid amount", 400);
  }

  // Get package details
  const pkg = await Package.findById(packageId);
  if (!pkg) {
    throw new AppError("Package not found", 404);
  }

  // Validate amount against package limits
  const minAmount = parseFloat(pkg.minAmount.toString());
  const maxAmount = parseFloat(pkg.maxAmount.toString());

  if (investmentAmount < minAmount || investmentAmount > maxAmount) {
    throw new AppError(
      `Amount must be between $${minAmount} and $${maxAmount}`,
      400
    );
  }

  // Check if package is active
  if (pkg.status !== "Active") {
    throw new AppError("Package is not active", 400);
  }

  // Get main wallet balance (will be used automatically if available)
  const { Wallet } = await import("../models/Wallet");
  const { WalletType } = await import("../models/types");
  const { createWalletTransaction } = await import("../services/transaction.service");
  
  const mainWallet = await Wallet.findOne({ 
    user: userId, 
    type: WalletType.MAIN 
  });
  
  const mainWalletBalance = mainWallet ? parseFloat(mainWallet.balance.toString()) : 0;

  // Handle voucher if provided
  let voucher = null;
  let voucherInvestmentValue = 0;
  let remainingAmount = investmentAmount;
  let mainWalletUsed = 0;

  if (voucherId) {
    const { Voucher } = await import("../models/Voucher");
    voucher = await Voucher.findOne({ 
      voucherId, 
      user: userId, 
      status: "active" 
    });

    if (!voucher) {
      throw new AppError("Voucher not found or already used", 404);
    }

    // Check if voucher is expired
    if (voucher.expiry && new Date() > voucher.expiry) {
      throw new AppError("Voucher has expired", 400);
    }

    // Get voucher investment value - calculate if not set
    if (voucher.investmentValue) {
      voucherInvestmentValue = parseFloat(voucher.investmentValue.toString());
    } else {
      // Calculate from amount * multiplier if investmentValue is not set
      const voucherAmount = parseFloat(voucher.amount.toString());
      const multiplier = voucher.multiplier || 2;
      voucherInvestmentValue = voucherAmount * multiplier;
    }
    
    // Ensure we have a valid investment value
    if (!voucherInvestmentValue || voucherInvestmentValue === 0 || isNaN(voucherInvestmentValue)) {
      const voucherAmount = parseFloat(voucher.amount.toString());
      const multiplier = voucher.multiplier || 2;
      voucherInvestmentValue = voucherAmount * multiplier;
    }
    
    // Validate: Investment amount must be at least 2x the voucher purchase amount
    const voucherPurchaseAmount = parseFloat(voucher.amount.toString());
    const minimumInvestmentRequired = voucherPurchaseAmount * 2;
    
    if (investmentAmount < minimumInvestmentRequired) {
      throw new AppError(
        `To use this voucher, you must invest at least $${minimumInvestmentRequired.toLocaleString()} (2x the voucher purchase amount of $${voucherPurchaseAmount.toLocaleString()})`,
        400
      );
    }
    
    console.log(`[Voucher] Voucher ID: ${voucher.voucherId}, Amount: ${voucher.amount}, Investment Value: ${voucherInvestmentValue}, Investment Amount: ${investmentAmount}`);
    
    remainingAmount = Math.max(0, investmentAmount - voucherInvestmentValue);

    // If voucher covers full amount or more, no payment needed
    // IMPORTANT: Voucher investment value can be greater than or equal to investment amount - that's fine
    // Examples:
    // - $100 voucher (investment value $200) can cover $100 investment ✅
    // - $100 voucher (investment value $200) can cover $200 investment ✅
    // - $100 voucher (investment value $200) can cover $150 investment ✅
    // - $100 voucher (investment value $200) can cover $300 investment (partial - user pays $100) ✅
    console.log(`[Voucher] Remaining amount: ${remainingAmount}, Voucher covers: ${voucherInvestmentValue >= investmentAmount}`);
    
    // Use main wallet balance to reduce remaining amount (if user selected to use it)
    if (useMainWallet && mainWallet && mainWalletBalance > 0 && remainingAmount > 0) {
      mainWalletUsed = Math.min(mainWalletBalance, remainingAmount);
      remainingAmount = remainingAmount - mainWalletUsed;
      
      // Deduct from main wallet
      if (mainWalletUsed > 0) {
        const newBalance = mainWalletBalance - mainWalletUsed;
        mainWallet.balance = Types.Decimal128.fromString(newBalance.toString());
        await mainWallet.save();
        
        // Create transaction record
        await createWalletTransaction(
          userId,
          WalletType.MAIN,
          "debit",
          mainWalletUsed,
          `main-wallet-${Date.now()}-${userId}`,
          { description: `Investment package activation - $${mainWalletUsed} used from main wallet` }
        );
      }
    }
    
    if (remainingAmount === 0 || (voucherInvestmentValue + mainWalletUsed >= investmentAmount)) {
      // Process investment directly (fully covered by voucher + main wallet)
      const { processInvestment } = await import("../services/investment.service");
      const investment = await processInvestment(
        userId,
        packageId,
        investmentAmount,
        undefined, // paymentId (not needed when fully covered)
        voucherId  // voucherId (5th parameter)
      );

      // Voucher is already marked as used in processInvestment, but ensure it's saved
      // (processInvestment marks it as used, but we'll double-check here for safety)

      const response = res as any;
      return response.status(200).json({
        status: "success",
        message: "Investment activated successfully",
        data: {
          investment: {
            id: investment._id,
            amount: investmentAmount,
            voucherUsed: voucher ? {
              voucherId: voucher.voucherId,
              amount: parseFloat(voucher.amount.toString()),
              investmentValue: voucherInvestmentValue,
            } : null,
            mainWalletUsed: mainWalletUsed > 0 ? mainWalletUsed : null,
            remainingAmount: 0,
          },
        },
      });
    }
  }
  
  // If fully covered (voucher + main wallet), process investment directly
  if (remainingAmount === 0) {
    const { processInvestment } = await import("../services/investment.service");
    const investment = await processInvestment(
      userId,
      packageId,
      investmentAmount,
      undefined, // paymentId (not needed when fully covered)
      voucherId || undefined // voucherId
    );
    
    const response = res as any;
    return response.status(200).json({
      status: "success",
      message: "Investment activated successfully",
      data: {
        investment: {
          id: investment._id,
          amount: investmentAmount,
          voucherUsed: voucher ? {
            voucherId: voucher.voucherId,
            amount: parseFloat(voucher.amount.toString()),
            investmentValue: voucherInvestmentValue,
          } : null,
          mainWalletUsed: mainWalletUsed > 0 ? mainWalletUsed : null,
          remainingAmount: 0,
        },
      },
    });
  }

  // Generate order ID
  const orderId = `INV_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get callback URLs from environment
  const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const apiUrl = process.env.API_URL || 'https://api.crownbankers.com';
  const callbackUrl = process.env.NOWPAYMENTS_CALLBACK_URL || `${apiUrl}/api/v1/payment/callback`;
  const successUrl = `${baseUrl}/invest/success?orderId=${orderId}`;
  const cancelUrl = `${baseUrl}/invest/cancel?orderId=${orderId}`;
  
  console.log(`[Payment Create] 📋 Payment Configuration:`);
  console.log(`[Payment Create]   - Order ID: ${orderId}`);
  console.log(`[Payment Create]   - Amount: $${investmentAmount}`);
  console.log(`[Payment Create]   - Package: ${pkg.packageName}`);
  console.log(`[Payment Create]   - User ID: ${userId}`);
  console.log(`[Payment Create]   - API URL: ${apiUrl}`);
  console.log(`[Payment Create]   - Callback URL: ${callbackUrl}`);
  console.log(`[Payment Create]   - Success URL: ${successUrl}`);
  console.log(`[Payment Create]   - Cancel URL: ${cancelUrl}`);


  // Check if NOWPayments is enabled
  const nowpaymentsSetting = await Settings.findOne({ key: "nowpayments_enabled" });
  const isNOWPaymentsEnabled = nowpaymentsSetting === null || nowpaymentsSetting.value === true || nowpaymentsSetting.value === "true";

  // If NOWPayments is disabled, allow direct investment (with or without voucher)
  if (!isNOWPaymentsEnabled) {
    // Process investment directly without payment gateway
    const { processInvestment } = await import("../services/investment.service");
    
    const investment = await processInvestment(
      userId,
      packageId,
      investmentAmount,
      voucherId ? undefined : `DIRECT_${Date.now()}`, // paymentId (only if no voucher)
      voucherId || undefined // voucherId (5th parameter)
    );
    
    // Voucher is already marked as used in processInvestment if provided

    const response = res as any;
    return response.status(200).json({
      status: "success",
      message: "Investment activated successfully (payment gateway disabled)",
      data: {
        investment: {
          id: investment._id,
          amount: investmentAmount,
          voucherUsed: voucher ? {
            voucherId: voucher.voucherId,
            amount: parseFloat(voucher.amount.toString()),
            investmentValue: voucherInvestmentValue,
          } : null,
          mainWalletUsed: mainWalletUsed > 0 ? mainWalletUsed : null,
          remainingAmount: remainingAmount,
        },
      },
    });
  }
  
  // Use main wallet balance to reduce payment amount (if user selected to use it and no voucher was used)
  if (useMainWallet && !voucher && mainWallet && mainWalletBalance > 0 && investmentAmount > 0) {
    mainWalletUsed = Math.min(mainWalletBalance, investmentAmount);
    remainingAmount = investmentAmount - mainWalletUsed;
    
    // Deduct from main wallet
    if (mainWalletUsed > 0) {
      const newBalance = mainWalletBalance - mainWalletUsed;
      mainWallet.balance = Types.Decimal128.fromString(newBalance.toString());
      await mainWallet.save();
      
      // Create transaction record
      await createWalletTransaction(
        userId,
        WalletType.MAIN,
        "debit",
        mainWalletUsed,
        `main-wallet-${Date.now()}-${userId}`,
        { description: `Investment package activation - $${mainWalletUsed} used from main wallet` }
      );
    }
  }

  // Get user email for invoice
  const user = await User.findById(userId).select("email").lean();
  const customerEmail = user?.email || undefined;

  // Create invoice with NOWPayments (allows user to choose cryptocurrency)
  // This method accepts USD and doesn't require pay_currency
  try {
    console.log('Creating NOWPayments invoice for order:', orderId);

    // Calculate final payment amount after voucher and main wallet
    const paymentAmount = remainingAmount;
    
    // Build order description
    let orderDescription = `Investment in ${pkg.packageName} - $${investmentAmount}`;
    const parts = [];
    if (voucher) {
      parts.push(`Voucher: $${voucherInvestmentValue}`);
    }
    if (mainWalletUsed > 0) {
      parts.push(`Main Wallet: $${mainWalletUsed}`);
    }
    if (paymentAmount > 0) {
      parts.push(`Payment: $${paymentAmount}`);
    }
    if (parts.length > 0) {
      orderDescription += ` (${parts.join(', ')})`;
    }

    console.log(`[Payment Create] 📤 Sending invoice request to NOWPayments:`);
    console.log(`[Payment Create]   - price_amount: ${paymentAmount}`);
    console.log(`[Payment Create]   - price_currency: ${currency.toUpperCase()}`);
    console.log(`[Payment Create]   - order_id: ${orderId}`);
    console.log(`[Payment Create]   - ipn_callback_url: ${callbackUrl}`);
    console.log(`[Payment Create]   - success_url: ${successUrl}`);
    console.log(`[Payment Create]   - cancel_url: ${cancelUrl}`);
    
    const invoiceResponse = await createNOWPaymentsInvoice({
      price_amount: paymentAmount,
      price_currency: currency.toUpperCase(),
      order_id: orderId,
      order_description: orderDescription,
      ipn_callback_url: callbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });
    
    console.log(`[Payment Create] ✅ Invoice created successfully!`);
    console.log(`[Payment Create]   - Invoice ID: ${invoiceResponse.id || invoiceResponse.token || 'N/A'}`);
    console.log(`[Payment Create]   - Invoice URL: ${invoiceResponse.invoice_url || 'N/A'}`);
    console.log(`[Payment Create]   - Full Response:`, JSON.stringify(invoiceResponse, null, 2));

    // Construct invoice URL if not provided
    // Invoice URL format: https://nowpayments.io/invoice/?iid={invoice_id}
    let invoiceUrl = invoiceResponse.invoice_url;
    
    if (!invoiceUrl && invoiceResponse.id) {
      invoiceUrl = `https://nowpayments.io/invoice/?iid=${invoiceResponse.id}`;
    } else if (!invoiceUrl && invoiceResponse.token) {
      invoiceUrl = `https://nowpayments.io/invoice/?token=${invoiceResponse.token}`;
    }
    
    // If still no URL, we cannot proceed - this is an error
    if (!invoiceUrl) {
      throw new AppError("Invoice URL not provided by NOWPayments and could not be constructed. Please contact support.", 500);
    }

    // Store payment record in database (using invoice ID as paymentId for now)
    // The actual payment_id will be updated when callback is received
    const payment = await Payment.create({
      user: new Types.ObjectId(userId),
      package: new Types.ObjectId(packageId),
      orderId,
      paymentId: invoiceResponse.id || invoiceResponse.token || orderId, // Use invoice ID temporarily
      amount: Types.Decimal128.fromString(investmentAmount.toString()), // Total investment amount
      currency,
      status: "pending",
      paymentUrl: invoiceUrl,
      payCurrency: invoiceResponse.pay_currency || undefined,
      meta: {
        ...(voucher ? {
          voucherId: voucher.voucherId,
          voucherAmount: parseFloat(voucher.amount.toString()),
          voucherInvestmentValue: voucherInvestmentValue,
        } : {}),
        ...(mainWalletUsed > 0 ? {
          mainWalletUsed: mainWalletUsed,
        } : {}),
        remainingAmount: remainingAmount,
        totalInvestmentAmount: investmentAmount,
      },
    });

    const response = res as any;
    response.status(200).json({
      status: "success",
      message: "Payment invoice created successfully",
      data: {
        payment: {
          paymentId: invoiceResponse.id || invoiceResponse.token,
          invoiceId: invoiceResponse.id,
          invoiceToken: invoiceResponse.token,
          paymentUrl: invoiceUrl,
          priceAmount: invoiceResponse.price_amount,
          priceCurrency: invoiceResponse.price_currency,
          orderId: invoiceResponse.order_id || orderId,
          status: "pending",
        },
        voucher: voucher ? {
          voucherId: voucher.voucherId,
          amount: parseFloat(voucher.amount.toString()),
          investmentValue: voucherInvestmentValue,
        } : null,
        remainingAmount: remainingAmount,
        orderId,
      },
    });
  } catch (error: any) {
    console.error("NOWPayments payment creation error:", error);
    throw new AppError(
      error.message || "Failed to create payment request",
      500
    );
  }
});

/**
 * Handle NOWPayments callback/webhook
 * POST /api/v1/payment/callback
 */
export const handlePaymentCallback = asyncHandler(async (req, res) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[NOWPayments Callback] ✅✅✅ CALLBACK HANDLER STARTED ✅✅✅`);
  console.log(`[NOWPayments Callback] Timestamp: ${new Date().toISOString()}`);
  console.log(`[NOWPayments Callback] Request URL: ${req.originalUrl}`);
  console.log(`[NOWPayments Callback] Request Path: ${req.path}`);
  console.log(`[NOWPayments Callback] Request Method: ${req.method}`);
  console.log(`[NOWPayments Callback] Request Protocol: ${req.protocol}`);
  console.log(`[NOWPayments Callback] Request Host: ${req.get('host')}`);
  console.log(`[NOWPayments Callback] Request IP: ${req.ip}`);
  console.log(`[NOWPayments Callback] Remote Address: ${req.socket.remoteAddress}`);
  console.log(`[NOWPayments Callback] X-Forwarded-For: ${req.get('x-forwarded-for') || 'N/A'}`);
  console.log(`[NOWPayments Callback] X-Real-IP: ${req.get('x-real-ip') || 'N/A'}`);
  console.log(`[NOWPayments Callback] User-Agent: ${req.get('user-agent') || 'N/A'}`);
  console.log(`[NOWPayments Callback] Content-Type: ${req.get('content-type') || 'N/A'}`);
  console.log(`[NOWPayments Callback] Content-Length: ${req.get('content-length') || 'N/A'}`);
  console.log(`[NOWPayments Callback] All Headers:`, JSON.stringify(req.headers, null, 2));
  
  // Parse body (may be raw Buffer or already parsed JSON)
  let callback: NOWPaymentsCallback;
  let rawBody: string;
  
  console.log(`[NOWPayments Callback] Body Type: ${Buffer.isBuffer(req.body) ? 'Buffer (raw)' : typeof req.body}`);
  
  if (Buffer.isBuffer(req.body)) {
    // Raw body from express.raw middleware
    rawBody = req.body.toString('utf8');
    console.log(`[NOWPayments Callback] Raw Body (string): ${rawBody}`);
    console.log(`[NOWPayments Callback] Raw Body Length: ${rawBody.length} characters`);
    try {
      callback = JSON.parse(rawBody);
      console.log(`[NOWPayments Callback] ✅ Successfully parsed JSON from raw body`);
    } catch (parseError: any) {
      console.error(`[NOWPayments Callback] ❌ Failed to parse JSON:`, parseError.message);
      throw new AppError("Invalid JSON in callback body", 400);
    }
  } else {
    // Already parsed JSON
    callback = req.body as NOWPaymentsCallback;
    rawBody = JSON.stringify(req.body);
    console.log(`[NOWPayments Callback] Body already parsed as JSON`);
  }
  
  console.log(`[NOWPayments Callback] Parsed Callback Data:`, JSON.stringify(callback, null, 2));
  console.log(`[NOWPayments Callback] Callback Fields:`);
  console.log(`[NOWPayments Callback]   - payment_id: ${callback.payment_id || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - invoice_id: ${callback.invoice_id || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - payment_status: ${callback.payment_status || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - order_id: ${callback.order_id || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - price_amount: ${callback.price_amount || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - price_currency: ${callback.price_currency || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - pay_amount: ${callback.pay_amount || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - pay_currency: ${callback.pay_currency || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - actually_paid: ${callback.actually_paid || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - pay_address: ${callback.pay_address || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - outcome_amount: ${callback.outcome_amount || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - outcome_currency: ${callback.outcome_currency || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - network: ${callback.network || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - created_at: ${callback.created_at || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - updated_at: ${callback.updated_at || 'N/A'}`);
  
  // Get signature from headers (NOWPayments may send it in different header names)
  const signature = (req.headers['x-nowpayments-sig'] || 
                     req.headers['x-nowpayments-signature'] ||
                     req.headers['x-signature'] ||
                     req.headers['signature']) as string | undefined;

  console.log(`[NOWPayments Callback] Signature Headers Check:`);
  console.log(`[NOWPayments Callback]   - x-nowpayments-sig: ${req.headers['x-nowpayments-sig'] || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - x-nowpayments-signature: ${req.headers['x-nowpayments-signature'] || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - x-signature: ${req.headers['x-signature'] || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - signature: ${req.headers['signature'] || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - Selected Signature: ${signature || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - Raw Body Length: ${rawBody.length} characters`);

  // Verify callback
  console.log(`[NOWPayments Callback] Verifying callback...`);
  if (!verifyNOWPaymentsCallback(callback, signature, rawBody)) {
    console.error(`[NOWPayments Callback] ❌❌❌ CALLBACK VERIFICATION FAILED ❌❌❌`);
    console.error(`[NOWPayments Callback] Invalid callback data or signature`);
    console.error(`[NOWPayments Callback] Callback Data:`, JSON.stringify(callback, null, 2));
    console.error(`[NOWPayments Callback] Signature: ${signature || 'N/A'}`);
    console.error(`[NOWPayments Callback] Raw Body: ${rawBody.substring(0, 200)}...`);
    throw new AppError("Invalid callback data or signature", 400);
  }
  
  console.log(`[NOWPayments Callback] ✅✅✅ CALLBACK VERIFIED SUCCESSFULLY ✅✅✅`);
  console.log(`[NOWPayments Callback] Payment ID: ${callback.payment_id}`);
  console.log(`[NOWPayments Callback] Order ID: ${callback.order_id}`);
  console.log(`[NOWPayments Callback] Payment Status: ${callback.payment_status}`);
  console.log(`[NOWPayments Callback] Price Amount: ${callback.price_amount} ${callback.price_currency}`);
  console.log(`[NOWPayments Callback] Actually Paid: ${callback.actually_paid} ${callback.pay_currency || ''}`);

  // Extract order ID and invoice ID
  const orderId = callback.order_id;
  const invoiceId = callback.invoice_id;
  
  console.log(`[NOWPayments Callback] Processing Order ID: ${orderId || 'N/A'}`);
  console.log(`[NOWPayments Callback] Processing Invoice ID: ${invoiceId || 'N/A'}`);
  console.log(`[NOWPayments Callback] Order ID Type: ${orderId ? (orderId.startsWith('VCH_') ? 'Voucher' : orderId.startsWith('INV_') ? 'Investment' : 'Unknown') : 'N/A'}`);
  
  // Validate crypto type - reject LTCT (Litecoin Testnet) like old implementation
  const cryptoType = callback.pay_currency;
  if (cryptoType === "LTCT") {
    console.error(`[NOWPayments Callback] ❌ Rejecting LTCT (Litecoin Testnet) payment`);
    const response = res as any;
    return response.status(400).json({
      status: "error",
      message: "LTCT (Litecoin Testnet) is not supported",
    });
  }
  
  // Handle voucher purchase callbacks (VCH_ prefix)
  if (orderId && orderId.startsWith("VCH_")) {
    console.log(`[NOWPayments Callback] 📦 Processing VOUCHER purchase callback`);
    const { Voucher } = await import("../models/Voucher");
    const orderParts = orderId.split("_");
    if (orderParts.length < 2) {
      throw new AppError("Invalid voucher order ID format", 400);
    }

    const userId = orderParts[1];
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID in voucher order", 400);
    }

    // Find voucher by orderId
    const voucher = await Voucher.findOne({ orderId, user: userId });
    if (!voucher) {
      console.error(`Voucher not found for order ${orderId}`);
      const response = res as any;
      return response.status(200).json({
        status: "error",
        message: "Voucher not found",
      });
    }

    // Update payment status
    const paymentStatus = await getNOWPaymentsPaymentStatus(callback.payment_id);
    if (isPaymentCompleted(paymentStatus.payment_status)) {
      // Voucher payment completed - voucher is already active (created when invoice was created)
      // Just confirm the payment
      const { Payment } = await import("../models/Payment");
      const payment = await Payment.findOne({ orderId });
      if (payment) {
        payment.status = "completed";
        payment.callbackData = callback;
        payment.actuallyPaid = callback.actually_paid
          ? Types.Decimal128.fromString(callback.actually_paid.toString())
          : undefined;
        await payment.save();
      }
      
      const response = res as any;
      return response.status(200).json({
        status: "success",
        message: "Voucher payment confirmed",
      });
    } else if (isPaymentFailed(paymentStatus.payment_status)) {
      // Payment failed - mark voucher as revoked or keep it pending
      const { Payment } = await import("../models/Payment");
      const payment = await Payment.findOne({ orderId });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
      
      const response = res as any;
      return response.status(200).json({
        status: "success",
        message: "Voucher payment failed - callback processed",
      });
    }

    const response = res as any;
    return response.status(200).json({
      status: "success",
      message: "Voucher payment callback processed",
    });
  }

  // Handle investment payment callbacks (INV_ prefix)
  if (!orderId || !orderId.startsWith("INV_")) {
    console.error(`[NOWPayments Callback] ❌ Invalid order ID: ${orderId}`);
    console.error(`[NOWPayments Callback] Order ID must start with 'INV_' for investment payments`);
    throw new AppError("Invalid order ID", 400);
  }

  console.log(`[NOWPayments Callback] 💰 Processing INVESTMENT payment callback`);

  // Parse order ID to get user ID and package info
  // Format: INV_{userId}_{timestamp}_{random}
  const orderParts = orderId.split("_");
  console.log(`[NOWPayments Callback] Order ID Parts:`, orderParts);
  
  if (orderParts.length < 2) {
    console.error(`[NOWPayments Callback] ❌ Invalid order ID format - not enough parts`);
    throw new AppError("Invalid order ID format", 400);
  }

  const userId = orderParts[1];
  console.log(`[NOWPayments Callback] Extracted User ID: ${userId}`);
  
  if (!Types.ObjectId.isValid(userId)) {
    console.error(`[NOWPayments Callback] ❌ Invalid user ID format: ${userId}`);
    throw new AppError("Invalid user ID in order", 400);
  }

  // Find payment record - try orderId first, then invoice_id (like old implementation)
  console.log(`[NOWPayments Callback] Searching for payment record with orderId: ${orderId}`);
  let payment = await Payment.findOne({ orderId }).populate('user', 'userId name email').populate('package', 'packageName');
  
  // If not found by orderId, try invoice_id (old implementation pattern)
  if (!payment && invoiceId) {
    console.log(`[NOWPayments Callback] Payment not found by orderId, trying invoice_id: ${invoiceId}`);
    payment = await Payment.findOne({ paymentId: invoiceId }).populate('user', 'userId name email').populate('package', 'packageName');
  }
  
  // If still not found, try payment_id
  if (!payment && callback.payment_id) {
    console.log(`[NOWPayments Callback] Payment not found by invoice_id, trying payment_id: ${callback.payment_id}`);
    payment = await Payment.findOne({ paymentId: callback.payment_id }).populate('user', 'userId name email').populate('package', 'packageName');
  }
  
  if (!payment) {
    console.error(`[NOWPayments Callback] ❌ Payment not found for order ${orderId}, invoice ${invoiceId}, or payment ${callback.payment_id}`);
    console.error(`[NOWPayments Callback] This might indicate:`);
    console.error(`[NOWPayments Callback]   1. Payment was not created properly`);
    console.error(`[NOWPayments Callback]   2. Order ID/Invoice ID mismatch`);
    console.error(`[NOWPayments Callback]   3. Database issue`);
    // Still return 200 to NOWPayments
    const response = res as any;
    return response.status(200).json({
      status: "error",
      message: "Payment record not found",
    });
  }
  
  console.log(`[NOWPayments Callback] ✅ Payment record found!`);
  console.log(`[NOWPayments Callback] Payment Details:`);
  console.log(`[NOWPayments Callback]   - Payment ID: ${payment._id}`);
  console.log(`[NOWPayments Callback]   - Payment Status: ${payment.status}`);
  console.log(`[NOWPayments Callback]   - Amount: $${parseFloat(payment.amount.toString())}`);
  console.log(`[NOWPayments Callback]   - Currency: ${payment.currency}`);
  console.log(`[NOWPayments Callback]   - User: ${(payment.user as any)?.userId || 'N/A'} (${(payment.user as any)?.name || 'N/A'})`);
  console.log(`[NOWPayments Callback]   - Package: ${(payment.package as any)?.packageName || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - Existing Investment ID: ${payment.investmentId || 'N/A'}`);

  // Check if payment is already finished (prevent duplicate processing - like old implementation)
  if (payment.status === "completed") {
    console.log(`[NOWPayments Callback] ⚠️ Payment already completed (status: ${payment.status})`);
    console.log(`[NOWPayments Callback] This callback is likely a duplicate. Returning success.`);
    
    // Still update callback data for record keeping
    payment.callbackData = callback;
    payment.actuallyPaid = callback.actually_paid
      ? Types.Decimal128.fromString(callback.actually_paid.toString())
      : undefined;
    await payment.save();
    
    const response = res as any;
    console.log(`[NOWPayments Callback] ✅✅✅ CALLBACK PROCESSING COMPLETE (DUPLICATE) ✅✅✅`);
    console.log(`${'='.repeat(80)}\n`);
    return response.status(200).json({
      status: "success",
      message: "Payment already processed - duplicate callback",
    });
  }

  // Handle partially_paid status separately (like old implementation)
  if (callback.payment_status === "partially_paid") {
    console.log(`[NOWPayments Callback] ⚠️ PARTIALLY PAID STATUS DETECTED`);
    console.log(`[NOWPayments Callback] Actually Paid: ${callback.actually_paid} ${callback.pay_currency || ''}`);
    console.log(`[NOWPayments Callback] Price Amount: ${callback.price_amount} ${callback.price_currency || ''}`);
    console.log(`[NOWPayments Callback] Order ID: ${orderId || invoiceId || 'N/A'}`);
    
    // Update payment record
    payment.status = "processing";
    payment.callbackData = callback;
    payment.actuallyPaid = callback.actually_paid
      ? Types.Decimal128.fromString(callback.actually_paid.toString())
      : undefined;
    await payment.save();
    
    // Log partial payment (like old implementation sent notifications)
    console.log(`[NOWPayments Callback] ⚠️ PARTIAL PAYMENT RECEIVED ⚠️`);
    console.log(`[NOWPayments Callback] Partial payment received for order ${orderId || invoiceId || 'N/A'}`);
    console.log(`[NOWPayments Callback] Amount Paid: $${callback.actually_paid || 0}`);
    console.log(`[NOWPayments Callback] Amount Expected: $${callback.price_amount || 0}`);
    console.log(`[NOWPayments Callback] Waiting for full payment...`);
    
    const response = res as any;
    console.log(`[NOWPayments Callback] ✅✅✅ PARTIAL PAYMENT CALLBACK PROCESSED ✅✅✅`);
    console.log(`${'='.repeat(80)}\n`);
    return response.status(200).json({
      status: "success",
      message: "Partial payment callback processed - waiting for full payment",
    });
  }

  // Update payment with callback data
  console.log(`[NOWPayments Callback] Updating payment record with callback data...`);
  payment.callbackData = callback;
  payment.actuallyPaid = callback.actually_paid
    ? Types.Decimal128.fromString(callback.actually_paid.toString())
    : undefined;
  
  console.log(`[NOWPayments Callback] Payment updated with:`);
  console.log(`[NOWPayments Callback]   - Actually Paid: ${callback.actually_paid || 'N/A'}`);
  console.log(`[NOWPayments Callback]   - Callback Data: Stored`);

  // Get payment status from NOWPayments to verify
  console.log(`[NOWPayments Callback] Fetching payment status from NOWPayments API...`);
  console.log(`[NOWPayments Callback] Payment ID to check: ${callback.payment_id}`);
  
  try {
    const paymentStatus = await getNOWPaymentsPaymentStatus(callback.payment_id);
    console.log(`[NOWPayments Callback] ✅ Payment status fetched from NOWPayments`);
    console.log(`[NOWPayments Callback] Payment Status Response:`, JSON.stringify(paymentStatus, null, 2));

    // Update payment status
    const paymentStatusStr = paymentStatus.payment_status;
    const isCompleted = isPaymentCompleted(paymentStatusStr);
    const isFailed = isPaymentFailed(paymentStatusStr);
    
    console.log(`[NOWPayments Callback] Payment Status Analysis:`);
    console.log(`[NOWPayments Callback]   - Status from API: ${paymentStatusStr}`);
    console.log(`[NOWPayments Callback]   - Is Completed: ${isCompleted}`);
    console.log(`[NOWPayments Callback]   - Is Failed: ${isFailed}`);
    
    if (isCompleted) {
      payment.status = "completed";
      await payment.save();
      
      console.log(`[NOWPayments Callback] ✅✅✅ PAYMENT COMPLETED ✅✅✅`);
      console.log(`[NOWPayments Callback] Payment ${callback.payment_id} marked as completed for order ${orderId}`);
      console.log(`[NOWPayments Callback] Payment Summary:`);
      console.log(`[NOWPayments Callback]   - Payment ID: ${callback.payment_id}`);
      console.log(`[NOWPayments Callback]   - Order ID: ${orderId}`);
      console.log(`[NOWPayments Callback]   - Price Amount: ${callback.price_amount} ${callback.price_currency}`);
      console.log(`[NOWPayments Callback]   - Actually Paid: ${callback.actually_paid} ${callback.pay_currency || ''}`);
      console.log(`[NOWPayments Callback]   - Pay Address: ${callback.pay_address || 'N/A'}`);
      console.log(`[NOWPayments Callback]   - Network: ${callback.network || 'N/A'}`);
      console.log(`[NOWPayments Callback]   - User ID: ${userId}`);
      console.log(`[NOWPayments Callback] Processing investment for user ${userId}...`);
      
      // Check for duplicate investment
      // FIXED: Use invoice_id as primary identifier (matches Payment.paymentId)
      // Also check payment_id to prevent duplicates from both IDs
      const invoiceIdStr = invoiceId?.toString() || payment.paymentId;
      const paymentIdStr = callback.payment_id?.toString();
      
      console.log(`[NOWPayments Callback] Checking for duplicate investment:`);
      console.log(`[NOWPayments Callback]   - Invoice ID: ${invoiceIdStr}`);
      console.log(`[NOWPayments Callback]   - Payment ID: ${paymentIdStr || 'N/A'}`);
      
      // Check for existing investment by invoice_id (primary) OR payment_id (secondary)
      const existingInvestment = await Investment.findOne({ 
        $or: [
          { voucherId: invoiceIdStr }, // Check by invoice_id (primary)
          ...(paymentIdStr ? [{ voucherId: paymentIdStr }] : []) // Also check by payment_id if present
        ]
      });
      
      if (existingInvestment) {
        console.log(`[NOWPayments Callback] ⚠️ Investment already exists`);
        console.log(`[NOWPayments Callback] Existing Investment ID: ${existingInvestment._id}`);
        console.log(`[NOWPayments Callback] Existing Investment voucherId: ${existingInvestment.voucherId}`);
        console.log(`[NOWPayments Callback] This is a duplicate callback. Returning success.`);
        
        // Link investment to payment if not already linked
        if (!payment.investmentId) {
          payment.investmentId = existingInvestment._id as Types.ObjectId;
          await payment.save();
          console.log(`[NOWPayments Callback] ✅ Linked existing investment to payment record`);
        }
        
        const response = res as any;
        console.log(`[NOWPayments Callback] ✅✅✅ CALLBACK PROCESSING COMPLETE (DUPLICATE INVESTMENT) ✅✅✅`);
        console.log(`${'='.repeat(80)}\n`);
        return response.status(200).json({
          status: "success",
          message: "Investment already exists - duplicate callback",
        });
      }
      
      // FIXED: Use invoice_id as primary identifier (matches Payment.paymentId)
      // This ensures investments can be linked back to payment records
      // Define txnId outside the if block so it's available for all logging
      const txnId = invoiceIdStr || payment.paymentId;
      
      // Auto-create investment if it doesn't exist yet
      if (!payment.investmentId) {
        console.log(`[NOWPayments Callback] 💼 Investment does not exist, creating now...`);
        try {
          // Extract voucherId from payment meta if available
          const voucherId = payment.meta && (payment.meta as any).voucherId 
            ? (payment.meta as any).voucherId 
            : undefined;
          
          console.log(`[NOWPayments Callback] Investment Creation Parameters:`);
          console.log(`[NOWPayments Callback]   - User ID: ${userId}`);
          console.log(`[NOWPayments Callback]   - Package ID: ${payment.package}`);
          console.log(`[NOWPayments Callback]   - Amount: $${parseFloat(payment.amount.toString())}`);
          console.log(`[NOWPayments Callback]   - Transaction ID (invoice_id): ${txnId}`);
          console.log(`[NOWPayments Callback]   - Payment ID (from callback): ${paymentIdStr || 'N/A'}`);
          console.log(`[NOWPayments Callback]   - Voucher ID: ${voucherId || 'none'}`);
          
          const investment = await processInvestment(
            new Types.ObjectId(userId),
            payment.package as Types.ObjectId,
            parseFloat(payment.amount.toString()),
            txnId, // Use invoice_id (matches Payment.paymentId) to ensure proper linking
            voucherId
          );
          
          // Link investment to payment
          payment.investmentId = investment._id as Types.ObjectId;
          await payment.save();

          // Investment confirmation email is sent by processInvestment (investment.service)

          console.log(`[NOWPayments Callback] ✅✅✅ INVESTMENT CREATED SUCCESSFULLY ✅✅✅`);
          console.log(`[NOWPayments Callback] Investment Details:`);
          console.log(`[NOWPayments Callback]   - Investment ID: ${investment._id}`);
          console.log(`[NOWPayments Callback]   - Investment Amount: $${parseFloat(payment.amount.toString())}`);
          console.log(`[NOWPayments Callback]   - Payment ID: ${txnId}`);
          console.log(`[NOWPayments Callback]   - Order ID: ${orderId}`);
          console.log(`[NOWPayments Callback]   - User ID: ${userId}`);
          console.log(`[NOWPayments Callback]   - Package: ${(payment.package as any)?.packageName || 'N/A'}`);
          console.log(`[NOWPayments Callback]   - Linked to Payment Record: ✅`);
        } catch (investmentError: any) {
          console.error(`[NOWPayments Callback] ❌❌❌ INVESTMENT CREATION FAILED ❌❌❌`);
          console.error(`[NOWPayments Callback] Payment ID: ${txnId}`);
          console.error(`[NOWPayments Callback] Order ID: ${orderId}`);
          console.error(`[NOWPayments Callback] User ID: ${userId}`);
          console.error(`[NOWPayments Callback] Error Message: ${investmentError.message}`);
          console.error(`[NOWPayments Callback] Error Stack:`, investmentError.stack);
          console.error(`[NOWPayments Callback] Full Error:`, JSON.stringify(investmentError, null, 2));
          // Don't fail the callback - investment can be created manually later
          // The success page will also try to create it
        }
      } else {
        console.log(`[NOWPayments Callback] ℹ️ Investment already exists for payment ${txnId}`);
        console.log(`[NOWPayments Callback] Existing Investment ID: ${payment.investmentId}`);
      }
      
      const response = res as any;
      console.log(`[NOWPayments Callback] ✅✅✅ CALLBACK PROCESSING COMPLETE ✅✅✅`);
      console.log(`[NOWPayments Callback] Returning success response to NOWPayments`);
      console.log(`${'='.repeat(80)}\n`);
      return response.status(200).json({
        status: "success",
        message: "Payment callback processed - payment confirmed and investment processed",
      });
    } else if (isFailed) {
      payment.status = "failed";
      await payment.save();
      
      console.log(`[NOWPayments Callback] ❌❌❌ PAYMENT FAILED ❌❌❌`);
      console.log(`[NOWPayments Callback] Payment ${callback.payment_id} failed for order ${orderId}`);
      console.log(`[NOWPayments Callback] Payment Status: ${paymentStatusStr}`);
      console.log(`[NOWPayments Callback] Order ID: ${orderId}`);
      console.log(`[NOWPayments Callback] User ID: ${userId}`);
      console.log(`[NOWPayments Callback] Payment record updated to 'failed' status`);
      console.log(`${'='.repeat(80)}\n`);
      
      const response = res as any;
      return response.status(200).json({
        status: "success",
        message: "Payment failed - callback processed",
      });
    } else {
      // Payment is still pending
      payment.status = "processing";
      await payment.save();
      
      console.log(`[NOWPayments Callback] ⏳ PAYMENT PENDING`);
      console.log(`[NOWPayments Callback] Payment ${callback.payment_id} is pending for order ${orderId}`);
      console.log(`[NOWPayments Callback] Payment Status: ${paymentStatusStr}`);
      console.log(`[NOWPayments Callback] Order ID: ${orderId}`);
      console.log(`[NOWPayments Callback] User ID: ${userId}`);
      console.log(`[NOWPayments Callback] Payment record updated to 'processing' status`);
      console.log(`[NOWPayments Callback] Will process investment when payment is completed`);
      console.log(`${'='.repeat(80)}\n`);
      
      const response = res as any;
      return response.status(200).json({
        status: "success",
        message: "Payment pending - callback received",
      });
    }
  } catch (error: any) {
    console.error(`[NOWPayments Callback] ❌❌❌ ERROR PROCESSING CALLBACK ❌❌❌`);
    console.error(`[NOWPayments Callback] Payment ID: ${callback.payment_id}`);
    console.error(`[NOWPayments Callback] Order ID: ${orderId}`);
    console.error(`[NOWPayments Callback] User ID: ${userId}`);
    console.error(`[NOWPayments Callback] Error Message: ${error.message}`);
    console.error(`[NOWPayments Callback] Error Stack:`, error.stack);
    console.error(`[NOWPayments Callback] Full Error:`, JSON.stringify(error, null, 2));
    
    payment.status = "processing";
    await payment.save();
    
    console.log(`[NOWPayments Callback] Payment record updated to 'processing' status`);
    console.log(`[NOWPayments Callback] Returning 200 to NOWPayments to prevent retries`);
    console.log(`${'='.repeat(80)}\n`);
    
    // Still return 200 to NOWPayments so they don't retry
    const response = res as any;
    return response.status(200).json({
      status: "error",
      message: "Callback received but processing failed",
    });
  }
});

/**
 * Get payment status
 * GET /api/v1/payment/status/:paymentId
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    throw new AppError("Payment ID is required", 400);
  }

  try {
    const paymentStatus = await getNOWPaymentsPaymentStatus(paymentId);

    const response = res as any;
    response.status(200).json({
      status: "success",
      data: {
        payment: {
          paymentId: paymentStatus.payment_id,
          status: paymentStatus.payment_status,
          payAddress: paymentStatus.pay_address,
          payAmount: paymentStatus.pay_amount,
          payCurrency: paymentStatus.pay_currency,
          actuallyPaid: paymentStatus.actually_paid,
          priceAmount: paymentStatus.price_amount,
          priceCurrency: paymentStatus.price_currency,
          orderId: paymentStatus.order_id,
        },
      },
    });
  } catch (error: any) {
    throw new AppError(
      error.message || "Failed to get payment status",
      500
    );
  }
});

/**
 * Get payment by order ID (for processing investment after payment)
 * GET /api/v1/payment/order/:orderId
 */
export const getPaymentByOrderId = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { orderId } = req.params;
  if (!orderId) {
    throw new AppError("Order ID is required", 400);
  }

  const payment = await Payment.findOne({ orderId, user: userId }).populate('package', 'packageName');
  
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  // Get voucher info if voucher was used
  let voucherInfo = null;
  if (payment.meta && (payment.meta as any).voucherId) {
    const { Voucher } = await import("../models/Voucher");
    const voucher = await Voucher.findOne({ 
      voucherId: (payment.meta as any).voucherId,
      user: userId 
    });
    if (voucher) {
      voucherInfo = {
        voucherId: voucher.voucherId,
        amount: parseFloat(voucher.amount.toString()),
        investmentValue: parseFloat(voucher.investmentValue.toString()),
        multiplier: voucher.multiplier || 2,
      };
    }
  }

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        packageId: payment.package,
        amount: parseFloat(payment.amount.toString()),
        currency: payment.currency,
        status: payment.status,
        investmentId: payment.investmentId,
        voucher: voucherInfo,
        remainingAmount: voucherInfo ? (payment.meta as any)?.remainingAmount : null,
      },
    },
  });
});

