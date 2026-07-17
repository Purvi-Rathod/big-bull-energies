'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';

interface BinaryTreeInfo {
  parent: {
    id: string;
    userId: string;
    name: string;
  } | null;
  treeParent?: {
    id: string;
    userId: string;
    name: string;
  } | null; // Optional: actual binary tree placement parent (may differ from referrer)
  leftChild: {
    id: string;
    userId: string;
    name: string;
  } | null;
  rightChild: {
    id: string;
    userId: string;
    name: string;
  } | null;
  leftBusiness: number;
  rightBusiness: number;
  leftCarry: number;
  rightCarry: number;
  leftDownlines: number;
  rightDownlines: number;
}

export default function BinaryPage() {
  const { user } = useAuth();
  const [binaryTree, setBinaryTree] = useState<BinaryTreeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in development)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    fetchBinaryTree();

    // No cleanup - we want to prevent duplicate calls even on remount
  }, []);

  const fetchBinaryTree = async () => {
    try {
      setLoading(true);
      const response = await api.getUserBinaryTree();
      if (response.data) {
        setBinaryTree(response.data.binaryTree);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load binary tree information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BigBullLoader fullScreen />;
  }

  if (!binaryTree) {
    return (
      <div className="flex items-center justify-center py-12 bg-black min-h-screen">
          <div className="text-center">
            <p className="text-white/55 text-lg">Binary tree information not found</p>
          </div>
        </div>
    );
  }

  const minBusiness = Math.min(binaryTree.leftBusiness, binaryTree.rightBusiness);
  const binaryBonus = minBusiness * 0.1;
  const totalDownlines = binaryTree.leftDownlines + binaryTree.rightDownlines;

  return (
        <div className="w-full min-h-screen py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="fixed inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FBF676]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FBF676]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="px-4 py-6 sm:px-0">
            {/* Business Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="group relative rounded-2xl shadow-2xl border-2 border-[#FBF676]/35 backdrop-blur-md bg-[rgba(251,246,118,0.12)] p-6 hover:border-[#FBF676]/60 hover:shadow-[#FBF676]/25 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A6B]/0 via-[#05627C]/0 to-[#05627C]/0 group-hover:from-[#0C1A6B]/10 group-hover:via-[#05627C]/15 group-hover:to-[#FBF676]/5 transition-all duration-500"></div>                <div className="relative z-10">
                  <p className="text-sm text-white/75 font-semibold mb-3">Left Business</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">${binaryTree.leftBusiness.toFixed(2)}</p>
                </div>
              </div>
              <div className="group relative rounded-2xl shadow-2xl border-2 border-[#FBF676]/35 backdrop-blur-md bg-[rgba(251,246,118,0.12)] p-6 hover:border-[#FBF676]/60 hover:shadow-[#FBF676]/25 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A6B]/0 via-[#05627C]/0 to-[#05627C]/0 group-hover:from-[#0C1A6B]/10 group-hover:via-[#05627C]/15 group-hover:to-[#FBF676]/5 transition-all duration-500"></div>                <div className="relative z-10">
                  <p className="text-sm text-white/75 font-semibold mb-3">Right Business</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">${binaryTree.rightBusiness.toFixed(2)}</p>
                </div>
              </div>
              <div className="group relative rounded-2xl shadow-2xl border-2 border-[#FBF676]/40 backdrop-blur-md bg-[rgba(251,246,118,0.15)] p-6 hover:border-[#FBF676]/60 hover:shadow-[#FBF676]/30 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A6B]/0 via-[#05627C]/0 to-[#05627C]/0 group-hover:from-[#0C1A6B]/10 group-hover:via-[#05627C]/15 group-hover:to-[#FBF676]/5 transition-all duration-500"></div>                <div className="relative z-10">
                  <p className="text-sm text-white font-semibold mb-3">Binary Bonus</p>
                  <p className="text-4xl font-extrabold text-[#FBF676]">${binaryBonus.toFixed(2)}</p>
                  <p className="text-xs text-yellow-300 mt-2 font-semibold">10% of minimum</p>
                </div>
              </div>
              <div className="group relative rounded-2xl shadow-2xl border-2 border-[#FBF676]/35 backdrop-blur-md bg-[rgba(251,246,118,0.12)] p-6 hover:border-[#FBF676]/60 hover:shadow-[#FBF676]/25 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A6B]/0 via-[#05627C]/0 to-[#05627C]/0 group-hover:from-[#0C1A6B]/10 group-hover:via-[#05627C]/15 group-hover:to-[#FBF676]/5 transition-all duration-500"></div>                <div className="relative z-10">
                  <p className="text-sm text-white/75 font-semibold mb-3">Total Downlines</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">{totalDownlines}</p>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Business Details */}
              <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-8">
                <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#FBF676] to-[#e8e04a] rounded"></span>
                  Business Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-[rgba(251,246,118,0.12)] rounded-xl border border-[#FBF676]/25 hover:border-[#FBF676]/50 transition-all">
                    <div>
                      <p className="font-bold text-white/85">Left Business</p>
                      <p className="text-sm text-white/55 mt-1">Total business from left leg</p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#FBF676]">${binaryTree.leftBusiness.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-[rgba(251,246,118,0.12)] rounded-xl border border-[#FBF676]/25 hover:border-[#FBF676]/50 transition-all">
                    <div>
                      <p className="font-bold text-white/85">Right Business</p>
                      <p className="text-sm text-white/55 mt-1">Total business from right leg</p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#FBF676]">${binaryTree.rightBusiness.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-[rgba(251,246,118,0.12)] rounded-xl border-2 border-[#FBF676]/35 hover:border-[#FBF676]/60 transition-all">
                    <div>
                      <p className="font-bold text-white">Minimum Business</p>
                      <p className="text-sm text-white/75 mt-1">Used for binary bonus calculation</p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#FBF676]">${minBusiness.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-gradient-to-r from-yellow-500/30 via-yellow-600/20 to-yellow-500/30 rounded-xl border-2 border-[#FBF676]/50 shadow-lg shadow-[#FBF676]/25 hover:shadow-[#FBF676]/25 transition-all">
                    <div>
                      <p className="font-extrabold text-white text-lg">Binary Bonus (10%)</p>
                      <p className="text-sm text-yellow-200 mt-1">Earned from matching business</p>
                    </div>
                    <p className="text-3xl font-extrabold text-[#FBF676]">${binaryBonus.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Carry Forward & Downlines */}
              <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-8">
                <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#FBF676] to-[#e8e04a] rounded"></span>
                  Carry Forward & Downlines
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl border border-gray-700/50 hover:border-[#FBF676]/25 transition-all">
                    <div>
                      <p className="font-bold text-white/85">Left Carry</p>
                      <p className="text-sm text-white/55 mt-1">Excess from left leg</p>
                    </div>
                    <p className="text-2xl font-extrabold text-white">${binaryTree.leftCarry.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl border border-gray-700/50 hover:border-[#FBF676]/25 transition-all">
                    <div>
                      <p className="font-bold text-white/85">Right Carry</p>
                      <p className="text-sm text-white/55 mt-1">Excess from right leg</p>
                    </div>
                    <p className="text-2xl font-extrabold text-white">${binaryTree.rightCarry.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-[rgba(251,246,118,0.12)] rounded-xl border border-[#FBF676]/25 hover:border-[#FBF676]/50 transition-all">
                    <div>
                      <p className="font-bold text-white/85">Left Downlines</p>
                      <p className="text-sm text-white/55 mt-1">Users in left leg</p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#FBF676]">{binaryTree.leftDownlines}</p>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-[rgba(251,246,118,0.12)] rounded-xl border border-[#FBF676]/25 hover:border-[#FBF676]/50 transition-all">
                    <div>
                      <p className="font-bold text-white/85">Right Downlines</p>
                      <p className="text-sm text-white/55 mt-1">Users in right leg</p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#FBF676]">{binaryTree.rightDownlines}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tree Connections */}
            {(binaryTree.parent || binaryTree.leftChild || binaryTree.rightChild) && (
              <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 backdrop-blur-md bg-[rgba(8,16,40,0.75)] p-8">
                <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#FBF676] to-[#e8e04a] rounded"></span>
                  Tree Connections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {binaryTree.parent && (
                    <div className="p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 rounded-xl border border-[#FBF676]/40 hover:border-[#FBF676]/60 hover:shadow-lg hover:shadow-[#FBF676]/20 transition-all">
                      <p className="text-xs text-white/55 mb-2 uppercase tracking-wider font-bold">Parent (Sponsor)</p>
                      <p className="font-extrabold text-white text-lg">{binaryTree.parent.name}</p>
                      <p className="text-sm text-[#FBF676] font-mono font-semibold mt-1">{binaryTree.parent.userId}</p>
                    </div>
                  )}
                  {binaryTree.leftChild && (
                    <div className="p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 rounded-xl border border-[#FBF676]/40 hover:border-[#FBF676]/60 hover:shadow-lg hover:shadow-[#FBF676]/20 transition-all">
                      <p className="text-xs text-white/55 mb-2 uppercase tracking-wider font-bold">Left Child</p>
                      <p className="font-extrabold text-white text-lg">{binaryTree.leftChild.name}</p>
                      <p className="text-sm text-[#FBF676] font-mono font-semibold mt-1">{binaryTree.leftChild.userId}</p>
                    </div>
                  )}
                  {binaryTree.rightChild && (
                    <div className="p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 rounded-xl border border-[#FBF676]/40 hover:border-[#FBF676]/60 hover:shadow-lg hover:shadow-[#FBF676]/20 transition-all">
                      <p className="text-xs text-white/55 mb-2 uppercase tracking-wider font-bold">Right Child</p>
                      <p className="font-extrabold text-white text-lg">{binaryTree.rightChild.name}</p>
                      <p className="text-sm text-[#FBF676] font-mono font-semibold mt-1">{binaryTree.rightChild.userId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
  );
}

