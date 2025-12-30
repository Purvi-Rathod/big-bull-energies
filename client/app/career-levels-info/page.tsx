'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";

export default function CareerLevelsInfoPage() {
  const { user, admin } = useAuth();
  // Removed redirects - allow logged-in users to access this page

  const defaultLevels = [
    {
      name: "Bronze",
      level: 1,
      threshold: "$1,000",
      reward: "$200",
      description: "Your first milestone - start earning career rewards"
    },
    {
      name: "Silver",
      level: 2,
      threshold: "$5,000",
      reward: "$500",
      description: "Building momentum - substantial reward for growing teams"
    },
    {
      name: "Gold",
      level: 3,
      threshold: "$10,000",
      reward: "$1,000",
      description: "Serious achievement - significant milestone recognition"
    },
    {
      name: "Platinum",
      level: 4,
      threshold: "$20,000",
      reward: "$5,000",
      description: "Elite status - major reward for exceptional network growth"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Career <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Levels</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Progressive reward system that recognizes and rewards your network growth achievements
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* What is Career Levels */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">What are Career Levels?</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Career Levels are milestone-based rewards that recognize your network building achievements. As your 
              total business volume (left + right teams combined) grows, you unlock progressive levels, each with 
              its own reward amount. This system incentivizes long-term network growth and rewards you for building 
              successful teams.
            </p>
            <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl mt-6">
              <p className="text-white text-lg font-semibold mb-2">Key Features:</p>
              <ul className="space-y-2 text-white/80">
                <li>• Milestone-based rewards tied to total business volume</li>
                <li>• Progressive levels with increasing rewards</li>
                <li>• Automatic checking when business volume is added</li>
                <li>• Rewards credited to your Career Level Wallet</li>
                <li>• Track your progress toward the next level in your dashboard</li>
              </ul>
            </div>
          </div>

          {/* How It Works */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">How Career Levels Work</h2>
            
            <div className="space-y-6 mt-8">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 1: Business Volume Accumulation</h3>
                <p className="text-white/70 mb-4">
                  As members of your network (both left and right legs) activate investment packages, their 
                  investment amounts add to your total business volume:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Total Business Volume = Left Business + Right Business</div>
                  <div className="mt-2 text-white/70">This is cumulative - it never decreases</div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 2: Level Requirements</h3>
                <p className="text-white/70 mb-4">
                  Each career level has a threshold based on total business volume. To unlock a level, both your 
                  left and right business volumes must meet or exceed the threshold:
                </p>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-yellow-300 font-mono text-sm mb-2">
                    Level Unlocked When:
                  </p>
                  <div className="text-white/70 text-sm">
                    Left Business ≥ Level Threshold <strong className="text-white">AND</strong> Right Business ≥ Level Threshold
                  </div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 3: Automatic Checking</h3>
                <p className="text-white/70 mb-4">
                  The system automatically checks your career level eligibility whenever business volume is added 
                  to your binary tree. If you meet a level's requirements, the reward is awarded immediately:
                </p>
                <ul className="space-y-2 text-white/70 ml-6">
                  <li>• Reward amount is credited to your Career Level Wallet</li>
                  <li>• Level completion is recorded in your career progress</li>
                  <li>• You progress to the next level</li>
                  <li>• Level investment counter resets to track progress toward the next level</li>
                </ul>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 4: Progressive Levels</h3>
                <p className="text-white/70 mb-4">
                  Career levels are sequential - you must complete one level before moving to the next. Each level 
                  has a higher threshold and greater reward, encouraging continued network growth.
                </p>
              </div>
            </div>
          </div>

          {/* Career Levels Overview */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Career Level Structure</h2>
            <div className="space-y-6">
              {defaultLevels.map((level, index) => (
                <div key={index} className="p-6 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                          {level.level}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{level.name}</h3>
                          <p className="text-white/70">{level.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <div className="text-sm text-white/70 mb-1">Threshold</div>
                      <div className="text-2xl font-bold text-yellow-400">{level.threshold}</div>
                      <div className="text-sm text-white/70 mt-2 mb-1">Reward</div>
                      <div className="text-2xl font-bold text-yellow-400">{level.reward}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Example */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Complete Career Journey Example</h2>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Starting Out</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Total Business Volume: $0</li>
                  <li>• Current Level: Bronze (requires $1,000 left AND $1,000 right)</li>
                  <li>• Progress: 0%</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Achieving Bronze Level</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Left Business: $1,200</li>
                  <li>• Right Business: $1,500</li>
                  <li>• Both sides meet Bronze threshold ($1,000)</li>
                  <li>• <strong className="text-yellow-400">Bronze Level Completed!</strong></li>
                  <li>• Reward: <strong className="text-yellow-400">$200</strong> credited to Career Level Wallet</li>
                  <li>• Current Level: Silver (requires $5,000 left AND $5,000 right)</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Achieving Silver Level</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Left Business: $5,500</li>
                  <li>• Right Business: $6,000</li>
                  <li>• Both sides meet Silver threshold ($5,000)</li>
                  <li>• <strong className="text-yellow-400">Silver Level Completed!</strong></li>
                  <li>• Reward: <strong className="text-yellow-400">$500</strong> credited to Career Level Wallet</li>
                  <li>• Total Career Rewards Earned: $700</li>
                  <li>• Current Level: Gold (requires $10,000 left AND $10,000 right)</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Achieving Gold Level</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Left Business: $12,000</li>
                  <li>• Right Business: $15,000</li>
                  <li>• Both sides meet Gold threshold ($10,000)</li>
                  <li>• <strong className="text-yellow-400">Gold Level Completed!</strong></li>
                  <li>• Reward: <strong className="text-yellow-400">$1,000</strong> credited to Career Level Wallet</li>
                  <li>• Total Career Rewards Earned: $1,700</li>
                  <li>• Current Level: Platinum (requires $20,000 left AND $20,000 right)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Rules */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Important Rules</h2>
            <div className="space-y-4">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Both Sides Required</h3>
                <p className="text-white/70">
                  To unlock a career level, <strong className="text-white">both</strong> your left and right business volumes must meet 
                  or exceed the level threshold. This ensures balanced network growth.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Sequential Progression</h3>
                <p className="text-white/70">
                  You must complete levels in order (Bronze → Silver → Gold → Platinum). You cannot skip levels, 
                  but once completed, each level's reward is yours to keep.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">One Reward Per Level</h3>
                <p className="text-white/70">
                  Each career level reward is paid only once when you first meet the requirements. After that, 
                  you move to tracking progress toward the next level.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-500 mb-2">Automatic Tracking</h3>
                <p className="text-white/70">
                  The system automatically tracks your career progress. You can view your current level, progress 
                  toward the next level, and completed levels in your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Tips for Success */}
          <div className="p-8 bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-yellow-500/30">
            <h2 className="text-3xl font-bold text-white mb-6">Tips for Reaching Career Levels</h2>
            <ul className="space-y-4 text-white/80 text-lg">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Build Balanced Teams:</strong> Since both sides must meet the threshold, focus on growing both your left and right legs equally.</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Help Your Team Succeed:</strong> Support your network members so they invest more. Higher investments mean faster business volume growth.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Monitor Progress:</strong> Regularly check your career level progress in the dashboard to see how close you are to the next milestone.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Think Long-Term:</strong> Career levels reward sustained network growth. Focus on building a strong, active network rather than quick wins.</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Career Level Journey</h2>
            <p className="text-white/80 mb-6 text-lg">
              Join CNEOX and begin earning career level rewards as you build your network
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/binary-investment-system"
                className="px-8 py-3 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
              >
                Learn About Binary System
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-yellow-500/20 mt-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} CNEOX. All rights reserved.</p>
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