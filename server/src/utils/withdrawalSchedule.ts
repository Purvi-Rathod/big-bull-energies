/**
 * ROI Withdrawal Schedule Utility
 * Determines if a user can withdraw ROI based on their package type and current date
 */

interface CustomSchedule {
  type: 'days_of_month' | 'day_of_week';
  values: number[]; // For days_of_month: [15, 30], for day_of_week: [0] (0=Sunday)
  enabled: boolean;
}

interface WithdrawalSchedules {
  [packageName: string]: CustomSchedule;
}

/**
 * Get custom withdrawal schedules from Settings (async)
 */
export async function getCustomSchedules(): Promise<WithdrawalSchedules | null> {
  try {
    const { Settings } = await import('../models/Settings');
    const setting = await Settings.findOne({ key: 'withdrawal_schedules' });
    if (setting && setting.value) {
      return setting.value as WithdrawalSchedules;
    }
  } catch (error) {
    console.error('Error fetching custom withdrawal schedules:', error);
  }
  return null;
}

/**
 * Check if today is a valid ROI withdrawal date for a given package
 * @param packageName - The name of the package (e.g., "Solar Starter", "Power Growth", "Elite Energy")
 * @param date - Optional date to check (defaults to today)
 * @param customSchedules - Optional custom schedules (if not provided, will fetch from DB)
 * @returns Promise<boolean> - true if withdrawal is allowed today, false otherwise
 */
export async function isWithdrawalDateValid(
  packageName: string,
  date: Date = new Date(),
  customSchedules?: WithdrawalSchedules | null
): Promise<boolean> {
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Normalize package name for comparison (case-insensitive)
  const normalizedPackageName = packageName.toLowerCase().trim();
  
  // Get custom schedules if not provided
  let schedules = customSchedules;
  if (schedules === undefined) {
    schedules = await getCustomSchedules();
  }
  
  // Check custom schedule first (if exists)
  if (schedules && schedules[packageName]) {
    const customSchedule = schedules[packageName];
    if (!customSchedule.enabled) {
      return true; // If disabled, allow daily withdrawals
    }
    
    if (customSchedule.type === 'days_of_month') {
      return customSchedule.values.includes(dayOfMonth);
    } else if (customSchedule.type === 'day_of_week') {
      return customSchedule.values.includes(dayOfWeek);
    }
  }
  
  // Default schedules (if no custom schedule)
  // Solar Starter: ROI withdrawals on the 15th and 30th of every month (2 times per month)
  if (normalizedPackageName.includes('solar starter') || normalizedPackageName.includes('solarstarter')) {
    return dayOfMonth === 15 || dayOfMonth === 30;
  }
  
  // Power Growth: ROI withdrawals on the 10th, 20th, and 30th of every month (3 times per month)
  if (normalizedPackageName.includes('power growth') || normalizedPackageName.includes('powergrowth')) {
    return dayOfMonth === 10 || dayOfMonth === 20 || dayOfMonth === 30;
  }
  
  // Elite Energy: ROI withdrawals every Sunday (4 times per month)
  if (normalizedPackageName.includes('elite energy') || normalizedPackageName.includes('eliteenergy')) {
    return dayOfWeek === 0; // 0 = Sunday
  }
  
  // Default: If package name doesn't match, allow withdrawal (for backward compatibility)
  return true; // Allow for unknown packages (backward compatibility)
}

/**
 * Get the next withdrawal date for a given package
 * @param packageName - The name of the package
 * @param fromDate - Optional date to start from (defaults to today)
 * @param customSchedules - Optional custom schedules
 * @returns Promise<Date> - The next valid withdrawal date
 */
export async function getNextWithdrawalDate(
  packageName: string,
  fromDate: Date = new Date(),
  customSchedules?: WithdrawalSchedules | null
): Promise<Date> {
  const currentDate = new Date(fromDate);
  currentDate.setHours(0, 0, 0, 0);
  
  // Get custom schedules if not provided
  let schedules = customSchedules;
  if (schedules === undefined) {
    schedules = await getCustomSchedules();
  }
  
  // Check up to 35 days ahead to find the next withdrawal date
  for (let i = 0; i < 35; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(currentDate.getDate() + i);
    
    if (await isWithdrawalDateValid(packageName, checkDate, schedules)) {
      return checkDate;
    }
  }
  
  // Fallback: return a date 30 days from now if no match found
  const fallbackDate = new Date(currentDate);
  fallbackDate.setDate(currentDate.getDate() + 30);
  return fallbackDate;
}

/**
 * Get all withdrawal dates for the current month for a given package
 * @param packageName - The name of the package
 * @param month - Optional month (0-11, defaults to current month)
 * @param year - Optional year (defaults to current year)
 * @param customSchedules - Optional custom schedules
 * @returns Promise<Date[]> - Array of valid withdrawal dates
 */
export async function getWithdrawalDatesForMonth(
  packageName: string,
  month?: number,
  year?: number,
  customSchedules?: WithdrawalSchedules | null
): Promise<Date[]> {
  const normalizedPackageName = packageName.toLowerCase().trim();
  const today = new Date();
  const targetMonth = month !== undefined ? month : today.getMonth();
  const targetYear = year !== undefined ? year : today.getFullYear();
  
  const dates: Date[] = [];
  
  // Get custom schedules if not provided
  let schedules = customSchedules;
  if (schedules === undefined) {
    schedules = await getCustomSchedules();
  }
  
  // Check custom schedule first
  if (schedules && schedules[packageName] && schedules[packageName].enabled) {
    const customSchedule = schedules[packageName];
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    
    if (customSchedule.type === 'days_of_month') {
      for (const day of customSchedule.values) {
        if (day >= 1 && day <= daysInMonth) {
          dates.push(new Date(targetYear, targetMonth, day));
        }
      }
    } else if (customSchedule.type === 'day_of_week') {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(targetYear, targetMonth, day);
        if (customSchedule.values.includes(date.getDay())) {
          dates.push(date);
        }
      }
    }
    
    return dates.sort((a, b) => a.getTime() - b.getTime());
  }
  
  // Default schedules (if no custom schedule)
  // Solar Starter: 15th and 30th
  if (normalizedPackageName.includes('solar starter') || normalizedPackageName.includes('solarstarter')) {
    const date15 = new Date(targetYear, targetMonth, 15);
    const date30 = new Date(targetYear, targetMonth, 30);
    if (await isWithdrawalDateValid(packageName, date15, schedules)) dates.push(date15);
    if (await isWithdrawalDateValid(packageName, date30, schedules)) dates.push(date30);
  }
  // Power Growth: 10th, 20th, and 30th
  else if (normalizedPackageName.includes('power growth') || normalizedPackageName.includes('powergrowth')) {
    const date10 = new Date(targetYear, targetMonth, 10);
    const date20 = new Date(targetYear, targetMonth, 20);
    const date30 = new Date(targetYear, targetMonth, 30);
    if (await isWithdrawalDateValid(packageName, date10, schedules)) dates.push(date10);
    if (await isWithdrawalDateValid(packageName, date20, schedules)) dates.push(date20);
    if (await isWithdrawalDateValid(packageName, date30, schedules)) dates.push(date30);
  }
  // Elite Energy: Every Sunday
  else if (normalizedPackageName.includes('elite energy') || normalizedPackageName.includes('eliteenergy')) {
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      if (date.getDay() === 0) { // Sunday
        dates.push(date);
      }
    }
  }
  
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Get withdrawal schedule description for a package
 * @param packageName - The name of the package
 * @param customSchedules - Optional custom schedules
 * @returns Promise<string> - Human-readable schedule description
 */
export async function getWithdrawalScheduleDescription(
  packageName: string,
  customSchedules?: WithdrawalSchedules | null
): Promise<string> {
  // Get custom schedules if not provided
  let schedules = customSchedules;
  if (schedules === undefined) {
    schedules = await getCustomSchedules();
  }
  
  // Check custom schedule first
  if (schedules && schedules[packageName]) {
    const customSchedule = schedules[packageName];
    if (!customSchedule.enabled) {
      return 'ROI withdrawals available daily';
    }
    
    if (customSchedule.type === 'days_of_month') {
      const days = customSchedule.values.sort((a, b) => a - b);
      const daysStr = days.map(d => {
        const suffix = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';
        return `${d}${suffix}`;
      }).join(', ');
      return `ROI withdrawals on the ${daysStr} of every month (${days.length} times per month)`;
    } else if (customSchedule.type === 'day_of_week') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const days = customSchedule.values.map(d => dayNames[d]).join(', ');
      return `ROI withdrawals every ${days} (${customSchedule.values.length} day${customSchedule.values.length > 1 ? 's' : ''} per week)`;
    }
  }
  
  // Default schedules
  const normalizedPackageName = packageName.toLowerCase().trim();
  
  if (normalizedPackageName.includes('solar starter') || normalizedPackageName.includes('solarstarter')) {
    return 'ROI withdrawals on the 15th and 30th of every month (2 times per month)';
  }
  
  if (normalizedPackageName.includes('power growth') || normalizedPackageName.includes('powergrowth')) {
    return 'ROI withdrawals on the 10th, 20th, and 30th of every month (3 times per month)';
  }
  
  if (normalizedPackageName.includes('elite energy') || normalizedPackageName.includes('eliteenergy')) {
    return 'ROI withdrawals every Sunday (4 times per month)';
  }
  
  return 'ROI withdrawals available daily';
}

/**
 * Export types for use in other modules
 */
export type { CustomSchedule, WithdrawalSchedules };
