'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

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

      try {
        const levelsRes = await api.getAllCareerLevels();
        if (levelsRes.data) {
          setAllLevels(levelsRes.data.levels || []);
        }
      } catch {
        // Regular users may not have access to admin endpoint
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
    return <BigBullLoader text="Loading career levels…" />;
  }

  return (
    <div className={t.page}>
      <div>
        <h1 className={t.title}>Career Levels</h1>
        <p className={t.subtitle}>Track your career level progress and rewards</p>
      </div>

      {error && <div className={t.error}>{error}</div>}

      {progress && (
        <>
          <div className={t.card}>
            <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
              <span className={t.accentBar} style={t.accentBarStyle} />
              Current Level
            </h2>
            {progress.currentLevel ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold" style={{ color: t.primary }}>{progress.currentLevel.name}</h3>
                    <p className="text-sm font-semibold mt-1" style={{ color: t.muted }}>Level {progress.currentLevel.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: t.muted }}>Reward</p>
                    <p className="text-2xl font-extrabold" style={{ color: t.primary }}>
                      ${progress.currentLevel.rewardAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold" style={{ color: t.muted }}>
                    <span>
                      Progress:{' '}
                      <span style={{ color: t.ink }}>
                        ${progress.levelInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </span>
                    <span>
                      Target:{' '}
                      <span style={{ color: t.primary }}>
                        ${(progress.currentLevel.investmentThreshold * 2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-[#e8f0f3] rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${getProgressPercentage(progress.levelInvestment, progress.currentLevel.investmentThreshold * 2)}%`,
                        backgroundColor: t.gold,
                      }}
                    />
                  </div>
                  <p className="text-xs mt-2 font-semibold" style={{ color: t.muted }}>
                    {getProgressPercentage(progress.levelInvestment, progress.currentLevel.investmentThreshold * 2).toFixed(1)}% complete
                  </p>
                </div>

                {binaryTree && (
                  <div className={`${t.cardInner} mt-4 p-5`}>
                    <h3 className="text-base font-extrabold mb-4" style={{ color: t.primary }}>
                      Left & Right Business Targets (per side)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Left Business', value: binaryTree.leftBusiness },
                        { label: 'Right Business', value: binaryTree.rightBusiness },
                      ].map((side) => (
                        <div key={side.label} className={t.cardHighlight}>
                          <div className="flex justify-between text-xs mb-2 font-semibold" style={{ color: t.muted }}>
                            <span>{side.label}</span>
                            <span style={{ color: t.primary }}>
                              ${side.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $
                              {progress.currentLevel!.investmentThreshold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="w-full bg-[#e8f0f3] rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${getSideProgressPercentage(side.value, progress.currentLevel!.investmentThreshold)}%`,
                                backgroundColor: t.primary,
                              }}
                            />
                          </div>
                          <p className="mt-2 text-xs font-semibold" style={{ color: t.muted }}>
                            {getSideProgressPercentage(side.value, progress.currentLevel!.investmentThreshold).toFixed(1)}% of {side.label.toLowerCase()} target
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs font-semibold" style={{ color: t.muted }}>
                      Career level reward unlocks when{' '}
                      <span className="font-extrabold" style={{ color: t.primary }}>both</span> left and right business reach the full target amount.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg font-bold" style={{ color: t.ink }}>
                  Congratulations! You&apos;ve completed all career levels! 🎉
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Business Volume', value: progress.totalBusinessVolume },
              { label: 'Total Rewards Earned', value: progress.totalRewardsEarned },
              { label: 'Levels Completed', value: progress.completedLevels.length, isCount: true },
            ].map((stat) => (
              <div key={stat.label} className={t.card}>
                <h3 className="text-sm font-bold mb-2" style={{ color: t.muted }}>{stat.label}</h3>
                <p className="text-2xl font-extrabold" style={{ color: t.primary }}>
                  {stat.isCount
                    ? stat.value
                    : `$${Number(stat.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
              </div>
            ))}
          </div>

          {progress.completedLevels.length > 0 && (
            <div className={t.card}>
              <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
                <span className={t.accentBar} style={t.accentBarStyle} />
                Completed Levels
              </h2>
              <div className="space-y-3">
                {progress.completedLevels
                  .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .map((completed) => (
                    <div
                      key={completed.levelId}
                      className={`flex items-center justify-between p-4 rounded-xl ${t.cardHighlight}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm" style={{ backgroundColor: t.gold, color: t.ink }}>
                          ✓
                        </div>
                        <div>
                          <h3 className="font-extrabold" style={{ color: t.ink }}>{completed.levelName}</h3>
                          <p className="text-sm font-semibold" style={{ color: t.muted }}>Completed: {formatDate(completed.completedAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: t.muted }}>Reward Received</p>
                        <p className="text-lg font-extrabold" style={{ color: t.primary }}>
                          ${completed.rewardAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {allLevels.length > 0 && (
            <div className={t.card}>
              <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
                <span className={t.accentBar} style={t.accentBarStyle} />
                All Career Levels
              </h2>
              <div className="space-y-3">
                {allLevels
                  .filter((level) => level.status === 'Active')
                  .sort((a, b) => a.level - b.level)
                  .map((level) => {
                    const isCompleted = progress.completedLevels.some((cl) => cl.levelId === level.id);
                    const isCurrent = progress.currentLevel?.id === level.id;

                    return (
                      <div
                        key={level.id}
                        className={`p-4 rounded-xl border-2 ${
                          isCompleted || isCurrent
                            ? 'border-[rgba(245,207,11,0.45)] bg-[#FFF9E6]'
                            : 'border-[#d8e6ec] bg-[#F7FBFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm"
                              style={{
                                backgroundColor: isCompleted || isCurrent ? t.gold : '#e2e8ec',
                                color: t.ink,
                              }}
                            >
                              {isCompleted ? '✓' : level.level}
                            </div>
                            <div>
                              <h3 className="font-extrabold" style={{ color: t.ink }}>{level.name}</h3>
                              <p className="text-sm font-semibold" style={{ color: t.muted }}>
                                Investment Threshold:{' '}
                                <span style={{ color: t.primary }}>
                                  ${level.investmentThreshold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold" style={{ color: t.muted }}>Reward</p>
                            <p className="text-lg font-extrabold" style={{ color: t.primary }}>
                              ${level.rewardAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            {isCurrent && (
                              <p className="text-xs font-bold mt-1" style={{ color: t.primary }}>Current Level</p>
                            )}
                            {isCompleted && (
                              <p className="text-xs font-bold mt-1" style={{ color: t.primary }}>Completed</p>
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
        <div className={t.cardEmpty}>
          <p className="text-lg font-bold" style={{ color: t.ink }}>
            No career progress found. Start investing to begin your career journey!
          </p>
        </div>
      )}
    </div>
  );
}
