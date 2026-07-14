'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import PublicHeader from "@/components/PublicHeader";

export default function PolicyPage() {
  const { user, admin } = useAuth();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  // Removed redirects - allow logged-in users to access this page

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Privacy & <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Terms</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Your privacy and understanding of our terms are important to us
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="relative py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'terms'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'privacy'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-12 px-6 bg-#05627C">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'terms' && (
            <div className="space-y-8">
              <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
                <h2 className="text-3xl font-bold text-white mb-6">Terms of Service</h2>
                <p className="text-white/70 mb-6">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="space-y-6 text-white/80 leading-relaxed">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h3>
                    <p>
                      By accessing and using CROWN, you accept and agree to be bound by these Terms of Service. 
                      If you do not agree to these terms, please do not use our platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">2. Platform Description</h3>
                    <p>
                      CROWN is a binary MLM (Multi-Level Marketing) investment platform that enables users to 
                      invest in packages and earn returns through multiple income streams including ROI, referral 
                      bonuses, binary matching bonuses, and career level rewards.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">3. User Accounts</h3>
                    <p className="mb-3">To use CROWN, you must:</p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Be at least 18 years old</li>
                      <li>Provide accurate and complete registration information</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Notify us immediately of any unauthorized access</li>
                      <li>Use only one account per person</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">4. Investment Terms</h3>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>All investments are subject to the terms of the selected package</li>
                      <li>Investment amounts are non-refundable once activated</li>
                      <li>ROI and bonuses are calculated according to the platform's rules</li>
                      <li>Package terms, including duration and returns, are clearly displayed before activation</li>
                      <li>Daily ROI and binary bonuses are calculated and credited automatically</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">5. Payment Methods</h3>
                    <p className="mb-3">
                      CROWN accepts payments and processes withdrawals exclusively through USDT TRC20. 
                      Users must provide a valid USDT TRC20 wallet address for all transactions.
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>All deposits and withdrawals use USDT TRC20 protocol</li>
                      <li>Users are responsible for providing correct wallet addresses</li>
                      <li>Withdrawal requests are subject to admin approval</li>
                      <li>Transaction fees, if any, are the responsibility of the user</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">6. Referral and Network Building</h3>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Users may refer others using their unique referral link</li>
                      <li>Referral bonuses are paid only on the first investment of each direct referral</li>
                      <li>Binary bonuses are calculated daily based on balanced team growth</li>
                      <li>Any attempt to manipulate the referral system is prohibited</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">7. Prohibited Activities</h3>
                    <p className="mb-3">The following activities are strictly prohibited:</p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Creating multiple accounts</li>
                      <li>Using false or misleading information</li>
                      <li>Attempting to hack, manipulate, or exploit the platform</li>
                      <li>Engaging in fraudulent activities</li>
                      <li>Violating any applicable laws or regulations</li>
                      <li>Spamming or harassing other users</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">8. Account Termination</h3>
                    <p>
                      CROWN reserves the right to suspend or terminate accounts that violate these terms, 
                      engage in fraudulent activities, or pose a risk to the platform or other users. 
                      Terminated accounts may forfeit pending earnings.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">9. Limitation of Liability</h3>
                    <p>
                      CROWN provides the platform "as is" without warranties. We are not liable for any 
                      losses resulting from platform use, investment decisions, or technical issues. 
                      Investments carry inherent risks, and past performance does not guarantee future results.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">10. Changes to Terms</h3>
                    <p>
                      We reserve the right to modify these terms at any time. Users will be notified of 
                      significant changes. Continued use of the platform constitutes acceptance of updated terms.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">11. Contact Information</h3>
                    <p>
                      For questions about these Terms of Service, please contact us through the Support 
                      Tickets system in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
                <h2 className="text-3xl font-bold text-white mb-6">Privacy Policy</h2>
                <p className="text-white/70 mb-6">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="space-y-6 text-white/80 leading-relaxed">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">1. Information We Collect</h3>
                    <p className="mb-3">We collect the following types of information:</p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li><strong className="text-white">Account Information:</strong> Name, email address, user ID, password (encrypted)</li>
                      <li><strong className="text-white">Payment Information:</strong> USDT TRC20 wallet addresses</li>
                      <li><strong className="text-white">Transaction Data:</strong> Investment records, earnings, withdrawals, and wallet balances</li>
                      <li><strong className="text-white">Network Data:</strong> Referral relationships and binary tree structure</li>
                      <li><strong className="text-white">Usage Data:</strong> Login history, platform interactions, and support tickets</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h3>
                    <p className="mb-3">We use collected information to:</p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Process investments, earnings, and withdrawals</li>
                      <li>Calculate and distribute ROI, bonuses, and rewards</li>
                      <li>Maintain your account and network relationships</li>
                      <li>Provide customer support and respond to inquiries</li>
                      <li>Ensure platform security and prevent fraud</li>
                      <li>Send important account notifications</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">3. Information Sharing</h3>
                    <p className="mb-3">
                      We do not sell your personal information. We may share information only in the following circumstances:
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li><strong className="text-white">Network Visibility:</strong> Your user ID and name may be visible to your referrer and downline in the binary tree</li>
                      <li><strong className="text-white">Service Providers:</strong> With trusted third-party services that help operate our platform (payment processors, hosting)</li>
                      <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights and users' safety</li>
                      <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">4. Data Security</h3>
                    <p className="mb-3">
                      We implement industry-standard security measures to protect your information:
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Encryption of sensitive data in transit and at rest</li>
                      <li>Secure password storage using hashing algorithms</li>
                      <li>Regular security audits and updates</li>
                      <li>Access controls and authentication systems</li>
                      <li>Secure payment processing</li>
                    </ul>
                    <p className="mt-3">
                      However, no method of transmission over the internet is 100% secure. While we strive 
                      to protect your data, we cannot guarantee absolute security.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">5. Your Rights</h3>
                    <p className="mb-3">You have the right to:</p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Access your personal information through your account dashboard</li>
                      <li>Update your account information (except email, which is used for identification)</li>
                      <li>Request information about how your data is used</li>
                      <li>Request deletion of your account (subject to legal and contractual obligations)</li>
                      <li>Opt out of non-essential communications</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">6. Cookies and Tracking</h3>
                    <p>
                      We use cookies and similar technologies to maintain your session, remember preferences, 
                      and improve platform functionality. You can control cookie settings through your browser, 
                      but some features may not work properly if cookies are disabled.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">7. Data Retention</h3>
                    <p>
                      We retain your information for as long as your account is active or as needed to 
                      provide services, comply with legal obligations, resolve disputes, and enforce our agreements.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">8. Children's Privacy</h3>
                    <p>
                      CROWN is not intended for users under 18 years of age. We do not knowingly collect 
                      information from children. If you believe we have collected information from a minor, 
                      please contact us immediately.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">9. International Data Transfers</h3>
                    <p>
                      Your information may be transferred to and processed in countries other than your own. 
                      By using CROWN, you consent to such transfers.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">10. Changes to Privacy Policy</h3>
                    <p>
                      We may update this Privacy Policy periodically. Significant changes will be communicated 
                      through platform notifications. Continued use after changes constitutes acceptance.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">11. Contact Us</h3>
                    <p>
                      For privacy-related questions or concerns, please contact us through the Support Tickets 
                      system in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-yellow-500/20 mt-20 bg-#05627C">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} CROWN. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/about-us" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/policy" className="hover:text-white transition-colors">Privacy & Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}