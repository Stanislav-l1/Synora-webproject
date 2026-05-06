'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useDragControls,
  useMotionValue,
} from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  FolderKanban,
  CalendarDays,
  Inbox,
  Bookmark,
  CircleUser,
  Plus,
  GripHorizontal,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useChatStore } from '@/store/useChatStore';
import { useNotificationStore } from '@/store/useNotificationStore';

type DockItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: 'chat' | 'notifications';
};

export function FloatingDock() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const t = useT();
  const [hovered, setHovered] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const chats = useChatStore((s) => s.chats);
  const chatUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const notifUnread = useNotificationStore((s) => s.unreadCount);

  const items: DockItem[] = [
    { icon: LayoutDashboard, label: t.nav.home,      path: '/feed',     badge: 'notifications' },
    { icon: Compass,         label: t.nav.explore,   path: '/search' },
    { icon: FolderKanban,    label: t.nav.projects,  path: '/projects' },
    { icon: CalendarDays,    label: 'Calendar',      path: '/calendar' },
    { icon: Inbox,           label: t.nav.messages,  path: '/messages', badge: 'chat' },
    { icon: Bookmark,        label: t.nav.bookmarks, path: '/saved' },
    { icon: CircleUser,      label: t.nav.profile,   path: '/profile' },
  ];

  const isActive = (p: string) =>
    pathname === p || (p !== '/' && pathname.startsWith(p + '/'));

  const navigateTo = (p: string) => {
    if (!isDragging) router.push(p);
  };

  return (
    <>
      {/* Invisible full-viewport drag boundary */}
      <div
        ref={constraintsRef}
        className="hidden lg:block fixed inset-0 pointer-events-none"
        style={{ zIndex: 49 }}
      />

      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={constraintsRef}
        style={{
          x,
          y,
          zIndex: 50,
          position: 'fixed',
          bottom: 24,
          left: '50%',
          translateX: '-50%',
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="hidden lg:block"
      >
        <div
          className="flex flex-row items-center gap-1 px-2 py-2 rounded-2xl select-none border border-white/12 shadow-2xl backdrop-blur-xl"
          style={{
            background: 'rgba(27, 46, 36, 0.55)',
            boxShadow:
              '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          {/* Drag handle */}
          <motion.div
            onPointerDown={(e) => {
              e.preventDefault();
              dragControls.start(e);
            }}
            className="flex items-center justify-center w-6 h-8 rounded-lg cursor-grab active:cursor-grabbing mr-0.5 shrink-0 text-cloud/30 hover:text-cloud/60 hover:bg-white/5"
            style={{ touchAction: 'none' }}
            title="Drag"
          >
            <GripHorizontal size={14} />
          </motion.div>

          {/* Nav items */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                className="flex flex-row items-center gap-1 overflow-hidden"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                {items.map((item) => {
                  const active = isActive(item.path);
                  const badge =
                    item.badge === 'chat'
                      ? chatUnread
                      : item.badge === 'notifications'
                      ? notifUnread
                      : 0;
                  return (
                    <div
                      key={item.path}
                      className="relative"
                      onMouseEnter={() => setHovered(item.label)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <AnimatePresence>
                        {hovered === item.label && !isDragging && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none border border-white/10 text-cloud/90 text-[11px] font-medium shadow-lg"
                            style={{ background: 'rgba(20,34,29,0.97)', zIndex: 60 }}
                          >
                            {item.label}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.16, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigateTo(item.path)}
                        aria-label={item.label}
                        className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                        style={{
                          color: active ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                          background: active ? 'rgba(93,16,73,0.78)' : 'transparent',
                          transition: 'background 0.2s, color 0.2s',
                        }}
                      >
                        <item.icon size={17} />
                        {badge > 0 && (
                          <span
                            className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-cloud bg-banana"
                            style={{ zIndex: 2 }}
                          >
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </motion.button>
                    </div>
                  );
                })}

                <div
                  className="h-6 mx-0.5 rounded-full shrink-0"
                  style={{ width: 1, background: 'rgba(255,255,255,0.12)' }}
                />

                {/* Plus / Create */}
                <div
                  className="relative"
                  onMouseEnter={() => setHovered('create')}
                  onMouseLeave={() => setHovered(null)}
                >
                  <AnimatePresence>
                    {hovered === 'create' && !isDragging && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none border border-white/10 text-cloud/90 text-[11px] font-medium shadow-lg"
                        style={{ background: 'rgba(20,34,29,0.97)', zIndex: 60 }}
                      >
                        {t.common.create}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.16, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateTo('/feed')}
                    aria-label={t.common.create}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-cloud/85 border border-tyrian-glow/35"
                    style={{ background: 'rgba(93,16,73,0.55)' }}
                  >
                    <Plus size={17} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="h-5 rounded-full shrink-0 ml-0.5"
            style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}
          />

          {/* Collapse / expand */}
          <motion.button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            whileTap={{ scale: 0.88 }}
            aria-label={collapsed ? 'Expand dock' : 'Collapse dock'}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-0.5 text-cloud/35 hover:text-cloud/80 hover:bg-white/10 transition-colors"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
