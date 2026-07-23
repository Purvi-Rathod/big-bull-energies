'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

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
  } | null;
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
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchBinaryTree();
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
    return <BigBullLoader text="Loading binary tree…" />;
  }

  if (!binaryTree) {
    return (
      <div className={t.page}>
        <div className={t.cardEmpty}>
          <p className="text-lg font-medium" style={{ color: t.muted }}>
            Binary tree information not found
          </p>
        </div>
      </div>
    );
  }

  const minBusiness = Math.min(binaryTree.leftBusiness, binaryTree.rightBusiness);
  const binaryBonus = minBusiness * 0.1;
  const totalDownlines = binaryTree.leftDownlines + binaryTree.rightDownlines;

  return (
    <div className={t.page}>
      <div>
        <h1 className={t.title}>Binary Tree</h1>
        <p className={t.subtitle}>Your binary business overview and leg statistics</p>
      </div>

      {error && <div className={t.error}>{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className={t.card}>
          <p className="text-sm font-semibold mb-2" style={{ color: t.muted }}>Left Business</p>
          <p className="text-3xl font-extrabold" style={{ color: t.ink }}>${binaryTree.leftBusiness.toFixed(2)}</p>
        </div>
        <div className={t.card}>
          <p className="text-sm font-semibold mb-2" style={{ color: t.muted }}>Right Business</p>
          <p className="text-3xl font-extrabold" style={{ color: t.ink }}>${binaryTree.rightBusiness.toFixed(2)}</p>
        </div>
        <div className={`${t.card} border-[rgba(245,207,11,0.45)] bg-[#FFF9E6]`}>
          <p className="text-sm font-semibold mb-2" style={{ color: t.muted }}>Binary Bonus</p>
          <p className="text-3xl font-extrabold" style={{ color: t.primary }}>${binaryBonus.toFixed(2)}</p>
          <p className="text-xs font-semibold mt-1" style={{ color: t.muted }}>10% of minimum</p>
        </div>
        <div className={t.card}>
          <p className="text-sm font-semibold mb-2" style={{ color: t.muted }}>Total Downlines</p>
          <p className="text-3xl font-extrabold" style={{ color: t.ink }}>{totalDownlines}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={t.card}>
          <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
            <span className={t.accentBar} style={t.accentBarStyle} />
            Business Details
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Left Business', sub: 'Total business from left leg', value: `$${binaryTree.leftBusiness.toFixed(2)}` },
              { label: 'Right Business', sub: 'Total business from right leg', value: `$${binaryTree.rightBusiness.toFixed(2)}` },
              { label: 'Minimum Business', sub: 'Used for binary bonus calculation', value: `$${minBusiness.toFixed(2)}`, highlight: true },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between items-center p-4 rounded-xl ${row.highlight ? t.cardHighlight : t.cardInner}`}>
                <div>
                  <p className="font-bold" style={{ color: t.ink }}>{row.label}</p>
                  <p className="text-sm mt-0.5" style={{ color: t.muted }}>{row.sub}</p>
                </div>
                <p className="text-xl font-extrabold" style={{ color: t.primary }}>{row.value}</p>
              </div>
            ))}
            <div className={`flex justify-between items-center p-4 rounded-xl ${t.cardHighlight}`}>
              <div>
                <p className="font-extrabold text-lg" style={{ color: t.ink }}>Binary Bonus (10%)</p>
                <p className="text-sm mt-0.5" style={{ color: t.muted }}>Earned from matching business</p>
              </div>
              <p className="text-2xl font-extrabold" style={{ color: t.primary }}>${binaryBonus.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className={t.card}>
          <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
            <span className={t.accentBar} style={t.accentBarStyle} />
            Carry Forward & Downlines
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Left Carry', sub: 'Excess from left leg', value: `$${binaryTree.leftCarry.toFixed(2)}` },
              { label: 'Right Carry', sub: 'Excess from right leg', value: `$${binaryTree.rightCarry.toFixed(2)}` },
              { label: 'Left Downlines', sub: 'Users in left leg', value: String(binaryTree.leftDownlines), accent: true },
              { label: 'Right Downlines', sub: 'Users in right leg', value: String(binaryTree.rightDownlines), accent: true },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between items-center p-4 rounded-xl ${row.accent ? t.cardHighlight : t.cardInner}`}>
                <div>
                  <p className="font-bold" style={{ color: t.ink }}>{row.label}</p>
                  <p className="text-sm mt-0.5" style={{ color: t.muted }}>{row.sub}</p>
                </div>
                <p className="text-xl font-extrabold" style={{ color: row.accent ? t.primary : t.ink }}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(binaryTree.parent || binaryTree.leftChild || binaryTree.rightChild) && (
        <div className={t.card}>
          <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
            <span className={t.accentBar} style={t.accentBarStyle} />
            Tree Connections
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {binaryTree.parent && (
              <div className={`${t.cardInner} p-4`}>
                <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: t.muted }}>Parent (Sponsor)</p>
                <p className="font-extrabold text-lg" style={{ color: t.ink }}>{binaryTree.parent.name}</p>
                <p className="text-sm font-mono font-semibold mt-1" style={{ color: t.primary }}>{binaryTree.parent.userId}</p>
              </div>
            )}
            {binaryTree.leftChild && (
              <div className={`${t.cardInner} p-4`}>
                <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: t.muted }}>Left Child</p>
                <p className="font-extrabold text-lg" style={{ color: t.ink }}>{binaryTree.leftChild.name}</p>
                <p className="text-sm font-mono font-semibold mt-1" style={{ color: t.primary }}>{binaryTree.leftChild.userId}</p>
              </div>
            )}
            {binaryTree.rightChild && (
              <div className={`${t.cardInner} p-4`}>
                <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: t.muted }}>Right Child</p>
                <p className="font-extrabold text-lg" style={{ color: t.ink }}>{binaryTree.rightChild.name}</p>
                <p className="text-sm font-mono font-semibold mt-1" style={{ color: t.primary }}>{binaryTree.rightChild.userId}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
