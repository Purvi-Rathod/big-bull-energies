'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import SupportChatBot from '@/components/SupportChatBot';

/**
 * Renders WhatsApp and AI support chatbot only for non-admin users.
 * Hidden on admin pages (by route and when logged in as admin).
 */
export default function SupportFloatingButtons() {
  const pathname = usePathname();
  const { admin } = useAuth();
  const isAdminPage = pathname?.startsWith('/admin');
  if (admin || isAdminPage) return null;
  return (
    <>
      <WhatsAppButton />
      <SupportChatBot />
    </>
  );
}
