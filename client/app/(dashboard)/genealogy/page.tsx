'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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
          className="flex flex-col items-center justify-center w-[4.5rem] md:w-28 h-[4.5rem] md:h-24 rounded-xl border border-dashed border-[#FBF676]/25 bg-[rgba(8,16,40,0.45)] backdrop-blur-sm"
        >
          <div className="text-[#FBF676]/50 text-[9px] md:text-[10px] font-medium tracking-wide">Empty</div>
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
          className={`w-[5.25rem] md:w-32 p-2 md:p-2.5 rounded-xl border cursor-pointer transition-all duration-300 backdrop-blur-md ${
            isRoot
              ? 'bg-[rgba(251,246,118,0.18)] border-[#FBF676]/60 shadow-[0_0_24px_rgba(251,246,118,0.25)]'
              : 'bg-[rgba(8,16,40,0.7)] border-[#FBF676]/25 hover:border-[#FBF676]/55 hover:shadow-[0_0_16px_rgba(251,246,118,0.15)]'
          }`}
          onClick={() => !isRoot && handleNodeClick(node.userId)}
        >
          <div className="text-center">
            <div className="font-bold text-[10px] md:text-xs mb-0.5 truncate w-full text-[#FBF676]">
              {node.name || 'Unknown'}
            </div>
            <div className="text-[8px] md:text-[10px] mb-1.5 font-mono text-white/55 truncate">
              {node.userId}
            </div>
            <div
              className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full inline-block mb-1.5 font-semibold capitalize border ${
                isActive
                  ? 'bg-[rgba(251,246,118,0.2)] text-[#FBF676] border-[#FBF676]/40'
                  : 'bg-white/10 text-white/60 border-white/15'
              }`}
            >
              {node.status}
            </div>
            <div className="flex gap-1 mt-1">
              <div className="flex-1 text-center p-1 rounded-lg bg-[rgba(0,212,232,0.12)] border border-[rgba(0,212,232,0.25)]">
                <div className="text-[8px] font-semibold text-[#00D4E8]">L</div>
                <div className="text-[9px] md:text-[10px] font-bold text-white">
                  {node.leftDownlines || 0}
                </div>
              </div>
              <div className="flex-1 text-center p-1 rounded-lg bg-[rgba(251,246,118,0.12)] border border-[#FBF676]/25">
                <div className="text-[8px] font-semibold text-[#FBF676]">R</div>
                <div className="text-[9px] md:text-[10px] font-bold text-white">
                  {node.rightDownlines || 0}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBusinessNode(node);
                setShowBusinessModal(true);
              }}
              className="mt-1.5 w-full py-1 px-1 rounded-lg text-[9px] md:text-[10px] font-bold transition-all duration-200 bg-[#FBF676] text-[#0C1A6B] hover:bg-[#e8e04a] hover:scale-[1.02]"
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
    <div className="w-full h-full px-2 sm:px-0">
      {/* Header Section */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
          My Genealogy
        </h1>
        <p className="mt-1 md:mt-2 text-xs md:text-sm text-yellow-400">Explore your binary referral tree and downlines</p>
      </div>

      {/* Navigation Controls */}
      {treeData && (
        <div
          className="rounded-xl shadow-lg border p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center backdrop-blur-md"
          style={{ background: 'rgba(8, 16, 40, 0.55)', borderColor: 'rgba(251,246,118,0.22)' }}
        >
          <button
            onClick={handleReset}
            disabled={!originalRootUserId || treeData.rootUserId === originalRootUserId}
            className="px-3 md:px-4 py-2 bg-[#FBF676] text-[#0C1A6B] rounded-lg hover:bg-[#e8e04a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-xs md:text-sm font-bold"
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
              className="flex-1 px-4 py-2 border border-[#FBF676]/30 rounded-lg text-sm bg-[rgba(8,16,40,0.85)] text-white placeholder-white/40 focus:ring-2 focus:ring-[#FBF676]/35 outline-none"
              style={{ colorScheme: 'dark' }}
            />

            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-4 py-2 bg-[#FBF676] text-[#0C1A6B] rounded-lg hover:bg-[#e8e04a] text-sm font-bold disabled:opacity-50"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>

            {/* Result Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 z-50 bg-[#08152F]/80 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto border border-yellow-400/30">
                {searchResults.map((node) => (
                  <div
                    key={node.userId}
                    onClick={() => {
                      handleNodeClick(node.userId);
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className="px-4 py-2 hover:bg-[#08152F]/70 text-yellow-400 cursor-pointer"
                  >
                    <p className="text-sm font-medium">{node.name}</p>
                    <p className="text-xs text-yellow-400">{node.userId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:block flex-1"></div>
          <div className="text-xs md:text-sm text-yellow-400 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 bg-[#08152F]/80 px-3 md:px-4 py-2 rounded-lg border border-yellow-400/30">
            <span className="font-medium text-yellow-400">Current Root:</span>
            <span className="font-bold text-yellow-400 truncate">{treeData.rootName}</span>
            <span className="text-yellow-400 font-mono text-[10px] md:text-xs truncate">({treeData.rootUserId})</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 rounded-xl p-4 mb-6 shadow-lg border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-yellow-400 font-medium">{error}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-yellow-400 font-medium">Loading your genealogy tree...</p>
        </div>
      )}

      {/* Tree Visualization */}
      {treeStructure && !loading && (
        <div
          className="rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8 overflow-x-auto transition-all duration-300 border backdrop-blur-md"
          style={{
            background: 'rgba(8, 16, 40, 0.45)',
            borderColor: 'rgba(251,246,118,0.22)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          }}
        >
          <div className="tree-container mx-auto" style={{ maxWidth: '1000px', position: 'relative', minHeight: '400px' }}>
            {/* Level 0: Root */}
            <div className="flex justify-center mb-6 md:mb-12 relative">
              <div className="relative z-20">
                {renderNode(treeStructure.root, 0, 'root')}
              </div>
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 md:w-1 h-4 md:h-6 rounded-full"
                style={{ zIndex: 1, background: 'linear-gradient(180deg, #FBF676, rgba(5,98,124,0.6))' }}
              />
            </div>

            {/* Level 1: Direct Children */}
            <div className="flex justify-center gap-8 md:gap-24 mb-6 md:mb-10 relative">
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 md:h-[2px] rounded-full hidden sm:block"
                style={{
                  width: 'clamp(200px, 320px, 100%)',
                  background: 'linear-gradient(90deg, transparent, rgba(251,246,118,0.55), transparent)',
                }}
              />
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 md:w-1 h-4 md:h-6 rounded-full hidden sm:block"
                style={{ marginLeft: 'clamp(-100px, -160px, -80px)', background: 'linear-gradient(180deg, rgba(251,246,118,0.55), rgba(0,212,232,0.4))' }}
              />
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 md:w-1 h-4 md:h-6 rounded-full hidden sm:block"
                style={{ marginLeft: 'clamp(100px, 160px, 80px)', background: 'linear-gradient(180deg, rgba(251,246,118,0.55), rgba(0,212,232,0.4))' }}
              />

              <div className="relative z-20">
                {renderNode(treeStructure.level1.left, 1, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level1.right, 1, 'right')}
              </div>
            </div>

            {/* Level 2: Grandchildren */}
            <div className="flex justify-center gap-4 md:gap-12 relative flex-wrap sm:flex-nowrap">
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 rounded-full hidden md:block"
                style={{
                  width: 'clamp(300px, 600px, 100%)',
                  background: 'linear-gradient(90deg, transparent, rgba(0,212,232,0.4), transparent)',
                }}
              />
              {[-225, -75, 75, 225].map((offset) => (
                <div
                  key={offset}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 md:h-5 rounded-full hidden md:block"
                  style={{
                    marginLeft: `${offset}px`,
                    background: 'linear-gradient(180deg, rgba(0,212,232,0.45), rgba(251,246,118,0.25))',
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
        <div className="bg-[#08152F]/80 rounded-lg shadow p-12 text-center border border-yellow-400/30">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-yellow-400">No Tree Loaded</h3>
          <p className="mt-2 text-sm text-yellow-400">Loading your genealogy tree...</p>
        </div>
      )}

      {/* View Business Modal */}
      {showBusinessModal && selectedBusinessNode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div
            className="rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border backdrop-blur-md"
            style={{ background: 'rgba(8, 16, 40, 0.92)', borderColor: 'rgba(251,246,118,0.25)' }}
          >
            <div
              className="sticky top-0 border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
              style={{ background: 'rgba(8, 16, 40, 0.95)', borderColor: 'rgba(251,246,118,0.2)' }}
            >
              <h2 className="text-lg md:text-2xl font-bold text-[#FBF676]">User Business Details</h2>
              <button
                onClick={() => {
                  setShowBusinessModal(false);
                  setSelectedBusinessNode(null);
                }}
                className="text-[#FBF676]/70 hover:text-[#FBF676] transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-[#FBF676] mb-3 md:mb-4">User Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-sm font-medium text-white/50">User ID</label>
                    <p className="mt-1 text-sm text-white font-mono">{selectedBusinessNode.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/50">Name</label>
                    <p className="mt-1 text-sm text-white">{selectedBusinessNode.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/50">Status</label>
                    <span
                      className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium border capitalize ${
                        selectedBusinessNode.status === 'active'
                          ? 'bg-[rgba(251,246,118,0.15)] text-[#FBF676] border-[#FBF676]/40'
                          : 'bg-white/10 text-white/60 border-white/20'
                      }`}
                    >
                      {selectedBusinessNode.status}
                    </span>
                  </div>
                  {selectedBusinessNode.totalInvestment && (
                    <div>
                      <label className="text-sm font-medium text-white/50">Total Investment</label>
                      <p className="mt-1 text-sm text-[#FBF676] font-bold">
                        ${parseFloat(selectedBusinessNode.totalInvestment).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#FBF676] mb-4">Parent Information</h3>
                {selectedBusinessNode.parent || selectedBusinessNode.parentUserId ? (
                  <div className="rounded-lg p-4 border border-[#FBF676]/20 bg-[rgba(5,12,32,0.7)]">
                    <p className="text-sm text-white">
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
                  <p className="text-sm text-white/50">No parent (Root user)</p>
                )}
              </div>

              <div>
                <h3 className="text-base md:text-lg font-semibold text-[#FBF676] mb-3 md:mb-4">Binary Business</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="rounded-lg p-4 border border-[rgba(0,212,232,0.3)] bg-[rgba(0,212,232,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#00D4E8]">Left Business</span>
                      <span className="text-lg font-bold text-white">
                        ${parseFloat(selectedBusinessNode.leftBusiness || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">
                      Left Downlines: <span className="font-semibold text-white">{selectedBusinessNode.leftDownlines || 0}</span>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-[#FBF676]/30 bg-[rgba(251,246,118,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#FBF676]">Right Business</span>
                      <span className="text-lg font-bold text-white">
                        ${parseFloat(selectedBusinessNode.rightBusiness || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">
                      Right Downlines: <span className="font-semibold text-white">{selectedBusinessNode.rightDownlines || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base md:text-lg font-semibold text-[#FBF676] mb-3 md:mb-4">Carry Forward</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="rounded-lg p-4 border border-white/10 bg-[rgba(5,12,32,0.7)]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">Left Carry</span>
                      <span className="text-lg font-bold text-[#00D4E8]">
                        ${parseFloat(selectedBusinessNode.leftCarry || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-white/10 bg-[rgba(5,12,32,0.7)]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">Right Carry</span>
                      <span className="text-lg font-bold text-[#FBF676]">
                        ${parseFloat(selectedBusinessNode.rightCarry || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base md:text-lg font-semibold text-[#FBF676] mb-3 md:mb-4">Downline Summary</h3>
                <div className="rounded-lg p-3 md:p-4 border border-[#FBF676]/20 bg-[rgba(5,12,32,0.7)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <span className="text-sm text-white/60">Total Left Downlines:</span>
                      <span className="ml-2 text-lg font-bold text-[#00D4E8]">{selectedBusinessNode.leftDownlines || 0}</span>
                    </div>
                    <div>
                      <span className="text-sm text-white/60">Total Right Downlines:</span>
                      <span className="ml-2 text-lg font-bold text-[#FBF676]">{selectedBusinessNode.rightDownlines || 0}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-[#FBF676]/15">
                      <span className="text-sm text-white/60">Total Downlines:</span>
                      <span className="ml-2 text-xl font-bold text-white">
                        {(selectedBusinessNode.leftDownlines || 0) + (selectedBusinessNode.rightDownlines || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="sticky bottom-0 border-t px-4 md:px-6 py-3 md:py-4 flex justify-end"
              style={{ background: 'rgba(8, 16, 40, 0.95)', borderColor: 'rgba(251,246,118,0.2)' }}
            >
              <button
                onClick={() => {
                  setShowBusinessModal(false);
                  setSelectedBusinessNode(null);
                }}
                className="px-4 md:px-6 py-2 bg-[#FBF676] text-[#0C1A6B] font-bold rounded-lg hover:bg-[#e8e04a] transition-colors text-sm md:text-base w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
