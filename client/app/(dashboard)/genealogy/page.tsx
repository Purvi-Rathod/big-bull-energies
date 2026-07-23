'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

interface TreeNode {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  leftChild: string | null;
  rightChild: string | null;
  leftBusiness: string;
  rightBusiness: string;
  leftCarry?: string;
  rightCarry?: string;
  leftDownlines: number;
  rightDownlines: number;
  level: number;
  parent?: string | null;
  parentUserId?: string | null;
  parentName?: string | null;
  totalInvestment?: string;
}

interface TreeData {
  tree: TreeNode[];
  rootUserId: string;
  rootName: string;
}

export default function UserGenealogyPage() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation history for reset functionality (only downlines, no upline)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [originalRootUserId, setOriginalRootUserId] = useState<string | null>(null);

  // View Business Modal state
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedBusinessNode, setSelectedBusinessNode] = useState<TreeNode | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TreeNode[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch tree data for a specific user with depth=2 (only downlines)
  const fetchTreeData = useCallback(async (userId: string, isInitialLoad = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Use getNodeDownlines API with depth=2 (only 3 levels below root)
      const response = await api.getNodeDownlines(userId, 3);

      if (response.data?.tree) {
        const rootUser = response.data.tree.find((u: TreeNode) => u.userId === userId);

        if (!rootUser) {
          throw new Error('User not found in tree data');
        }

        setTreeData({
          tree: response.data.tree,
          rootUserId: userId,
          rootName: rootUser?.name || userId,
        });

        // Track navigation history
        if (isInitialLoad) {
          setOriginalRootUserId(userId);
          setNavigationHistory([userId]);
        } else {
          setNavigationHistory(prev => [...prev, userId]);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tree data');
      toast.error(err.message || 'Failed to load genealogy tree');
    } finally {
      setLoading(false);
    }
  }, []);


  // Load user's own tree by default on mount
  useEffect(() => {
    if (user?.userId) {
      fetchTreeData(user.userId, true);
    }
  }, [user?.userId, fetchTreeData]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Enter something to search');
      return;
    }

    try {
      setSearchLoading(true);


      await fetchTreeData(searchTerm, false);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };


  // Handle clicking on a node to make it the new root (only if it's a downline)
  const handleNodeClick = (userId: string) => {
    if (userId === treeData?.rootUserId) return; // Already root

    // Verify this is a downline (exists in current tree data)
    const nodeExists = treeData?.tree.some(n => n.userId === userId);
    if (!nodeExists) {
      toast.error('You can only view your downlines');
      return;
    }

    fetchTreeData(userId, false);
  };

  // Handle reset to original root (user's own tree)
  const handleReset = () => {
    if (!originalRootUserId) {
      toast('Already at your root tree', { icon: 'ℹ️' });
      return;
    }
    setNavigationHistory([originalRootUserId]);
    fetchTreeData(originalRootUserId, false);
  };

  // Build tree map for quick lookups (by userId and by id)
  const treeMap = useMemo(() => {
    if (!treeData?.tree) return new Map<string, TreeNode>();
    const map = new Map<string, TreeNode>();
    treeData.tree.forEach((node) => {
      // Index by userId (primary lookup)
      map.set(node.userId, node);
      // Index by MongoDB _id for child lookups
      if (node.id) {
        const idStr = String(node.id);
        map.set(idStr, node);
      }
    });
    return map;
  }, [treeData]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();

    const results = treeData?.tree.filter((node) =>
      node.name?.toLowerCase().includes(term) ||
      node.userId?.toLowerCase().includes(term) ||
      node.email?.toLowerCase().includes(term) ||
      node.phone?.toLowerCase().includes(term)
    );

    setSearchResults(results || []);
  }, [searchTerm, treeData]);


  // Get root node
  const rootNode = useMemo(() => {
    if (!treeData) return null;
    return treeData.tree.find((n) => n.userId === treeData.rootUserId);
  }, [treeData]);

  // Render a tree node
  const renderNode = (node: TreeNode | null, level: number, position: 'left' | 'right' | 'root') => {
    if (!node) {
      return (
        <div
          key={`empty-${level}-${position}`}
          className="flex flex-col items-center justify-center w-[4.5rem] md:w-28 h-[4.5rem] md:h-24 rounded-xl border border-dashed border-[#d8e6ec] bg-[#F7FBFC]"
        >
          <div className="text-[9px] md:text-[10px] font-medium tracking-wide" style={{ color: t.muted }}>Empty</div>
        </div>
      );
    }

    const isRoot = position === 'root';
    const isActive = node.status === 'active';

    return (
      <div
        key={node.userId}
        className={`flex flex-col items-center transition-all duration-300 ${
          isRoot ? 'scale-105 md:scale-110' : 'hover:scale-105'
        }`}
      >
        <div
          className={`w-[5.25rem] md:w-32 p-2 md:p-2.5 rounded-xl border cursor-pointer transition-all duration-300 ${
            isRoot
              ? 'bg-[#FFF9E6] border-[rgba(245,207,11,0.55)] shadow-sm'
              : 'bg-white border-[#d8e6ec] hover:border-[#05627C]/40 hover:shadow-sm'
          }`}
          onClick={() => !isRoot && handleNodeClick(node.userId)}
        >
          <div className="text-center">
            <div className="font-bold text-[10px] md:text-xs mb-0.5 truncate w-full" style={{ color: t.primary }}>
              {node.name || 'Unknown'}
            </div>
            <div className="text-[8px] md:text-[10px] mb-1.5 font-mono truncate" style={{ color: t.muted }}>
              {node.userId}
            </div>
            <div
              className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full inline-block mb-1.5 font-semibold capitalize border ${
                isActive ? t.badgeActive : t.badgeNeutral
              }`}
            >
              {node.status}
            </div>
            <div className="flex gap-1 mt-1">
              <div className="flex-1 text-center p-1 rounded-lg bg-[#E6F7FB] border border-[#d8e6ec]">
                <div className="text-[8px] font-semibold" style={{ color: t.accent }}>L</div>
                <div className="text-[9px] md:text-[10px] font-bold" style={{ color: t.ink }}>
                  {node.leftDownlines || 0}
                </div>
              </div>
              <div className="flex-1 text-center p-1 rounded-lg bg-[#FFF9E6] border border-[#d8e6ec]">
                <div className="text-[8px] font-semibold" style={{ color: t.primary }}>R</div>
                <div className="text-[9px] md:text-[10px] font-bold" style={{ color: t.ink }}>
                  {node.rightDownlines || 0}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBusinessNode(node);
                setShowBusinessModal(true);
              }}
              className={`${t.btnPrimary} mt-1.5 w-full py-1 px-1 text-[9px] md:text-[10px]`}
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Build tree structure (max 2 levels from root)
  const buildTreeStructure = () => {
    if (!rootNode || !treeMap) return null;

    const structure: {
      root: TreeNode;
      level1: { left: TreeNode | null; right: TreeNode | null };
      level2: {
        leftLeft: TreeNode | null;
        leftRight: TreeNode | null;
        rightLeft: TreeNode | null;
        rightRight: TreeNode | null;
      };
    } = {
      root: rootNode,
      level1: { left: null, right: null },
      level2: {
        leftLeft: null,
        leftRight: null,
        rightLeft: null,
        rightRight: null,
      },
    };

    // Level 1: Direct children
    // leftChild and rightChild are MongoDB ObjectIds (as strings)
    if (rootNode.leftChild) {
      structure.level1.left = treeMap.get(rootNode.leftChild) || null;
    }

    if (rootNode.rightChild) {
      structure.level1.right = treeMap.get(rootNode.rightChild) || null;
    }

    // Level 2: Grandchildren
    if (structure.level1.left) {
      const leftNode = structure.level1.left;
      if (leftNode.leftChild) {
        const leftChildId = String(leftNode.leftChild);
        structure.level2.leftLeft = treeMap.get(leftChildId) || null;
      }
      if (leftNode.rightChild) {
        const rightChildId = String(leftNode.rightChild);
        structure.level2.leftRight = treeMap.get(rightChildId) || null;
      }
    }
    if (structure.level1.right) {
      const rightNode = structure.level1.right;
      if (rightNode.leftChild) {
        const leftChildId = String(rightNode.leftChild);
        structure.level2.rightLeft = treeMap.get(leftChildId) || null;
      }
      if (rightNode.rightChild) {
        const rightChildId = String(rightNode.rightChild);
        structure.level2.rightRight = treeMap.get(rightChildId) || null;
      }
    }

    // Debug: Log tree structure to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Tree Structure:', {
        root: structure.root.userId,
        level1: {
          left: structure.level1.left?.userId || null,
          right: structure.level1.right?.userId || null,
        },
        level2: {
          leftLeft: structure.level2.leftLeft?.userId || null,
          leftRight: structure.level2.leftRight?.userId || null,
          rightLeft: structure.level2.rightLeft?.userId || null,
          rightRight: structure.level2.rightRight?.userId || null,
        },
        treeMapSize: treeMap.size,
        allUserIds: Array.from(treeMap.keys()).slice(0, 10),
      });
    }

    return structure;
  };

  const treeStructure = buildTreeStructure();

  return (
    <div className={t.page}>
      <div>
        <h1 className={t.title}>My Genealogy</h1>
        <p className={t.subtitle}>Explore your binary referral tree and downlines</p>
      </div>

      {treeData && (
        <div className={`${t.card} flex flex-col sm:flex-row gap-3 items-stretch sm:items-center`}>
          <button
            type="button"
            onClick={handleReset}
            disabled={!originalRootUserId || treeData.rootUserId === originalRootUserId}
            className={t.btnPrimary}
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to My Tree
          </button>

          <div className="relative w-full sm:w-96 flex gap-2">

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search downline (Name / ID / Email)"
              className={`${t.input} flex-1 text-sm`}
            />

            <button type="button" onClick={handleSearch} disabled={searchLoading} className={t.btnPrimary}>
              {searchLoading ? 'Searching…' : 'Search'}
            </button>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-xl shadow-lg max-h-60 overflow-y-auto border border-[#d8e6ec] bg-white">
                {searchResults.map((node) => (
                  <div
                    key={node.userId}
                    onClick={() => {
                      handleNodeClick(node.userId);
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className="px-4 py-2 hover:bg-[#F7FBFC] cursor-pointer border-b border-[#eef4f7] last:border-0"
                  >
                    <p className="text-sm font-medium" style={{ color: t.ink }}>{node.name}</p>
                    <p className="text-xs font-mono" style={{ color: t.primary }}>{node.userId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:block flex-1" />
          <div className={`text-xs md:text-sm flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 px-3 md:px-4 py-2 rounded-xl ${t.cardInner}`}>
            <span className="font-medium" style={{ color: t.muted }}>Current Root:</span>
            <span className="font-bold truncate" style={{ color: t.ink }}>{treeData.rootName}</span>
            <span className="font-mono text-[10px] md:text-xs truncate" style={{ color: t.primary }}>({treeData.rootUserId})</span>
          </div>
        </div>
      )}

      {error && <div className={t.error}>{error}</div>}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <BigBullLoader text="Loading your genealogy tree…" />
        </div>
      )}

      {treeStructure && !loading && (
        <div className={`${t.card} overflow-x-auto`}>
          <div className="tree-container mx-auto" style={{ maxWidth: '1000px', position: 'relative', minHeight: '400px' }}>
            {/* Level 0: Root */}
            <div className="flex justify-center mb-6 md:mb-12 relative">
              <div className="relative z-20">
                {renderNode(treeStructure.root, 0, 'root')}
              </div>
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 md:w-1 h-4 md:h-6 rounded-full"
                style={{ zIndex: 1, background: 'linear-gradient(180deg, #F5CF0B, rgba(5,98,124,0.6))' }}
              />
            </div>

            {/* Level 1: Direct Children */}
            <div className="relative mb-6 flex justify-center gap-4 sm:gap-8 md:mb-10 md:gap-24">
              <div
                className="absolute top-0 left-1/2 hidden h-0.5 w-full -translate-x-1/2 transform rounded-full sm:block md:h-[2px]"
                style={{
                  width: 'clamp(160px, 320px, 100%)',
                  background: 'linear-gradient(90deg, transparent, rgba(245,207,11,0.55), transparent)',
                }}
              />
              <div
                className="absolute top-0 left-1/2 hidden h-4 w-0.5 -translate-x-1/2 transform rounded-full sm:block md:h-6 md:w-1"
                style={{ marginLeft: 'clamp(-80px, -160px, -80px)', background: 'linear-gradient(180deg, rgba(245,207,11,0.55), rgba(63,169,200,0.4))' }}
              />
              <div
                className="absolute top-0 left-1/2 hidden h-4 w-0.5 -translate-x-1/2 transform rounded-full sm:block md:h-6 md:w-1"
                style={{ marginLeft: 'clamp(80px, 160px, 80px)', background: 'linear-gradient(180deg, rgba(245,207,11,0.55), rgba(63,169,200,0.4))' }}
              />

              <div className="relative z-20">
                {renderNode(treeStructure.level1.left, 1, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level1.right, 1, 'right')}
              </div>
            </div>

            {/* Level 2: Grandchildren */}
            <div className="relative mb-6 flex min-w-[20rem] justify-center gap-4 sm:min-w-0 sm:flex-nowrap sm:gap-4 md:gap-12 flex-wrap">
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 rounded-full hidden md:block"
                style={{
                  width: 'clamp(300px, 600px, 100%)',
                  background: 'linear-gradient(90deg, transparent, rgba(63,169,200,0.45), transparent)',
                }}
              />
              {[-225, -75, 75, 225].map((offset) => (
                <div
                  key={offset}
                  className="absolute top-0 left-1/2 hidden h-4 w-0.5 -translate-x-1/2 transform rounded-full md:block md:h-5"
                  style={{
                    marginLeft: `${offset}px`,
                    background: 'linear-gradient(180deg, rgba(63,169,200,0.45), rgba(245,207,11,0.3))',
                  }}
                />
              ))}

              <div className="relative z-20">
                {renderNode(treeStructure.level2.leftLeft, 2, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level2.leftRight, 2, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level2.rightLeft, 2, 'right')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level2.rightRight, 2, 'right')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!treeData && !loading && (
        <div className={t.cardEmpty}>
          <h3 className="text-lg font-medium" style={{ color: t.ink }}>No Tree Loaded</h3>
          <p className="mt-2 text-sm" style={{ color: t.muted }}>Loading your genealogy tree...</p>
        </div>
      )}

      {showBusinessModal && selectedBusinessNode && (
        <div className={t.modalOverlay}>
          <div className={`${t.modalPanel} max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="sticky top-0 border-b border-[#d8e6ec] pb-4 mb-4 flex items-center justify-between bg-white">
                <h2 className="text-lg md:text-xl font-extrabold" style={{ color: t.ink }}>User Business Details</h2>
                <button type="button" onClick={() => { setShowBusinessModal(false); setSelectedBusinessNode(null); }} className="text-[#5A6F78] hover:text-[#05627C]">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 p-1 sm:space-y-6 sm:p-2">
              <div>
                <h3 className="mb-3 text-base font-semibold md:mb-4 md:text-lg" style={{ color: t.primary }}>User Profile</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                  <div className="min-w-0">
                    <label className="text-sm font-medium" style={{ color: t.muted }}>User ID</label>
                    <p className="mt-1 break-all font-mono text-sm" style={{ color: t.ink }}>{selectedBusinessNode.userId}</p>
                  </div>
                  <div className="min-w-0">
                    <label className="text-sm font-medium" style={{ color: t.muted }}>Name</label>
                    <p className="mt-1 truncate text-sm" style={{ color: t.ink }}>{selectedBusinessNode.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: t.muted }}>Status</label>
                    <span
                      className={`mt-1 inline-block rounded-full border px-2 py-1 text-xs font-medium capitalize ${
                        selectedBusinessNode.status === 'active'
                          ? t.badgeActive
                          : t.badgeNeutral
                      }`}
                    >
                      {selectedBusinessNode.status}
                    </span>
                  </div>
                  {selectedBusinessNode.totalInvestment && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: t.muted }}>Total Investment</label>
                      <p className="mt-1 text-sm font-bold" style={{ color: t.primary }}>
                        ${parseFloat(selectedBusinessNode.totalInvestment).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold" style={{ color: t.primary }}>Parent Information</h3>
                {selectedBusinessNode.parent || selectedBusinessNode.parentUserId ? (
                  <div className="rounded-lg border border-[#d8e6ec] bg-[#F7FBFC] p-4">
                    <p className="break-words text-sm" style={{ color: t.ink }}>
                      {selectedBusinessNode.parentName && selectedBusinessNode.parentUserId
                        ? `${selectedBusinessNode.parentName} (${selectedBusinessNode.parentUserId})`
                        : (() => {
                            const parentNode = treeData?.tree.find((n) => n.id === selectedBusinessNode.parent);
                            return parentNode
                              ? `${parentNode.name} (${parentNode.userId})`
                              : selectedBusinessNode.parentUserId || 'Parent ID: ' + selectedBusinessNode.parent;
                          })()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: t.muted }}>No parent (Root user)</p>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold md:mb-4 md:text-lg" style={{ color: t.primary }}>Binary Business</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                  <div className="rounded-lg border border-[#d8e6ec] bg-[#E6F7FB] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: t.accent }}>Left Business</span>
                      <span className="text-lg font-bold" style={{ color: t.ink }}>
                        ${parseFloat(selectedBusinessNode.leftBusiness || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: t.muted }}>
                      Left Downlines: <span className="font-semibold" style={{ color: t.ink }}>{selectedBusinessNode.leftDownlines || 0}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#d8e6ec] bg-[#FFF9E6] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: t.primary }}>Right Business</span>
                      <span className="text-lg font-bold" style={{ color: t.ink }}>
                        ${parseFloat(selectedBusinessNode.rightBusiness || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: t.muted }}>
                      Right Downlines: <span className="font-semibold" style={{ color: t.ink }}>{selectedBusinessNode.rightDownlines || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold md:mb-4 md:text-lg" style={{ color: t.primary }}>Carry Forward</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                  <div className="rounded-lg border border-[#d8e6ec] bg-[#F7FBFC] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: t.muted }}>Left Carry</span>
                      <span className="text-lg font-bold" style={{ color: t.accent }}>
                        ${parseFloat(selectedBusinessNode.leftCarry || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#d8e6ec] bg-[#F7FBFC] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: t.muted }}>Right Carry</span>
                      <span className="text-lg font-bold" style={{ color: t.primary }}>
                        ${parseFloat(selectedBusinessNode.rightCarry || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold md:mb-4 md:text-lg" style={{ color: t.primary }}>Downline Summary</h3>
                <div className="rounded-lg border border-[#d8e6ec] bg-[#F7FBFC] p-3 md:p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                    <div>
                      <span className="text-sm" style={{ color: t.muted }}>Total Left Downlines:</span>
                      <span className="ml-2 text-lg font-bold" style={{ color: t.accent }}>{selectedBusinessNode.leftDownlines || 0}</span>
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: t.muted }}>Total Right Downlines:</span>
                      <span className="ml-2 text-lg font-bold" style={{ color: t.primary }}>{selectedBusinessNode.rightDownlines || 0}</span>
                    </div>
                    <div className="col-span-1 border-t border-[#d8e6ec] pt-2 sm:col-span-2">
                      <span className="text-sm" style={{ color: t.muted }}>Total Downlines:</span>
                      <span className="ml-2 text-xl font-bold" style={{ color: t.ink }}>
                        {(selectedBusinessNode.leftDownlines || 0) + (selectedBusinessNode.rightDownlines || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-[#d8e6ec] pt-4 mt-4 flex justify-end bg-white">
              <button type="button" onClick={() => { setShowBusinessModal(false); setSelectedBusinessNode(null); }} className={t.btnPrimary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
