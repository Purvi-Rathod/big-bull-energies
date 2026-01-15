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
import CrownLoader from '@/components/CrownLoader';

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
}

const CustomNode = memo(({ data }: { data: CustomNodeData }) => {
  const { user, isRoot, onHover } = data;
  const [showPopup, setShowPopup] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShowPopup(true);
    onHover(user);
  }, [user, onHover]);

  const handleMouseLeave = useCallback(() => {
    setShowPopup(false);
    onHover(null);
  }, [onHover]);

  const isAdmin = user.userId === "CROWN-000000" || user.userId === "CROWN-000000";
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
  const [maxDepth, setMaxDepth] = useState<number>(5);
  const [showAllNodes, setShowAllNodes] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        const response = await api.getMyTree();
        if (response.data) {
          setTreeData(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tree data');
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, []);

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

    const addToLevel = (user: TreeUser, level: number) => {
      if (!user || processed.has(user.id)) return;
      if (!showAllNodes && level > maxDepth) return;

      if (!levels[level]) levels[level] = [];
      levels[level].push(user);
      processed.add(user.id);

      const isAdmin = user.userId === "CROWN-000000" || user.userId === "CROWN-000000";
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

      childrenSet.forEach(child => {
        if (child && !processed.has(child.id)) {
          addToLevel(child, level + 1);
        }
      });
    };

    addToLevel(root, 0);

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

    levels.forEach((levelUsers) => {
      levelUsers.forEach((user) => {
        const isRoot = user.id === root.id;
        const position = nodePositions.get(user.id) || { x: 0, y: 0 };

        const node: Node = {
          id: user.id,
          type: 'custom',
          position,
          data: {
            user,
            isRoot,
            onHover: setHoveredUser,
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
  }, [treeData, treeMap, maxDepth, showAllNodes]);

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
    return <CrownLoader fullScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
    );
  }

  return (
      <div className="w-full h-[calc(100vh-8rem)] flex flex-col bg-black rounded-lg overflow-hidden border border-yellow-500/20">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-yellow-500/30 shadow-lg p-4 z-10">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-center text-white">My Genealogy</h1>
                {treeData && (
                  <p className="text-center text-white/70 mt-1">
                    Root: {treeData.rootName} ({treeData.rootUserId}) - {treeData.tree.length} total nodes
                  </p>
                )}
              </div>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold shadow-lg hover:shadow-yellow-500/50"
              >
                ← Back
              </button>
            </div>
            {/* Search Bar */}
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchTerm);
                    }
                  }}
                  placeholder="Search by User ID, Name, or Email..."
                  className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder:text-gray-400"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => handleSearch(searchTerm)}
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all font-semibold shadow-lg hover:shadow-yellow-500/50"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchError(null);
                    setHighlightedNodeId(null);
                  }}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700 border border-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {searchError && (
              <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/50 p-2 rounded">
                {searchError}
              </div>
            )}
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
            className="bg-gray-50"
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            selectNodesOnDrag={true}
            onlyRenderVisibleElements={true}
          >
            <Background color="#374151" gap={16} />
            <Controls />
            <MiniMap 
              style={{
                background: '#1f2937',
                border: '1px solid #eab308',
              }}
              nodeColor="#eab308"
              maskColor="rgba(0, 0, 0, 0.6)"
            />
          </ReactFlow>
        </div>
        <style jsx global>{`
          .custom-node {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border: 3px solid #eab308;
            border-radius: 12px;
            padding: 18px 24px;
            min-width: 280px;
            max-width: 320px;
            box-shadow: 0 6px 16px rgba(234, 179, 8, 0.3);
            transition: all 0.3s ease;
            position: relative;
            font-size: 14px;
            color: white;
            cursor: move;
          }
          .custom-node:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(234, 179, 8, 0.5);
            border-color: #fbbf24;
            z-index: 100;
          }
          .custom-node.root-node {
            background: linear-gradient(135deg, #eab308 0%, #fbbf24 100%);
            border-color: #fbbf24;
            color: #000;
            min-width: 320px;
            max-width: 360px;
            box-shadow: 0 8px 24px rgba(234, 179, 8, 0.6);
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
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border: 2px solid #eab308;
            border-radius: 12px;
            padding: 16px;
            min-width: 250px;
            max-width: 300px;
            box-shadow: 0 8px 24px rgba(234, 179, 8, 0.4);
            z-index: 99999 !important;
            pointer-events: none !important;
            font-size: 0.85em;
            white-space: normal;
            color: white;
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
            border-left-color: #eab308;
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
            border-bottom: 1px solid #eab308;
            color: #fbbf24;
          }
          .popup-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .popup-item {
            font-size: 0.85em;
            color: #e5e7eb;
          }
          .popup-item strong {
            color: #fbbf24;
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
          .react-flow__controls {
            background: #1f2937 !important;
            border: 1px solid #eab308 !important;
          }
          .react-flow__controls-button {
            background: #111827 !important;
            border: 1px solid #eab308 !important;
            color: #fbbf24 !important;
          }
          .react-flow__controls-button:hover {
            background: #374151 !important;
            color: #fcd34d !important;
          }
          .react-flow__background {
            background-color: #000000 !important;
          }
        `}</style>
      </div>
  );
}
