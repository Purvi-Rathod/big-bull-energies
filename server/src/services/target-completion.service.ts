import { Types } from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { AppError } from "../utils/AppError";

/**
 * Check if user has completed their binary target
 * Rules:
 * 1. Both left and right legs must have business > 0
 * 2. Left Business + Right Business >= Target Amount
 * 
 * @param userId - User ID to check
 * @returns Object with completion status and details
 */
export async function checkTargetCompletion(userId: Types.ObjectId): Promise<{
  isCompleted: boolean;
  leftBusiness: number;
  rightBusiness: number;
  totalBusiness: number;
  targetAmount: number;
  message?: string;
}> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const binaryTree = await BinaryTree.findOne({ user: userId });
    if (!binaryTree) {
      throw new AppError("Binary tree not found", 404);
    }

    const targetAmount = user.binaryTargetAmount || 0;
    
    // If no target set, allow withdrawals (backward compatibility)
    if (targetAmount === 0) {
      return {
        isCompleted: true,
        leftBusiness: parseFloat(binaryTree.leftBusiness.toString()),
        rightBusiness: parseFloat(binaryTree.rightBusiness.toString()),
        totalBusiness: parseFloat(binaryTree.leftBusiness.toString()) + parseFloat(binaryTree.rightBusiness.toString()),
        targetAmount: 0,
      };
    }

    const leftBusiness = parseFloat(binaryTree.leftBusiness.toString());
    const rightBusiness = parseFloat(binaryTree.rightBusiness.toString());
    const totalBusiness = leftBusiness + rightBusiness;

    // Check if both legs have business (both must contribute)
    const bothLegsHaveBusiness = leftBusiness > 0 && rightBusiness > 0;
    
    // Check if total business meets target
    const meetsTarget = totalBusiness >= targetAmount;

    const isCompleted = bothLegsHaveBusiness && meetsTarget;

    let message: string | undefined;
    if (!isCompleted) {
      if (!bothLegsHaveBusiness) {
        message = "Both left and right legs must have business to complete target.";
      } else if (!meetsTarget) {
        const remaining = targetAmount - totalBusiness;
        message = `Target not completed. Need $${remaining.toFixed(2)} more business.`;
      }
    }

    return {
      isCompleted,
      leftBusiness,
      rightBusiness,
      totalBusiness,
      targetAmount,
      message,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to check target completion", 500);
  }
}

/**
 * Update user's target completion status
 * Called automatically when binary business is updated
 */
export async function updateTargetCompletionStatus(userId: Types.ObjectId): Promise<void> {
  try {
    const result = await checkTargetCompletion(userId);
    const user = await User.findById(userId);
    
    if (!user) {
      return;
    }

    // Update status if target is completed
    if (result.isCompleted && user.targetStatus !== "completed") {
      user.targetStatus = "completed";
      user.withdrawEnabled = true;
      await user.save();
    } else if (!result.isCompleted && user.targetStatus === "completed") {
      // If somehow target becomes incomplete (shouldn't happen, but handle it)
      user.targetStatus = "pending";
      user.withdrawEnabled = false;
      await user.save();
    }
  } catch (error) {
    console.error(`Error updating target completion status for user ${userId}:`, error);
    // Don't throw - this is a background update
  }
}
