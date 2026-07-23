'use client';

import { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

interface TreeUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  parent: string | null;
  parentUserId: string | null;
  parentName: string | null;
  leftChild: string | null;
  rightChild: string | null;
  allChildren?: string[];
  leftBusiness: string;
  rightBusiness: string;
  leftCarry: string;
  rightCarry: string;
  leftDownlines: number;
  rightDownlines: number;
  level: number;
  totalInvestment?: string;
  dailyBinaryBusiness?: string;
  cappingLimit?: string;
}

interface TreeData {
  tree: TreeUser[];
  rootUserId: string;
  rootName: string;
}

interface CustomNodeData {
  user: TreeUser;
  isRoot: boolean;
  onHover: (user: TreeUser | null) => void;
  onExpand?: (userId: string) => void;
  isExpanded?: boolean;
  isLoading?: boolean;
  hasMoreDownlines?: boolean;
}

const CustomNode = memo(({ data }: { data: CustomNodeData }) => {
  const { user, isRoot, onHover, onExpand, isExpanded, isLoading, hasMoreDownlines } = data;
  const [showPopup, setShowPopup] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShowPopup(true);
    onHover(user);
  }, [user, onHover]);

  const handleMouseLeave = useCallback(() => {
    setShowPopup(false);
    onHover(null);
  }, [onHover]);

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand && !isExpanded && !isLoading && hasMoreDownlines) {
      onExpand(user.userId);
    }
  }, [onExpand, isExpanded, isLoading, hasMoreDownlines, user.userId]);

  const isAdmin = user.userId === "BIGBULL-000000" || user.userId === "CROWN-000000" || user.userId === "CNEOX-000000";
  const totalChildren = isAdmin ? (user.allChildren?.length || user.leftDownlines || 0) : null;

  return (
    <div
      className={`custom-node ${isRoot ? 'root-node' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', zIndex: showPopup ? 99998 : 'auto' }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <div className="node-header">{user.name || 'Unknown'}</div>
        <div className="node-userid">{user.userId || 'N/A'}</div>
        <div className="node-status">{user.status}</div>
        <div className="node-business">
          {isAdmin ? (
            <div className="business-total" style={{ width: '100%', textAlign: 'center' }}>
              <span className="business-label">Children</span>
              <span className="business-value">{totalChildren}</span>
            </div>
          ) : (
            <>
              <div className="business-left">
                <span className="business-label">L</span>
                <div className="business-details">
                  <span className="business-amount">${parseFloat(user.leftBusiness || '0').toFixed(0)}</span>
                  <span className="business-downlines">({user.leftDownlines})</span>
                </div>
              </div>
              <div className="business-right">
                <span className="business-label">R</span>
                <div className="business-details">
                  <span className="business-amount">${parseFloat(user.rightBusiness || '0').toFixed(0)}</span>
                  <span className="business-downlines">({user.rightDownlines})</span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="node-investment">
          <span className="investment-label">Total Investment</span>
          <span className="investment-value">
            ${parseFloat(user.totalInvestment || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        {/* Expand button for nodes with downlines */}
        {hasMoreDownlines && !isExpanded && (
          <button
            onClick={handleExpand}
            disabled={isLoading}
            className="expand-button"
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              borderRadius: '8px',
              color: '#fbbf24',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.75em',
              fontWeight: 600,
              width: '100%',
              transition: 'all 0.2s',
              pointerEvents: 'auto', // Enable pointer events even though parent has pointer-events: none
              position: 'relative',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.7)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
            }}
          >
            {isLoading ? 'Loading...' : (
              isAdmin 
                ? `View Downlines (${totalChildren || 0})`
                : `View Downlines (L:${user.leftDownlines || 0} R:${user.rightDownlines || 0})`
            )}
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
      {showPopup && (
        <div className="node-popup" style={{ zIndex: 99999, pointerEvents: 'none' }}>
          <div className="popup-header">User Details</div>
          <div className="popup-content">
            <div className="popup-item">
              <strong>Name:</strong> {user.name || 'Unknown'}
            </div>
            <div className="popup-item">
              <strong>User ID:</strong> {user.userId || 'N/A'}
            </div>
            <div className="popup-item">
              <strong>Status:</strong> {user.status}
            </div>
            {isAdmin ? (
              <>
                <div className="popup-item">
                  <strong>Total Children:</strong> {totalChildren || 0}
                </div>
                <div className="popup-item" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eab308' }}>
                  <strong>Total Investment:</strong> ${parseFloat(user.totalInvestment || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </>
            ) : (
              <>
                <div className="popup-item">
                  <strong>Left Business:</strong> ${parseFloat(user.leftBusiness || '0').toFixed(2)}
                </div>
                <div className="popup-item">
                  <strong>Right Business:</strong> ${parseFloat(user.rightBusiness || '0').toFixed(2)}
                </div>
                <div className="popup-item">
                  <strong>Left Carry Forward:</strong> ${parseFloat(user.leftCarry || '0').toFixed(2)}
                </div>
                <div className="popup-item">
                  <strong>Right Carry Forward:</strong> ${parseFloat(user.rightCarry || '0').toFixed(2)}
                </div>
                <div className="popup-item">
                  <strong>Left Downlines:</strong> {user.leftDownlines || 0}
                </div>
                <div className="popup-item">
                  <strong>Right Downlines:</strong> {user.rightDownlines || 0}
                </div>
                <div className="popup-item" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eab308' }}>
                  <strong>Daily Binary Business:</strong> ${parseFloat(user.dailyBinaryBusiness || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="popup-item">
                  <strong>Capping Limit:</strong> ${parseFloat(user.cappingLimit || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day
                </div>
                <div className="popup-item" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eab308' }}>
                  <strong>Total Investment:</strong> ${parseFloat(user.totalInvestment || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

export default function MyTreePage() {
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredUser, setHoveredUser] = useState<TreeUser | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [maxDepth, setMaxDepth] = useState<number>(2); // Initial depth limit for lazy loading (2 levels only)
  const [showAllNodes, setShowAllNodes] = useState(false); // Start with limited nodes for performance
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Fetch tree data - initially load limited depth (user's own tree)
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        // Use the user's own tree endpoint with limited initial depth (2 levels only)
        const initialDepth = maxDepth; // Use the state value (2 levels)
        const response = await api.getMyTree(initialDepth); // Request initial depth
        
        if (response.data?.tree) {
          // Filter nodes to only show up to initial depth (in case API returns more)
          const filteredTree = response.data.tree.filter((u: TreeUser) => {
            const nodeLevel = u.level !== undefined ? u.level : 0;
            return nodeLevel <= initialDepth;
          });
          
          setTreeData({
            tree: filteredTree,
            rootUserId: response.data.rootUserId,
            rootName: response.data.rootName,
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tree data');
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [maxDepth]); // Re-fetch if maxDepth changes

  // Handle node expansion - load downlines for a specific node
  const handleExpandNode = useCallback(async (userId: string) => {
    if (expandedNodes.has(userId) || loadingNodes.has(userId)) return;

    try {
      setLoadingNodes(prev => new Set(prev).add(userId));
      
      const response = await api.getNodeDownlines(userId, 10); // Load up to 10 levels deep
      
      if (response.data?.tree) {
        // Merge new tree data with existing data
        setTreeData(prev => {
          if (!prev || !response.data?.tree) return prev;
          
          // Use userId for deduplication (more reliable than id)
          const existingUserIds = new Set(prev.tree.map(u => u.userId));
          const newUsers = response.data.tree.filter((u: TreeUser) => !existingUserIds.has(u.userId));
          
          return {
            tree: [...prev.tree, ...newUsers],
            rootUserId: prev.rootUserId,
            rootName: prev.rootName,
          };
        });
        
        setExpandedNodes(prev => new Set(prev).add(userId));
      }
    } catch (err: any) {
      console.error('Error expanding node:', err);
      setError(err.message || 'Failed to load downlines');
    } finally {
      setLoadingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [expandedNodes, loadingNodes]);

  const treeMap = useMemo(() => {
    const map = new Map<string, TreeUser>();
    if (treeData?.tree) {
      treeData.tree.forEach((user) => {
        map.set(user.id, user);
      });
    }
    return map;
  }, [treeData]);

  const { nodes: computedNodes, edges: computedEdges } = useMemo(() => {
    if (!treeData || !treeData.tree || treeMap.size === 0) {
      return { nodes: [], edges: [] };
    }

    const tree = treeData.tree;
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];

    // Find root node (user's own node)
    const root = tree.find((u) => u.userId === treeData.rootUserId);
    if (!root) return { nodes: [], edges: [] };

    const nodePositions = new Map<string, { x: number; y: number }>();
    const levels: TreeUser[][] = [];
    const processed = new Set<string>();

    const childrenMap = new Map<string, TreeUser[]>();
    tree.forEach((user) => {
      if (user.parent) {
        if (!childrenMap.has(user.parent)) {
          childrenMap.set(user.parent, []);
        }
        childrenMap.get(user.parent)!.push(user);
      }
    });

    const addToLevel = (user: TreeUser, level: number, parentExpanded: boolean = false) => {
      if (!user || processed.has(user.id)) return;
      
      // Get the actual level from node data if available, otherwise use calculated level
      const nodeLevel = user.level !== undefined ? user.level : level;
      
      // Limit depth for performance if not showing all nodes
      // But allow expanded nodes to show their children
      if (!showAllNodes && nodeLevel > maxDepth) {
        // If parent is expanded, allow children to be shown
        if (!parentExpanded) {
          return;
        }
      }
      
      // Also check if this node exists in treeData (might have been filtered out)
      if (!treeMap.has(user.id)) {
        return;
      }

      if (!levels[level]) levels[level] = [];
      levels[level].push(user);
      processed.add(user.id);

      const isAdmin = user.userId === "BIGBULL-000000" || user.userId === "CROWN-000000" || user.userId === "CNEOX-000000";
      const childrenSet = new Set<TreeUser>();
      
      if (isAdmin) {
        const allChildren = childrenMap.get(user.id) || [];
        allChildren.forEach(child => {
          if (child) childrenSet.add(child);
        });
      } else {
        const leftChild = user.leftChild ? treeMap.get(user.leftChild) : null;
        const rightChild = user.rightChild ? treeMap.get(user.rightChild) : null;
        
        if (leftChild) childrenSet.add(leftChild);
        if (rightChild) childrenSet.add(rightChild);
        
        const allChildren = childrenMap.get(user.id) || [];
        allChildren.forEach(child => {
          if (child) childrenSet.add(child);
        });
      }

      // Add all children to next level
      const isExpanded = expandedNodes.has(user.userId);
      childrenSet.forEach(child => {
        if (child && !processed.has(child.id)) {
          addToLevel(child, level + 1, isExpanded);
        }
      });
    };

    addToLevel(root, 0, true); // Root is always "expanded"

    if (showAllNodes) {
      tree.forEach((user) => {
        if (!processed.has(user.id)) {
          let level = user.level || 0;
          if (!levels[level]) levels[level] = [];
          levels[level].push(user);
          processed.add(user.id);
        }
      });
    }

    const maxWidth = 8000;
    const horizontalSpacing = 400;
    const verticalSpacing = 300;

    levels.forEach((levelUsers, levelIndex) => {
      const levelWidth = levelUsers.length;
      const startX = (maxWidth - (levelWidth - 1) * horizontalSpacing) / 2;

      levelUsers.forEach((user, index) => {
        const x = startX + index * horizontalSpacing;
        const y = levelIndex * verticalSpacing + 150;
        nodePositions.set(user.id, { x, y });
      });
    });

    levels.forEach((levelUsers, levelIndex) => {
      levelUsers.forEach((user) => {
        // Get actual level from node data or use calculated levelIndex
        const nodeLevel = user.level !== undefined ? user.level : levelIndex;
        
        // Skip nodes beyond maxDepth if not showing all nodes and not expanded
        if (!showAllNodes && nodeLevel > maxDepth) {
          const parentUser = user.parent ? treeMap.get(user.parent) : null;
          const parentExpanded = parentUser ? expandedNodes.has(parentUser.userId) : false;
          if (!parentExpanded) {
            return; // Skip this node
          }
        }
        
        const isRoot = user.id === root.id;
        const position = nodePositions.get(user.id) || { x: 0, y: 0 };
        
        // Check if this node has more downlines that aren't loaded yet
        const totalDownlines = (user.leftDownlines || 0) + (user.rightDownlines || 0);
        const leftDownlinesCount = user.leftDownlines || 0;
        const rightDownlinesCount = user.rightDownlines || 0;
        
        // Count loaded direct children
        const hasLeftChildLoaded = user.leftChild && treeMap.has(user.leftChild);
        const hasRightChildLoaded = user.rightChild && treeMap.has(user.rightChild);
        const loadedChildrenCount = (hasLeftChildLoaded ? 1 : 0) + (hasRightChildLoaded ? 1 : 0);
        
        // Check if node is at max depth
        const isAtMaxDepth = !showAllNodes && nodeLevel >= maxDepth;
        
        // For normal users: show expand if:
        // 1. Not already expanded
        // 2. Has downlines (left or right)
        // 3. Either at max depth OR has more downlines than loaded children OR no children loaded but has downlines
        const hasMoreDownlines = !expandedNodes.has(user.userId) && 
          totalDownlines > 0 && 
          (
            isAtMaxDepth || // At max depth - definitely has more to load
            totalDownlines > loadedChildrenCount || // More downlines than direct children loaded
            (!hasLeftChildLoaded && leftDownlinesCount > 0) || // Has left downlines but no left child loaded
            (!hasRightChildLoaded && rightDownlinesCount > 0) // Has right downlines but no right child loaded
          );

        const node: Node = {
          id: user.id,
          type: 'custom',
          position,
          data: {
            user,
            isRoot,
            onHover: setHoveredUser,
            onExpand: handleExpandNode,
            isExpanded: expandedNodes.has(user.userId),
            isLoading: loadingNodes.has(user.userId),
            hasMoreDownlines: hasMoreDownlines && (user.leftDownlines > 0 || user.rightDownlines > 0),
          },
        };
        nodeMap.set(user.id, node);

        const userChildren = childrenMap.get(user.id) || [];
        if (user.leftChild) {
          const leftChildUser = treeMap.get(user.leftChild);
          if (leftChildUser && !userChildren.find(c => c.id === user.leftChild)) {
            userChildren.push(leftChildUser);
          }
        }
        if (user.rightChild) {
          const rightChildUser = treeMap.get(user.rightChild);
          if (rightChildUser && !userChildren.find(c => c.id === user.rightChild)) {
            userChildren.push(rightChildUser);
          }
        }

        userChildren.forEach((child) => {
          const isLeft = child.id === user.leftChild;
          const isRight = child.id === user.rightChild;
          
          edgeList.push({
            id: `${user.id}-${child.id}`,
            source: user.id,
            target: child.id,
            type: 'smoothstep',
            style: { 
              stroke: isLeft ? '#eab308' : isRight ? '#fbbf24' : '#6b7280', 
              strokeWidth: 3 
            },
            label: isLeft ? 'L' : isRight ? 'R' : '',
            labelStyle: { 
              fill: isLeft ? '#eab308' : isRight ? '#fbbf24' : '#9ca3af', 
              fontWeight: 600 
            },
          });
        });
      });
    });
    return { nodes: Array.from(nodeMap.values()), edges: edgeList };
  }, [treeData, treeMap, maxDepth, showAllNodes, expandedNodes, loadingNodes, handleExpandNode]);

  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  // Handle search functionality
  const handleSearch = useCallback((searchValue: string) => {
    if (!searchValue.trim() || !treeData || !treeMap) {
      setSearchError(null);
      setHighlightedNodeId(null);
      return;
    }

    const searchLower = searchValue.trim().toLowerCase();
    let foundUser: TreeUser | null = null;

    // Search by userId (exact or partial match)
    for (const user of treeData.tree) {
      if (user.userId?.toLowerCase().includes(searchLower) || 
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)) {
        foundUser = user;
        break;
      }
    }

    if (foundUser) {
      setSearchError(null);
      setHighlightedNodeId(foundUser.id);
      
      // Find the node and navigate to it
      const targetNode = computedNodes.find(n => n.id === foundUser!.id);
      if (targetNode && reactFlowInstance.current) {
        const { x, y } = targetNode.position;
        reactFlowInstance.current.setCenter(x, y, { zoom: 1.2, duration: 800 });
      }
    } else {
      setSearchError(`User "${searchValue}" not found in your tree`);
      setHighlightedNodeId(null);
    }
  }, [treeData, treeMap, computedNodes]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  if (loading) {
    return <BigBullLoader text="Loading tree…" />;
  }

  if (error) {
    return (
      <div className={t.page}>
        <div className={t.error}>Error: {error}</div>
      </div>
    );
  }

  return (
      <div className="flex h-[calc(100dvh-11.5rem)] w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#d8e6ec] bg-white shadow-sm sm:rounded-2xl md:h-[calc(100dvh-8rem)]">
        <div className="z-10 border-b border-[#d8e6ec] bg-[#F7FBFC] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className={t.title}>My Genealogy</h1>
                {treeData && (
                  <p className={t.subtitle}>
                    Root: {treeData.rootName} ({treeData.rootUserId}) — {treeData.tree.length} total nodes
                  </p>
                )}
              </div>
              <button type="button" onClick={() => window.history.back()} className={t.btnSecondary}>
                ← Back
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSearchError(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchTerm); }}
                  placeholder="Search by User ID, Name, or Email..."
                  className={`${t.input} pl-10`}
                />
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform"
                  style={{ color: t.primary }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button type="button" onClick={() => handleSearch(searchTerm)} className={t.btnPrimary}>Search</button>
              {searchTerm && (
                <button type="button" onClick={() => { setSearchTerm(''); setSearchError(null); setHighlightedNodeId(null); }} className={t.btnGhost}>
                  Clear
                </button>
              )}
            </div>
            {searchError && <div className={t.error}>{searchError}</div>}
          </div>
        </div>
        <div className="flex-1" style={{ position: 'relative', overflow: 'visible', zIndex: 1 }}>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              style: {
                ...node.style,
                border: highlightedNodeId === node.id ? '4px solid #fbbf24' : undefined,
                boxShadow: highlightedNodeId === node.id ? '0 0 30px rgba(251, 191, 36, 1)' : undefined,
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onInit={onInit}
            fitView
            className="bg-[#F7FBFC]"
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            selectNodesOnDrag={true}
            onlyRenderVisibleElements={true}
          >
            <Background color="#d8e6ec" gap={16} />
            <Controls />
            <MiniMap 
              style={{
                background: '#F7FBFC',
                border: '1px solid #d8e6ec',
              }}
              nodeColor="#05627C"
              maskColor="rgba(11, 31, 42, 0.08)"
            />
          </ReactFlow>
        </div>
        <style jsx global>{`
          .custom-node {
            background: linear-gradient(135deg, #ffffff 0%, #F7FBFC 100%);
            border: 2px solid #05627C;
            border-radius: 12px;
            padding: 18px 24px;
            min-width: 280px;
            max-width: 320px;
            box-shadow: 0 4px 12px rgba(5, 98, 124, 0.12);
            transition: all 0.3s ease;
            position: relative;
            font-size: 14px;
            color: #0B1F2A;
            cursor: move;
          }
          .custom-node:hover {
            transform: scale(1.03);
            box-shadow: 0 8px 20px rgba(5, 98, 124, 0.18);
            border-color: #3FA9C8;
            z-index: 100;
          }
          .custom-node.root-node {
            background: linear-gradient(135deg, #FFF9E6 0%, #ffffff 100%);
            border-color: #F5CF0B;
            min-width: 320px;
            max-width: 360px;
            box-shadow: 0 6px 16px rgba(245, 207, 11, 0.25);
          }
          .custom-node.root-node:hover {
            box-shadow: 0 10px 30px rgba(234, 179, 8, 0.8);
            border-color: #fcd34d;
          }
          .custom-node.root-node .node-header,
          .custom-node.root-node .node-userid,
          .custom-node.root-node .business-amount,
          .custom-node.root-node .business-value,
          .custom-node.root-node .investment-value {
            color: #000;
            text-shadow: none;
          }
          .custom-node.root-node .node-status,
          .custom-node.root-node .business-left,
          .custom-node.root-node .business-right,
          .custom-node.root-node .node-investment {
            background: rgba(0, 0, 0, 0.2);
          }
          .custom-node.root-node .business-label,
          .custom-node.root-node .investment-label {
            color: rgba(0, 0, 0, 0.8);
          }
          .custom-node.root-node .business-downlines {
            color: rgba(0, 0, 0, 0.7);
          }
          .node-popup {
            position: absolute;
            top: 50%;
            right: calc(100% + 16px);
            transform: translateY(-50%);
            background: #ffffff;
            border: 2px solid #05627C;
            border-radius: 12px;
            padding: 16px;
            min-width: 250px;
            max-width: 300px;
            box-shadow: 0 8px 24px rgba(5, 98, 124, 0.15);
            z-index: 99999 !important;
            pointer-events: none !important;
            font-size: 0.85em;
            white-space: normal;
            color: #0B1F2A;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            isolation: isolate;
          }
          .node-popup::before {
            content: '';
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border: 8px solid transparent;
            border-left-color: #05627C;
            z-index: 99999;
          }
          .custom-node.root-node .node-popup {
            border-color: #fbbf24;
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          }
          .custom-node.root-node .node-popup::before {
            border-left-color: #fbbf24;
          }
          .react-flow__node {
            z-index: 1 !important;
          }
          .react-flow__node:hover {
            z-index: 100 !important;
          }
          .react-flow__node .node-popup {
            z-index: 99999 !important;
          }
          .popup-header {
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #05627C;
            color: #05627C;
          }
          .popup-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .popup-item {
            font-size: 0.85em;
            color: #5A6F78;
          }
          .popup-item strong {
            color: #05627C;
          }
          .node-header {
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 6px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .node-userid {
            font-size: 0.85em;
            opacity: 0.9;
            margin-bottom: 8px;
          }
          .node-status {
            font-size: 0.8em;
            padding: 4px 8px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.2);
            display: inline-block;
            margin-bottom: 10px;
          }
          .node-business {
            display: flex;
            justify-content: space-around;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid rgba(255, 255, 255, 0.3);
          }
          .business-left,
          .business-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 6px 10px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            min-width: 60px;
          }
          .business-label {
            font-size: 0.75em;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 4px;
            font-weight: 600;
          }
          .business-details {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }
          .business-amount {
            font-weight: bold;
            font-size: 1em;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          }
          .business-downlines {
            font-size: 0.7em;
            color: rgba(255, 255, 255, 0.85);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          }
          .business-value {
            font-weight: bold;
            font-size: 1.2em;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          }
          .business-total {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .node-investment {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            border-top: 2px solid rgba(255, 255, 255, 0.3);
          }
          .investment-label {
            font-size: 0.75em;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
          }
          .investment-value {
            font-weight: bold;
            font-size: 1em;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          }
          .node-content {
            pointer-events: none;
          }
          .expand-button {
            pointer-events: auto !important;
            position: relative;
            z-index: 10;
          }
          .react-flow__controls {
            background: #ffffff !important;
            border: 1px solid #d8e6ec !important;
          }
          .react-flow__controls-button {
            background: #F7FBFC !important;
            border: 1px solid #d8e6ec !important;
            color: #05627C !important;
          }
          .react-flow__controls-button:hover {
            background: #E8F5F0 !important;
            color: #05627C !important;
          }
          .react-flow__background {
            background-color: #F7FBFC !important;
          }
        `}</style>
      </div>
  );
}
