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

export default function GenealogyPage() {
  const { user, admin } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation history for upline/reset functionality
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [originalRootUserId, setOriginalRootUserId] = useState<string | null>(null);
  
  // View Business Modal state
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedBusinessNode, setSelectedBusinessNode] = useState<TreeNode | null>(null);

  // Fetch tree data for a specific user with depth=3
  const fetchTreeData = useCallback(async (userId: string, isInitialLoad = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Use getNodeDownlines API with depth=3
      const response = await api.getNodeDownlines(userId, 4);
      
      if (response.data?.tree) {
        const rootUser = response.data.tree.find((u: TreeNode) => u.userId === userId);
        
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

  // Load admin tree by default on mount
  useEffect(() => {
    if (user || admin) {
      // Load admin tree (BIGBULL-000000) by default
      fetchTreeData('BIGBULL-000000', true);
      setSelectedUserId('BIGBULL-000000');
    }
  }, [user, admin, fetchTreeData]);

  // Handle initial user selection
  const handleUserSelect = () => {
    if (!selectedUserId.trim()) {
      toast.error('Please enter a User ID');
      return;
    }
    fetchTreeData(selectedUserId.trim(), true);
  };

  // Handle clicking on a node to make it the new root
  const handleNodeClick = (userId: string) => {
    if (userId === treeData?.rootUserId) return; // Already root
    fetchTreeData(userId, false);
  };

  // Handle going back to upline (parent)
  const handleGoUpline = () => {
    if (navigationHistory.length <= 1) {
      toast('Already at the top level', { icon: 'ℹ️' });
      return;
    }

    // Remove current from history and go to previous
    const newHistory = [...navigationHistory];
    newHistory.pop(); // Remove current
    const previousUserId = newHistory[newHistory.length - 1];
    
    setNavigationHistory(newHistory);
    fetchTreeData(previousUserId, false);
  };

  // Handle reset to original root
  const handleReset = () => {
    if (!originalRootUserId) {
      toast('No original root to reset to', { icon: 'ℹ️' });
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
      map.set(node.userId, node);
      if (node.id) {
        map.set(node.id, node); // Index by MongoDB _id for child lookups
        map.set(node.id.toString(), node); // Also as string
      }
    });
    return map;
  }, [treeData]);

  // Get root node
  const rootNode = useMemo(() => {
    if (!treeData) return null;
    return treeData.tree.find((n) => n.userId === treeData.rootUserId);
  }, [treeData]);

  // Render a tree node
  const renderNode = (node: TreeNode | null, level: number, position: 'left' | 'right' | 'root') => {
    if (!node) {
      // Empty slot placeholder
      return (
        <div
          key={`empty-${level}-${position}`}
          className="flex flex-col items-center justify-center w-24 h-20 border-2 border-dashed border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 opacity-60"
        >
          <div className="text-black text-[9px] font-medium">Empty</div>
        </div>
      );
    }

    const isRoot = position === 'root';
    const hasDownlines = (node.leftDownlines || 0) + (node.rightDownlines || 0) > 0;

    return (
      <div
        key={node.userId}
        className={`flex flex-col items-center transition-all duration-300 ${
          isRoot ? 'scale-110' : 'hover:scale-110'
        }`}
      >
        <div
          className={`w-28 p-2 rounded-xl border-2 shadow-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
            isRoot
              ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-indigo-400 text-white shadow-indigo-500/50 ring-2 ring-indigo-300/50'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 hover:ring-2 hover:ring-indigo-100'
          }`}
          onClick={() => !isRoot && handleNodeClick(node.userId)}
        >
          <div className="text-center">
            <div className={`font-bold text-[11px] mb-0.5 truncate w-full ${isRoot ? 'text-white drop-shadow-sm' : 'text-black'}`}>
              {node.name || 'Unknown'}
            </div>
            <div className={`text-[9px] mb-1 font-mono ${isRoot ? 'text-indigo-100' : 'text-black'}`}>
              {node.userId}
            </div>
            <div className={`text-[8px] px-1.5 py-0.5 rounded-full inline-block mb-1 font-semibold ${
              node.status === 'active'
                ? isRoot ? 'bg-emerald-400/90 text-white shadow-sm' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : isRoot ? 'bg-gray-400/80 text-white' : 'bg-gray-100 text-black border border-gray-200'
            }`}>
              {node.status}
            </div>
            <div className="flex gap-1 mt-1">
              <div className={`flex-1 text-center p-0.5 rounded-lg ${isRoot ? 'bg-blue-500/30 backdrop-blur-sm' : 'bg-blue-50 border border-blue-100'}`}>
                <div className={`text-[8px] font-semibold ${isRoot ? 'text-blue-100' : 'text-blue-600'}`}>L</div>
                <div className={`text-[9px] font-bold ${isRoot ? 'text-white' : 'text-blue-900'}`}>
                  {node.leftDownlines || 0}
                </div>
              </div>
              <div className={`flex-1 text-center p-0.5 rounded-lg ${isRoot ? 'bg-pink-500/30 backdrop-blur-sm' : 'bg-pink-50 border border-pink-100'}`}>
                <div className={`text-[8px] font-semibold ${isRoot ? 'text-pink-100' : 'text-pink-600'}`}>R</div>
                <div className={`text-[9px] font-bold ${isRoot ? 'text-white' : 'text-pink-900'}`}>
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
              className={`mt-1 w-full py-0.5 px-1 rounded-lg text-[9px] font-semibold transition-all duration-200 ${
                isRoot
                  ? 'bg-white/95 text-indigo-600 hover:bg-white hover:shadow-lg hover:scale-105'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:scale-105'
              }`}
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Build tree structure (max 3 levels from root)
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
      level3: {
        leftLeftLeft: TreeNode | null;
        leftLeftRight: TreeNode | null;
        leftRightLeft: TreeNode | null;
        leftRightRight: TreeNode | null;
        rightLeftLeft: TreeNode | null;
        rightLeftRight: TreeNode | null;
        rightRightLeft: TreeNode | null;
        rightRightRight: TreeNode | null;
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
      level3: {
        leftLeftLeft: null,
        leftLeftRight: null,
        leftRightLeft: null,
        leftRightRight: null,
        rightLeftLeft: null,
        rightLeftRight: null,
        rightRightLeft: null,
        rightRightRight: null,
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
        structure.level2.leftLeft = treeMap.get(leftNode.leftChild) || null;
      }
      if (leftNode.rightChild) {
        structure.level2.leftRight = treeMap.get(leftNode.rightChild) || null;
      }
    }
    if (structure.level1.right) {
      const rightNode = structure.level1.right;
      if (rightNode.leftChild) {
        structure.level2.rightLeft = treeMap.get(rightNode.leftChild) || null;
      }
      if (rightNode.rightChild) {
        structure.level2.rightRight = treeMap.get(rightNode.rightChild) || null;
      }
    }

    // Level 3: Great-grandchildren
    const getChildNode = (node: TreeNode, childType: 'left' | 'right'): TreeNode | null => {
      const childId = childType === 'left' ? node.leftChild : node.rightChild;
      return childId ? treeMap.get(childId) || null : null;
    };

    if (structure.level2.leftLeft) {
      structure.level3.leftLeftLeft = getChildNode(structure.level2.leftLeft, 'left');
      structure.level3.leftLeftRight = getChildNode(structure.level2.leftLeft, 'right');
    }
    if (structure.level2.leftRight) {
      structure.level3.leftRightLeft = getChildNode(structure.level2.leftRight, 'left');
      structure.level3.leftRightRight = getChildNode(structure.level2.leftRight, 'right');
    }
    if (structure.level2.rightLeft) {
      structure.level3.rightLeftLeft = getChildNode(structure.level2.rightLeft, 'left');
      structure.level3.rightLeftRight = getChildNode(structure.level2.rightLeft, 'right');
    }
    if (structure.level2.rightRight) {
      structure.level3.rightRightLeft = getChildNode(structure.level2.rightRight, 'left');
      structure.level3.rightRightRight = getChildNode(structure.level2.rightRight, 'right');
    }

    return structure;
  };

  const treeStructure = buildTreeStructure();

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Genealogy
        </h1>
        <p className="mt-2 text-sm text-black">Interactive binary referral tree explorer with smooth navigation</p>
      </div>

      {/* User Selection */}
      <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-xl shadow-lg border border-indigo-100 p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-black mb-2">
              Select User
            </label>
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUserSelect();
                }
              }}
              placeholder="Enter User ID (e.g., BIGBULL-000123)"
              className="w-full px-4 py-2.5 border-2 text-black border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white shadow-sm"
            />
          </div>
          <button
            onClick={handleUserSelect}
            disabled={loading || !selectedUserId.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            {loading ? 'Loading...' : 'Load Tree'}
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      {treeData && (
        <div className="bg-gradient-to-r from-white via-indigo-50/50 to-white rounded-xl shadow-lg border border-indigo-100 p-4 mb-6 flex gap-3 items-center">
          <button
            onClick={handleGoUpline}
            disabled={navigationHistory.length <= 1}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Upline User
          </button>
          <button
            onClick={handleReset}
            disabled={!originalRootUserId || treeData.rootUserId === originalRootUserId}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <div className="flex-1"></div>
          <div className="text-sm text-black flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg border border-gray-200">
            <span className="font-medium">Current Root:</span>
            <span className="font-bold text-indigo-700">{treeData.rootName}</span>
            <span className="text-black font-mono text-xs">({treeData.rootUserId})</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-black font-medium">Loading genealogy tree...</p>
        </div>
      )}

      {/* Tree Visualization */}
      {treeStructure && !loading && (
        <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 rounded-xl shadow-2xl p-6 overflow-x-auto transition-all duration-300 border border-gray-100">
          <div className="tree-container mx-auto" style={{ maxWidth: '1000px', position: 'relative' }}>
            {/* Level 0: Root */}
            <div className="flex justify-center mb-12 relative">
              <div className="relative z-20">
                {renderNode(treeStructure.root, 0, 'root')}
              </div>
              {/* Vertical line down from root with gradient */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-indigo-300 rounded-full" style={{ zIndex: 1 }}></div>
            </div>

            {/* Level 1: Direct Children */}
            <div className="flex justify-center gap-24 mb-10 relative">
              {/* Horizontal line connecting level 1 with gradient */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent rounded-full" style={{ width: '320px' }}></div>
              {/* Vertical lines down to level 1 nodes */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-indigo-300 to-indigo-200 rounded-full" style={{ marginLeft: '-160px' }}></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-indigo-300 to-indigo-200 rounded-full" style={{ marginLeft: '160px' }}></div>
              
              <div className="relative z-20">
                {renderNode(treeStructure.level1.left, 1, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level1.right, 1, 'right')}
              </div>
            </div>

            {/* Level 2: Grandchildren */}
            <div className="flex justify-center gap-12 mb-8 relative">
              {/* Horizontal lines connecting level 2 */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-200 to-transparent rounded-full" style={{ width: '600px' }}></div>
              {/* Vertical lines down to level 2 nodes */}
              {[-225, -75, 75, 225].map((offset) => (
                <div
                  key={offset}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gradient-to-b from-purple-200 to-purple-100 rounded-full"
                  style={{ marginLeft: `${offset}px` }}
                ></div>
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

            {/* Level 3: Great-grandchildren - Compact Layout */}
            <div className="flex justify-center gap-3 relative">
              {/* Horizontal lines connecting level 3 - Reduced width */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-200 to-transparent rounded-full" style={{ width: '500px' }}></div>
              {/* Vertical lines down to level 3 nodes - Reduced spacing */}
              {[-175, -125, -75, -25, 25, 75, 125, 175].map((offset) => (
                <div
                  key={offset}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-pink-200 to-pink-100 rounded-full"
                  style={{ marginLeft: `${offset}px` }}
                ></div>
              ))}
              
              <div className="relative z-20">
                {renderNode(treeStructure.level3.leftLeftLeft, 3, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level3.leftLeftRight, 3, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level3.leftRightLeft, 3, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level3.leftRightRight, 3, 'left')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level3.rightLeftLeft, 3, 'right')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level3.rightLeftRight, 3, 'right')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level3.rightRightLeft, 3, 'right')}
              </div>
              <div className="relative z-20">
                {renderNode(treeStructure.level3.rightRightRight, 3, 'right')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!treeData && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-black">No Tree Loaded</h3>
          <p className="mt-2 text-sm text-black">Enter a User ID above to view their genealogy tree</p>
        </div>
      )}

      {/* View Business Modal */}
      {showBusinessModal && selectedBusinessNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">User Business Details</h2>
              <button
                onClick={() => {
                  setShowBusinessModal(false);
                  setSelectedBusinessNode(null);
                }}
                className="text-black hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Profile Section */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">User Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black">User ID</label>
                    <p className="mt-1 text-sm text-black">{selectedBusinessNode.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Name</label>
                    <p className="mt-1 text-sm text-black">{selectedBusinessNode.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Email</label>
                    <p className="mt-1 text-sm text-black">{selectedBusinessNode.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Phone</label>
                    <p className="mt-1 text-sm text-black">{selectedBusinessNode.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Status</label>
                    <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedBusinessNode.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-black'
                    }`}>
                      {selectedBusinessNode.status}
                    </span>
                  </div>
                  {selectedBusinessNode.totalInvestment && (
                    <div>
                      <label className="text-sm font-medium text-black">Total Investment</label>
                      <p className="mt-1 text-sm text-black">${parseFloat(selectedBusinessNode.totalInvestment).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Parent Information</h3>
                {selectedBusinessNode.parent || selectedBusinessNode.parentUserId ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-black">
                      {selectedBusinessNode.parentName && selectedBusinessNode.parentUserId
                        ? `${selectedBusinessNode.parentName} (${selectedBusinessNode.parentUserId})`
                        : (() => {
                            const parentNode = treeData?.tree.find(n => n.id === selectedBusinessNode.parent);
                            return parentNode ? `${parentNode.name} (${parentNode.userId})` : (selectedBusinessNode.parentUserId || 'Parent ID: ' + selectedBusinessNode.parent);
                          })()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-black">No parent (Root user)</p>
                )}
              </div>

              {/* Binary Business Section */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Binary Business</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Left Business</span>
                      <span className="text-lg font-bold text-blue-900">
                        ${parseFloat(selectedBusinessNode.leftBusiness || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700">
                      Left Downlines: <span className="font-semibold">{selectedBusinessNode.leftDownlines || 0}</span>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900">Right Business</span>
                      <span className="text-lg font-bold text-purple-900">
                        ${parseFloat(selectedBusinessNode.rightBusiness || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-purple-700">
                      Right Downlines: <span className="font-semibold">{selectedBusinessNode.rightDownlines || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carry Forward Section */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Carry Forward</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-900">Left Carry</span>
                      <span className="text-lg font-bold text-orange-900">
                        ${parseFloat(selectedBusinessNode.leftCarry || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-pink-900">Right Carry</span>
                      <span className="text-lg font-bold text-pink-900">
                        ${parseFloat(selectedBusinessNode.rightCarry || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downline Counts Summary */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Downline Summary</h3>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-indigo-700">Total Left Downlines:</span>
                      <span className="ml-2 text-lg font-bold text-indigo-900">{selectedBusinessNode.leftDownlines || 0}</span>
                    </div>
                    <div>
                      <span className="text-sm text-indigo-700">Total Right Downlines:</span>
                      <span className="ml-2 text-lg font-bold text-indigo-900">{selectedBusinessNode.rightDownlines || 0}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-indigo-200">
                      <span className="text-sm text-indigo-700">Total Downlines:</span>
                      <span className="ml-2 text-xl font-bold text-indigo-900">
                        {(selectedBusinessNode.leftDownlines || 0) + (selectedBusinessNode.rightDownlines || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowBusinessModal(false);
                  setSelectedBusinessNode(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
