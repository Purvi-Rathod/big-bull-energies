'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';

interface CareerProgress {
  currentLevel: {
    id: string;
    name: string;
    level: number;
    investmentThreshold: number;
    rewardAmount: number;
  } | null;
  currentLevelName: string | null;
  levelInvestment: number;
  totalBusinessVolume: number;
  completedLevels: Array<{
    levelId: string;
    levelName: string;
    completedAt: string;
    rewardAmount: number;
  }>;
  totalRewardsEarned: number;
  lastCheckedAt: string | null;
}

interface BinaryTreeInfo {
  leftBusiness: number;
  rightBusiness: number;
}

interface CareerLevel {
  id: string;
  name: string;
  investmentThreshold: number;
  rewardAmount: number;
  level: number;
  status: 'Active' | 'InActive';
}

export default function CareerLevelsPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CareerProgress | null>(null);
  const [allLevels, setAllLevels] = useState<CareerLevel[]>([]);
  const [binaryTree, setBinaryTree] = useState<BinaryTreeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user's career progress + binary tree in parallel
      const [progressRes, binaryTreeRes] = await Promise.all([
        api.getUserCareerProgress(),
        api.getUserBinaryTree().catch(() => ({ data: null })),
      ]);

      if (progressRes.data) {
        setProgress(progressRes.data.progress);
      }

      if (binaryTreeRes.data?.binaryTree) {
        setBinaryTree({
          leftBusiness: binaryTreeRes.data.binaryTree.leftBusiness || 0,
          rightBusiness: binaryTreeRes.data.binaryTree.rightBusiness || 0,
        });
      }

      // Fetch all career levels (to show what's available)
      // Note: This is an admin-only endpoint, so it will fail for regular users
      // That's okay - we'll just show the user's progress without all levels
      try {
        const levelsRes = await api.getAllCareerLevels();
        if (levelsRes.data) {
          setAllLevels(levelsRes.data.levels || []);
        }
      } catch (err) {
        // If user doesn't have access to admin endpoint, that's okay
        // We'll just show their progress without the full list of levels
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load career progress');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, threshold: number) => {
    if (threshold === 0) return 0;
    return Math.min(100, (current / threshold) * 100);
  };

  const getSideProgressPercentage = (sideBusiness: number, perSideTarget: number) => {
    if (perSideTarget === 0) return 0;
    return Math.min(100, (sideBusiness / perSideTarget) * 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <BigBullLoader fullScreen />;
  }

  return (
    <div className="w-full min-h-screen py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FBF676]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FBF676]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-white">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Career Levels</span>
        </h1>
        <p className="mt-1 text-sm text-white/55">Track your career level progress and rewards</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-400/50 text-[#FBF676] px-4 py-3 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}

      {progress && (
        <>
          {/* Current Level Card */}
          <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-8 mb-8">
            <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#FBF676] to-[#e8e04a] rounded"></span>
              Current Level
            </h2>
            {progress.currentLevel ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-extrabold text-[#FBF676]">{progress.currentLevel.name}</h3>
                    <p className="text-sm text-white/55 font-semibold mt-1">Level {progress.currentLevel.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/55 font-semibold">Reward</p>
                    <p className="text-2xl font-extrabold text-[#FBF676]">
                      ${progress.currentLevel.rewardAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-white/75 mb-3 font-semibold">
                    <span>Progress: <span className="text-white font-bold">${progress.levelInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                    <span>Target: <span className="text-[#FBF676] font-bold">${(progress.currentLevel.investmentThreshold * 2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-4">
                    <div
                      className="bg-[#FBF676] h-4 rounded-full transition-all duration-300 shadow-lg shadow-[#FBF676]/25"
                      style={{
                        width: `${getProgressPercentage(progress.levelInvestment, progress.currentLevel.investmentThreshold * 2)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-white/55 mt-2 font-semibold">
                    {getProgressPercentage(progress.levelInvestment, progress.currentLevel.investmentThreshold * 2).toFixed(1)}% complete
                  </p>
                </div>

                {/* Left & Right Business Targets (Per Side) */}
                {binaryTree && (
                  <div className="mt-6 p-5 bg-[rgba(5,12,32,0.9)] rounded-xl border border-[#FBF676]/50">
                    <h3 className="text-base font-extrabold text-[#FBF676] mb-4">
                      Left & Right Business Targets (per side)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Side */}
                      <div className="p-5 bg-[rgba(251,246,118,0.12)] rounded-xl border border-[#FBF676]/25">
                        <div className="flex justify-between text-xs text-yellow-300 mb-2 font-semibold">
                          <span>Left Business</span>
                          <span className="text-[#FBF676]">
                            $
                            {binaryTree.leftBusiness.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            / $
                            {progress.currentLevel.investmentThreshold.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="w-full bg-[rgba(5,12,32,0.9)] rounded-full h-3">
                          <div
                            className="bg-[#FBF676] h-3 rounded-full transition-all duration-300 shadow-lg shadow-[#FBF676]/25"
                            style={{
                              width: `${getSideProgressPercentage(
                                binaryTree.leftBusiness,
                                progress.currentLevel.investmentThreshold
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="mt-2 text-xs text-[#FBF676] font-semibold">
                          {getSideProgressPercentage(
                            binaryTree.leftBusiness,
                            progress.currentLevel.investmentThreshold
                          ).toFixed(1)}
                          % of left-side target achieved
                        </p>
                      </div>

                      {/* Right Side */}
                      <div className="p-5 bg-[rgba(251,246,118,0.12)] rounded-xl border border-[#FBF676]/25">
                        <div className="flex justify-between text-xs text-yellow-300 mb-2 font-semibold">
                          <span>Right Business</span>
                          <span className="text-[#FBF676]">
                            $
                            {binaryTree.rightBusiness.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            / $
                            {progress.currentLevel.investmentThreshold.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="w-full bg-[rgba(5,12,32,0.9)] rounded-full h-3">
                          <div
                            className="bg-[#FBF676] h-3 rounded-full transition-all duration-300 shadow-lg shadow-[#FBF676]/25"
                            style={{
                              width: `${getSideProgressPercentage(
                                binaryTree.rightBusiness,
                                progress.currentLevel.investmentThreshold
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="mt-2 text-xs text-[#FBF676] font-semibold">
                          {getSideProgressPercentage(
                            binaryTree.rightBusiness,
                            progress.currentLevel.investmentThreshold
                          ).toFixed(1)}
                          % of right-side target achieved
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-[#FBF676] font-semibold">
                      Career level reward unlocks when{' '}
                      <span className="font-extrabold text-[#FBF676]">both</span> left and right business reach the
                      full target amount.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/75 text-lg font-bold">Congratulations! You've completed all career levels! 🎉</p>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-6 hover:border-[#FBF676]/60 hover:shadow-[#FBF676]/20 transition-all duration-300">
              <h3 className="text-sm font-bold text-[#FBF676] mb-3">Total Business Volume</h3>
              <p className="text-3xl font-extrabold text-[#FBF676]">
                ${progress.totalBusinessVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="group rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-6 hover:border-[#FBF676]/60 hover:shadow-[#FBF676]/20 transition-all duration-300">
              <h3 className="text-sm font-bold text-[#FBF676] mb-3">Total Rewards Earned</h3>
              <p className="text-3xl font-extrabold text-[#FBF676]">
                ${progress.totalRewardsEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="group rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-6 hover:border-[#FBF676]/60 hover:shadow-[#FBF676]/20 transition-all duration-300">
              <h3 className="text-sm font-bold text-[#FBF676] mb-3">Levels Completed</h3>
              <p className="text-3xl font-extrabold text-[#FBF676]">
                {progress.completedLevels.length}
              </p>
            </div>
          </div>

          {/* Completed Levels */}
          {progress.completedLevels.length > 0 && (
            <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-8 mb-8">
              <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#FBF676] to-[#e8e04a] rounded"></span>
                Completed Levels
              </h2>
              <div className="space-y-4">
                {progress.completedLevels
                  .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .map((completed, index) => (
                    <div
                      key={completed.levelId}
                      className="flex items-center justify-between p-5 bg-[rgba(251,246,118,0.12)] border-2 border-[#FBF676]/35 rounded-xl hover:border-[#FBF676]/60 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#FBF676]/25">
                            ✓
                          </div>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-lg">{completed.levelName}</h3>
                          <p className="text-sm text-white/55 font-semibold">Completed: {formatDate(completed.completedAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/55 font-semibold">Reward Received</p>
                        <p className="text-xl font-extrabold text-[#FBF676]">
                          ${completed.rewardAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* All Available Levels */}
          {allLevels.length > 0 && (
            <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-8">
              <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#FBF676] to-[#e8e04a] rounded"></span>
                All Career Levels
              </h2>
              <div className="space-y-4">
                {allLevels
                  .filter((level) => level.status === 'Active')
                  .sort((a, b) => a.level - b.level)
                  .map((level) => {
                    const isCompleted = progress.completedLevels.some(
                      (cl) => cl.levelId === level.id
                    );
                    const isCurrent = progress.currentLevel?.id === level.id;

                    return (
                      <div
                        key={level.id}
                        className={`p-5 border-2 rounded-xl transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-r from-yellow-500/30 via-yellow-600/20 to-yellow-500/30 border-[#FBF676]/60'
                            : isCurrent
                            ? 'bg-[rgba(251,246,118,0.12)] border-[#FBF676]/50'
                            : 'bg-gray-800/80 border-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-white shadow-lg ${
                                isCompleted
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-[#FBF676]/25'
                                  : isCurrent
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-[#FBF676]/25'
                                  : 'bg-gray-700'
                              }`}
                            >
                              {isCompleted ? '✓' : level.level}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-white text-lg">{level.name}</h3>
                              <p className="text-sm text-white/55 font-semibold">
                                Investment Threshold: <span className="text-[#FBF676]">${level.investmentThreshold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/55 font-semibold">Reward</p>
                            <p className="text-xl font-extrabold text-[#FBF676]">
                              ${level.rewardAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-[#FBF676] mt-1 font-bold">Current Level</p>
                            )}
                            {isCompleted && (
                              <p className="text-xs text-[#FBF676] mt-1 font-bold">Completed</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {!progress && !loading && (
        <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-12 text-center">
          <p className="text-white/75 text-lg font-bold">No career progress found. Start investing to begin your career journey!</p>
        </div>
      )}
          </div>
        </div>
  );
}

