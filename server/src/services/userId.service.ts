import { User } from "../models/User";

/** Supported userId prefixes (new + legacy). */
const USER_ID_PREFIX_REGEX = /^(CNEOX|CROWN|BIGBULL)-/;
const USER_ID_NUMBER_REGEX = /(?:CNEOX|CROWN|BIGBULL)-(\d+)/;

/**
 * Generate the next sequential userId in format BIGBULL-XXXXXX
 * @returns Promise<string> - Next available userId (e.g., BIGBULL-000001)
 */
export async function generateNextUserId(): Promise<string> {
  // Find the user with the highest userId (check BIGBULL, CROWN, and CNEOX for migration compatibility)
  const lastUser = await User.findOne(
    { userId: { $regex: USER_ID_PREFIX_REGEX } },
    {},
    { sort: { userId: -1 } }
  );

  if (!lastUser || !lastUser.userId) {
    // No users exist, return root user ID
    return "BIGBULL-000000";
  }

  // Extract the number part from the last userId
  const match = lastUser.userId.match(USER_ID_NUMBER_REGEX);
  if (!match) {
    // If format is wrong, start from 000000
    return "BIGBULL-000000";
  }

  const lastNumber = parseInt(match[1], 10);
  const nextNumber = lastNumber + 1;

  // Format as 6-digit number with leading zeros
  const formattedNumber = nextNumber.toString().padStart(6, "0");
  return `BIGBULL-${formattedNumber}`;
}

/**
 * Find user by userId (BIGBULL-XXXXXX format, also supports CROWN-/CNEOX- for backward compatibility)
 * @param userId - User ID in format BIGBULL-XXXXXX, CROWN-XXXXXX, or CNEOX-XXXXXX
 * @returns Promise<User | null>
 */
export async function findUserByUserId(userId: string) {
  return await User.findOne({ userId });
}

/** True if userId is the platform admin root account (any legacy/new prefix). */
export function isAdminUserId(userId?: string | null): boolean {
  return (
    userId === "BIGBULL-000000" ||
    userId === "CROWN-000000" ||
    userId === "CNEOX-000000"
  );
}

/** True if string looks like a branded sequential userId. */
export function isBrandedUserIdFormat(value: string): boolean {
  return (
    value.startsWith("BIGBULL-") ||
    value.startsWith("CROWN-") ||
    value.startsWith("CNEOX-")
  );
}
