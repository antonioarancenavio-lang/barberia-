'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Toast = { id: number; text: string };

export function NotificationBell({ barbershopId }: { barbershopId: string }) {
  const supabase = createClient();
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('appointments-' + barbershopId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: 'barbershop_id=eq.' + barbershopId,
        },
        (payload) => {
          const row: any = payload.new;
          setUnread((n) => n + 1);
          const id = Date.now();
          const text = 'Nueva cita: ' + row.client_name;
          setToasts((prev) => [...prev, { id, text }]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbershopId]);

  function toggleOpen() {
    setOpen((v) => !v);
    if (!open) setUnread(0);
  }

  return (
    <>
      <button onClick={toggleOpen} aria-label="Notificaciones" className="notif-bell">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      <div className="notif-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className="notif-toast">
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
