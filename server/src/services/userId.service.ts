import { User } from "../models/User";

/**
 * Generate the next sequential userId in format BIGBULL-XXXXXX
 * Uses the max numeric suffix among BIGBULL-* IDs only.
 * @returns Promise<string> - Next available userId (e.g., BIGBULL-000001)
 */
export async function generateNextUserId(): Promise<string> {
  const result = await User.aggregate<{ maxNum: number }>([
    { $match: { userId: { $regex: /^BIGBULL-/ } } },
    {
      $project: {
        num: {
          $convert: {
            input: {
              $arrayElemAt: [{ $split: ["$userId", "-"] }, 1],
            },
            to: "int",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    { $match: { num: { $ne: null } } },
    { $group: { _id: null, maxNum: { $max: "$num" } } },
  ]);

  const lastNumber = result[0]?.maxNum ?? -1;
  const nextNumber = lastNumber + 1;

  // Format as 6-digit number with leading zeros
  const formattedNumber = nextNumber.toString().padStart(6, "0");
  return `BIGBULL-${formattedNumber}`;
}

/**
 * Find user by userId (BIGBULL-XXXXXX format, also supports CROWN-/CNEOX- for backward compatibility lookups)
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
