import { User } from "../models/User";

/**
 * Generate the next sequential userId in format CNEOX-XXXXXX
 * @returns Promise<string> - Next available userId (e.g., CNEOX-000001)
 */
export async function generateNextUserId(): Promise<string> {
  // Find the user with the highest userId (check both CNEOX and CROWN formats for migration compatibility)
  const lastUser = await User.findOne(
    { userId: { $regex: /^(CNEOX|CROWN)-/ } },
    {},
    { sort: { userId: -1 } }
  );

  if (!lastUser || !lastUser.userId) {
    // No users exist, return root user ID
    return "CNEOX-000000";
  }

  // Extract the number part from the last userId (handle both CNEOX and CROWN formats)
  const match = lastUser.userId.match(/(?:CNEOX|CROWN)-(\d+)/);
  if (!match) {
    // If format is wrong, start from 000000
    return "CNEOX-000000";
  }

  const lastNumber = parseInt(match[1], 10);
  const nextNumber = lastNumber + 1;

  // Format as 6-digit number with leading zeros
  const formattedNumber = nextNumber.toString().padStart(6, "0");
  return `CNEOX-${formattedNumber}`;
}

/**
 * Find user by userId (CNEOX-XXXXXX format, also supports CROWN-XXXXXX for backward compatibility)
 * @param userId - User ID in format CNEOX-XXXXXX or CROWN-XXXXXX
 * @returns Promise<User | null>
 */
export async function findUserByUserId(userId: string) {
  return await User.findOne({ userId });
}

