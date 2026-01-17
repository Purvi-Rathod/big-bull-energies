// API utility functions for making requests to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.crownbankers.com/api/v1';
// const API_BASE_URL = 'http://localhost:8000/api/v1';
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const isAdminRoute = endpoint.startsWith('/admin');
      
      // Check if we're in an impersonation context (new tab with user session)
      const isImpersonating = sessionStorage.getItem('isImpersonating') === 'true';
      
      let token: string | null = null;
      
      if (isAdminRoute) {
        // For admin routes: use adminToken, or token if CROWN-000000 or CROWN-000000
        // Don't use impersonated token for admin routes
        if (!isImpersonating) {
          token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        }
      } else {
        // For user routes: prioritize impersonated token if in impersonation context
        if (isImpersonating) {
          token = sessionStorage.getItem('token') || localStorage.getItem('impersonatedToken');
        } else {
          token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        }
      }
      
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      // Add timeout to prevent hanging requests (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration (401 Unauthorized)
        if (response.status === 401) {
          // Check if this is an admin endpoint and user might just not have admin access
          // In this case, don't redirect - let the component handle the error
          const isAdminEndpoint = endpoint.startsWith('/admin');
          const hasToken = typeof window !== 'undefined' && (
            localStorage.getItem('token') || 
            localStorage.getItem('adminToken') || 
            sessionStorage.getItem('token')
          );
          
          // If it's an admin endpoint and user has a token, they might just not have admin access
          // Don't redirect in this case - let the error propagate so component can handle it
          if (isAdminEndpoint && hasToken) {
            // This is likely a permission issue, not a session expiration
            // Let the component handle it gracefully
            throw new Error(data.message || 'Access denied. Admin privileges required.');
          }
          
          // Otherwise, it's a real session expiration - redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('impersonatedToken');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('isImpersonating');
            
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              // Store the current path to redirect back after login
              sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
              window.location.href = '/login';
            }
          }
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error: any) {
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      // Handle network errors
      if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }

  // User Auth
  async userSignup(data: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    country?: string;
    referrerId?: string;
    position?: 'left' | 'right';
  }) {
    const response = await this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token in localStorage after signup (similar to login)
    if (response.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  }

  async validateReferrer(referrerId: string) {
    return this.request<{ valid: boolean; message: string; referrer?: { userId: string; name: string } }>(`/auth/validate-referrer/${encodeURIComponent(referrerId)}`, {
      method: 'GET',
    });
  }

  async verifyLoginToken(token: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/verify-login-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    
    if (response.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  }

  async userLogin(data: { userId: string; password: string }) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  }

  async userLogout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    
    return response;
  }

  async getUserProfile() {
    return this.request<{ user: any }>('/auth/me', {
      method: 'GET',
    });
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    walletAddress?: string;
    bankAccount?: {
      accountNumber?: string;
      bankName?: string;
      ifscCode?: string;
      accountHolderName?: string;
    };
  }) {
    return this.request<{ user: any }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(userId: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Admin Auth
  async adminSignup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: number;
  }) {
    const response = await this.request<{ admin: any; token: string }>('/admin/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token in localStorage after signup (similar to login)
    if (response.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('adminToken', response.data.token);
    }
    
    return response;
  }

  async adminLogin(data: { email: string; password: string }) {
    const response = await this.request<{ admin: any; token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('adminToken', response.data.token);
    }
    
    return response;
  }

  async adminLogout() {
    const response = await this.request('/admin/logout', {
      method: 'POST',
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
    
    return response;
  }

  async getAdminProfile() {
    return this.request<{ admin: any }>('/admin/me', {
      method: 'GET',
    });
  }

  // Package CRUD (Admin only)
  async getPackages(params?: { status?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request<{ packages: any[]; pagination: any }>(
      `/admin/packages${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async getPackageById(id: string) {
    return this.request<{ package: any }>(`/admin/packages/${id}`, {
      method: 'GET',
    });
  }

  async createPackage(data: any) {
    return this.request<{ package: any }>('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePackage(id: string, data: any) {
    return this.request<{ package: any }>(`/admin/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePackage(id: string) {
    return this.request(`/admin/packages/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUserWallets() {
    return this.request<{ wallets: any[] }>('/user/wallets', {
      method: 'GET',
    });
  }

  async getUserPackages() {
    return this.request<{ packages: any[] }>('/user/packages', {
      method: 'GET',
    });
  }

  async createInvestment(data: { packageId: string; amount: number; currency?: string; paymentId?: string; voucherId?: string }) {
    return this.request<{ investment: any; payment: any; wallets: any[]; binaryTree: any }>('/user/invest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // NOWPayments integration
  async createPayment(data: { packageId: string; amount: number; currency?: string; voucherId?: string }) {
    return this.request<{ payment?: any; orderId?: string; voucher?: any; remainingAmount?: number; investment?: any }>('/payment/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(paymentId: string) {
    return this.request<{ payment: any }>(`/payment/status/${paymentId}`, {
      method: 'GET',
    });
  }

  async getPaymentByOrderId(orderId: string) {
    return this.request<{ payment: any }>(`/payment/order/${orderId}`, {
      method: 'GET',
    });
  }

  async getUserInvestments() {
    return this.request<{ investments: any[] }>('/user/investments', {
      method: 'GET',
    });
  }

  async getUserBinaryTree() {
    return this.request<{ binaryTree: any }>('/user/binary-tree', {
      method: 'GET',
    });
  }

  async getUserTransactions(params?: { walletType?: string; type?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.walletType) queryParams.append('walletType', params.walletType);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request<{ transactions: any[]; pagination: any }>(
      `/user/transactions${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async getMyTree(depth?: number) {
    const params = new URLSearchParams();
    if (depth) params.append('depth', depth.toString());
    const query = params.toString();
    return this.request<{ tree: any[]; rootUserId: string; rootName: string; totalNodes: number; maxDepth: number }>(
      `/tree/my-tree${query ? `?${query}` : ''}`,
      {
        method: 'GET',
      }
    );
  }

  async getNodeDownlines(userId: string, maxDepth?: number) {
    const params = new URLSearchParams();
    if (maxDepth) params.append('maxDepth', maxDepth.toString());
    const query = params.toString();
    return this.request<{ tree: any[]; rootUserId: string; rootName: string; totalNodes: number; maxDepth: number }>(
      `/tree/node/${encodeURIComponent(userId)}/downlines${query ? `?${query}` : ''}`,
      {
        method: 'GET',
      }
    );
  }

  async getWithdrawalSchedule() {
    return this.request<{
      hasActiveInvestment: boolean;
      packageName?: string;
      scheduleDescription?: string;
      canWithdrawToday?: boolean;
      nextWithdrawalDate?: string;
      nextWithdrawalDateFormatted?: string;
      thisMonthDates?: Array<{ date: string; formatted: string }>;
      nextMonthDates?: Array<{ date: string; formatted: string }>;
      message?: string;
    }>('/user/withdrawal-schedule', {
      method: 'GET',
    });
  }

  async createWithdrawal(data: { amount: number; walletType: string; method?: string; cryptoType?: string; merchant?: string }) {
    return this.request<{ withdrawal: any }>('/user/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserWithdrawals() {
    return this.request<{ withdrawals: any[] }>('/user/withdrawals', {
      method: 'GET',
    });
  }

  async getMinimumVoucherAmount() {
    return this.request<{ minimumVoucherAmount: number; minimumInvestment: number }>('/user/vouchers/minimum-amount', {
      method: 'GET',
    });
  }

  async createVoucher(data: { amount: number; fromWalletType?: string; currency?: string }) {
    return this.request<{ voucher: any; payment?: any; orderId?: string }>('/user/vouchers/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserVouchers(params?: { status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request<{ vouchers: any[] }>(
      `/user/vouchers${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async updateWalletAddress(data: { walletAddress?: string; bankAccount?: any }) {
    return this.request<{ user: any }>('/user/wallet-address', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getReferralLinks() {
    return this.request<{ leftReferralLink: string; rightReferralLink: string; userId: string }>('/user/referral-links', {
      method: 'GET',
    });
  }

  async getUserReferralLinks() {
    return this.request<{ leftLink: string; rightLink: string; userId: string }>('/user/referral-links', {
      method: 'GET',
    });
  }

  // Wallet Exchange feature has been removed - users should use vouchers for reinvestment
  // async exchangeWalletFunds(data: { fromWalletType: string; toWalletType: string; amount: number; exchangeRate?: number }) {
  //   return this.request<{
  //     exchangeId: string;
  //     fromWallet: { type: string; balanceBefore: number; balanceAfter: number; amountDebited: number };
  //     toWallet: { type: string; balanceBefore: number; balanceAfter: number; amountCredited: number };
  //     exchangeRate: number;
  //   }>('/user/wallet-exchange', {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //   });
  // }

  async getUserReports() {
    return this.request<{ roi: any[]; binary: any[]; referral: any[]; careerLevel: any[]; investment: any[]; withdrawals: any[] }>('/user/reports', {
      method: 'GET',
    });
  }

  async getUserDirectReferrals(params?: { page?: number; limit?: number; search?: string; status?: string; position?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.position) queryParams.append('position', params.position);
    
    const queryString = queryParams.toString();
    const url = `/user/direct-referrals${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ referrals: any[]; pagination: { page: number; limit: number; total: number; pages: number } }>(url, {
      method: 'GET',
    });
  }

  // Admin User Management
  async getAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return this.request<{ users: any[]; pagination: any }>(
      `/admin/users${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async impersonateUser(userId: string) {
    const response = await this.request<{ user: any; token: string }>(`/admin/impersonate/${userId}`, {
      method: 'POST',
    });
    
    // Don't store token here - it will be handled by the impersonate page in the new tab
    // This allows the admin panel to maintain its own session
    
    return response;
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended' | 'blocked' | 'suspected') {
    return this.request<{ userId: string; name: string; email: string; status: string }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(userId: string) {
    return this.request<{ deletedUserId: string; deletedUserName: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async changeUserPassword(userId: string, newPassword: string) {
    return this.request<{ userId: string; name: string; email: string }>(`/admin/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Voucher Management (Admin)
  async getAllVouchers() {
    return this.request<{ vouchers: any[] }>('/admin/vouchers', {
      method: 'GET',
    });
  }

  async createVoucherForUser(data: { userId: string; amount: number; expiryDays?: number }) {
    return this.request<{ voucher: any }>('/admin/vouchers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async flushAllInvestments() {
    return this.request<{
      investmentsDeleted: number;
      transactionsDeleted: number;
      walletsReset: string;
      binaryTreesReset: string;
    }>('/admin/investments/flush-all', {
      method: 'DELETE',
    });
  }

  async flushAllUserData() {
    return this.request<{
      binaryTreesReset: number;
      walletsReset: number;
      careerProgressReset: number;
      investmentsDeleted: number;
      transactionsDeleted: number;
      paymentsDeleted: number;
      preserved: {
        userAccounts: string;
        binaryTreeStructure: string;
        vouchers: string;
        referrals: string;
      };
    }>('/admin/flush-user-data', {
      method: 'DELETE',
    });
  }

  async getAdminStatistics() {
    return this.request<{
      totalUsers: number;
      verifiedUsers: number;
      unverifiedUsers: number;
      totalDeposits: string;
      totalWithdrawals: string;
      totalInvestment: string;
      totalVoucherInvestment: string;
      totalFreeInvestment: string;
      totalPowerlegInvestment: string;
      totalROI: string;
      totalReferralBonus: string;
      totalBinaryBonus: string;
    }>('/admin/statistics', {
      method: 'GET',
    });
  }

  async getAdminReports(params?: { type?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request<{
      roi?: any[];
      binary?: any[];
      referral?: any[];
      investment?: any[];
      withdrawals?: any[];
      transactions?: any[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/admin/reports${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getDailyBusinessReport(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request<any>(`/admin/reports/daily-business${params}`, {
      method: 'GET',
    });
  }

  async getNOWPaymentsReport() {
    return this.request<any>('/admin/reports/nowpayments', {
      method: 'GET',
    });
  }

  async getCountryBusinessReport() {
    return this.request<any>('/admin/reports/country-business', {
      method: 'GET',
    });
  }

  async getInvestmentsReport() {
    return this.request<any>('/admin/reports/investments', {
      method: 'GET',
    });
  }

  async getWithdrawalsReport() {
    return this.request<any>('/admin/reports/withdrawals', {
      method: 'GET',
    });
  }

  async getBinaryReport() {
    return this.request<any>('/admin/reports/binary', {
      method: 'GET',
    });
  }

  async getReferralReport() {
    return this.request<any>('/admin/reports/referral', {
      method: 'GET',
    });
  }

  async getROIReport() {
    return this.request<any>('/admin/reports/roi', {
      method: 'GET',
    });
  }

  async adminCreateInvestment(data: { userId: string; packageId: string; amount: number; type?: string }) {
    return this.request<{ investment: any }>('/admin/investments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllTickets(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request<{ tickets: any[]; pagination: any }>(
      `/admin/tickets${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async updateTicket(ticketId: string, data: { status?: string; reply?: string }) {
    return this.request<{ ticket: any }>(`/admin/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createTicket(data: { department: string; service?: string; subject: string; description?: string; document?: string }) {
    return this.request<{ ticket: any }>('/user/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserTickets() {
    return this.request<{ tickets: any[] }>('/user/tickets', {
      method: 'GET',
    });
  }

  async getAdminWithdrawals(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request<{ withdrawals: any[]; pagination: any }>(
      `/admin/withdrawals${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async approveWithdrawal(withdrawalId: string) {
    return this.request<{ withdrawal: any }>(`/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
    });
  }

  async rejectWithdrawal(withdrawalId: string, reason?: string) {
    return this.request<{ withdrawal: any }>(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async triggerDailyCalculations(data?: { includeROI?: boolean; includeBinary?: boolean; includeReferral?: boolean }) {
    return this.request<{ jobId: string; status: string; startedAt: string; includeROI: boolean; includeBinary: boolean; includeReferral: boolean }>('/admin/trigger-daily-calculations', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getCalculationJobStatus(jobId: string) {
    return this.request<any>('/admin/calculation-job/' + jobId, {
      method: 'GET',
    });
  }

  async getLatestCalculationJob() {
    return this.request<any>('/admin/calculation-job/latest', {
      method: 'GET',
    });
  }

  async resumeCalculationJob(jobId: string) {
    return this.request<any>('/admin/calculation-job/' + jobId + '/resume', {
      method: 'POST',
    });
  }

  // Settings management
  async getNOWPaymentsStatus() {
    return this.request<{ enabled: boolean }>('/admin/settings/nowpayments', {
      method: 'GET',
    });
  }

  async updateNOWPaymentsStatus(enabled: boolean) {
    return this.request<{ enabled: boolean }>('/admin/settings/nowpayments', {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  async getAuthRateLimitingStatus() {
    return this.request<{ enabled: boolean }>('/admin/settings/auth-rate-limiting', {
      method: 'GET',
    });
  }

  async updateAuthRateLimitingStatus(enabled: boolean) {
    return this.request<{ enabled: boolean }>('/admin/settings/auth-rate-limiting', {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  async deactivateAllUsers() {
    return this.request<{ usersDeactivated: number; totalUsers: number }>('/admin/settings/deactivate-all-users', {
      method: 'POST',
    });
  }

  async getWithdrawalSchedules() {
    return this.request<{ schedules: any; packageSchedules: Array<{ packageId: string; packageName: string; hasCustomSchedule: boolean; schedule: any }> }>('/admin/settings/withdrawal-schedules', {
      method: 'GET',
    });
  }

  async updateWithdrawalSchedule(packageName: string, schedule: { type: 'days_of_month' | 'day_of_week'; values: number[]; enabled: boolean } | null) {
    return this.request<{ schedules: any }>('/admin/settings/withdrawal-schedules', {
      method: 'PUT',
      body: JSON.stringify({ packageName, schedule }),
    });
  }

  // Career Level Management (Admin)
  async getAllCareerLevels() {
    return this.request<{ levels: any[] }>('/admin/career-levels', {
      method: 'GET',
    });
  }

  async getCareerLevelById(id: string) {
    return this.request<{ level: any }>(`/admin/career-levels/${id}`, {
      method: 'GET',
    });
  }

  async createCareerLevel(data: {
    name: string;
    investmentThreshold: number;
    rewardAmount: number;
    level: number;
    status?: 'Active' | 'InActive';
    description?: string;
  }) {
    return this.request<{ level: any }>('/admin/career-levels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCareerLevel(id: string, data: {
    name?: string;
    investmentThreshold?: number;
    rewardAmount?: number;
    level?: number;
    status?: 'Active' | 'InActive';
    description?: string;
  }) {
    return this.request<{ level: any }>(`/admin/career-levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCareerLevel(id: string) {
    return this.request(`/admin/career-levels/${id}`, {
      method: 'DELETE',
    });
  }

  // Career Progress (Admin)
  async getAllUsersCareerProgress(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    return this.request<{ progress: any[]; pagination: any }>(`/admin/career-progress?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getUserCareerProgressAdmin(userId: string) {
    return this.request<{ progress: any }>(`/admin/career-progress/${userId}`, {
      method: 'GET',
    });
  }

  // Career Progress (User)
  async getUserCareerProgress() {
    return this.request<{ progress: any }>('/user/career-progress', {
      method: 'GET',
    });
  }

  // Gallery Management (Admin)
  async getAllGalleryItemsAdmin(params?: { category?: string; status?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request<{ items: any[]; categories: string[]; pagination: any }>(
      `/admin/gallery${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async getGalleryItemById(id: string) {
    return this.request<{ item: any }>(`/admin/gallery/${id}`, {
      method: 'GET',
    });
  }

  async createGalleryItem(data: {
    title: string;
    description?: string;
    mediaUrl: string;
    mediaType: 'photo' | 'video';
    category: string;
    thumbnailUrl?: string;
    order?: number;
    status?: 'Active' | 'InActive';
  }) {
    return this.request<{ item: any }>('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGalleryItem(id: string, data: {
    title?: string;
    description?: string;
    mediaUrl?: string;
    mediaType?: 'photo' | 'video';
    category?: string;
    thumbnailUrl?: string;
    order?: number;
    status?: 'Active' | 'InActive';
  }) {
    return this.request<{ item: any }>(`/admin/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGalleryItem(id: string) {
    return this.request(`/admin/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  async getGalleryCategories() {
    return this.request<{ categories: string[] }>('/admin/gallery/categories', {
      method: 'GET',
    });
  }

  async uploadGalleryMedia(file: File, folder?: string, resourceType?: 'image' | 'video' | 'auto') {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (resourceType) formData.append('resourceType', resourceType);

    return this.request<{
      url: string;
      publicId: string;
      format: string;
      width?: number;
      height?: number;
      bytes: number;
      resourceType: string;
    }>('/admin/gallery/upload', {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

