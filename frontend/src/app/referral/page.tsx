'use client';

import { useState } from 'react';
import {
  Gift, Copy, Check, Share2, Users, Zap, Trophy,
  Twitter, Link2, Mail, ChevronRight, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const REFERRAL_CODE = 'SYNORA-DEV-X9K2';
const REFERRAL_URL = `https://synora.io/join?ref=${REFERRAL_CODE}`;

const HISTORY = [
  { id: '1', name: 'David Kim', email: 'd.kim@github.com', status: 'joined', date: 'May 2, 2026', points: 25 },
  { id: '2', name: 'Emma Wilson', email: 'emma@dev.io', status: 'joined', date: 'Apr 28, 2026', points: 25 },
  { id: '3', name: 'Raj Patel', email: 'raj.p@linkedin.com', status: 'pending', date: 'May 4, 2026', points: 0 },
  { id: '4', name: 'Nina Kovacs', email: 'n.kovacs@dev.io', status: 'joined', date: 'Apr 15, 2026', points: 25 },
  { id: '5', name: 'Tom Bradley', email: 'tom@github.com', status: 'pending', date: 'May 5, 2026', points: 0 },
];

const TIERS = [
  { label: 'Starter',    req: '1 friend',  reward: 'Referral badge',          icon: '🎯', threshold: 1,  color: 'from-zinc-400 to-zinc-500' },
  { label: 'Connector',  req: '5 friends', reward: '250 bonus points',         icon: '🔗', threshold: 5,  color: 'from-blue-400 to-blue-600' },
  { label: 'Ambassador', req: '10 friends',reward: '600 pts + Pro badge',      icon: '⭐', threshold: 10, color: 'from-purple-400 to-purple-600' },
  { label: 'Champion',   req: '25 friends',reward: '1500 pts + 1 month Pro',   icon: '🏆', threshold: 25, color: 'from-yellow-400 to-orange-500' },
];

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const joinedCount = HISTORY.filter((h) => h.status === 'joined').length;
  const totalPoints = HISTORY.filter((h) => h.status === 'joined').reduce((acc, h) => acc + h.points, 0);

  function handleCopy() {
    navigator.clipboard.writeText(REFERRAL_URL).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentTier = TIERS.filter((t) => t.threshold <= joinedCount).at(-1);
  const nextTier = TIERS.find((t) => t.threshold > joinedCount);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Gift size={18} className="text-tyrian" />
          <h1 className="text-xl font-bold text-cloud-ink">Invite &amp; Earn</h1>
        </div>
        <p className="text-sm text-cloud-muted">Share Synora with your network and earn rewards together</p>
      </div>

      {/* Referral code card */}
      <div className="bg-gradient-to-br from-tyrian/20 via-tyrian/10 to-transparent border border-tyrian/30 rounded-2xl p-6">
        <p className="text-xs font-semibold text-tyrian uppercase tracking-wide mb-3">Your referral link</p>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-white/80 border border-cloud-deep rounded-xl px-4 py-2.5 font-mono text-sm text-cloud-ink truncate">
            {REFERRAL_URL}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0',
              copied
                ? 'bg-green-500 text-white'
                : 'bg-tyrian text-cloud hover:bg-tyrian/90',
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-cloud-muted mr-1">Share via:</span>
          {[
            { icon: <Twitter size={14} />, label: 'Twitter',  color: 'hover:bg-sky-500/10 hover:text-sky-600 hover:border-sky-300' },
            { icon: <Mail size={14} />,    label: 'Email',    color: 'hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-300' },
            { icon: <Link2 size={14} />,   label: 'Copy URL', color: 'hover:bg-tyrian/10 hover:text-tyrian hover:border-tyrian/40' },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.label === 'Copy URL' ? handleCopy : undefined}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cloud-deep text-cloud-muted text-xs font-medium transition-all',
                btn.color,
              )}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Invites sent', value: HISTORY.length, icon: <Share2 size={16} className="text-tyrian" /> },
          { label: 'Friends joined', value: joinedCount, icon: <Users size={16} className="text-green-500" /> },
          { label: 'Points earned', value: `${totalPoints} pts`, icon: <Zap size={16} className="text-yellow-500" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-cloud border border-cloud-deep rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className="text-xl font-bold text-cloud-ink">{stat.value}</p>
            <p className="text-xs text-cloud-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-cloud border border-cloud-deep rounded-xl p-5">
        <h3 className="text-sm font-semibold text-cloud-ink mb-4">How it works</h3>
        <div className="flex items-start gap-0">
          {[
            { step: '1', text: 'Share your unique referral link', icon: <Link2 size={15} className="text-tyrian" /> },
            { step: '2', text: 'Your friend signs up on Synora', icon: <Users size={15} className="text-tyrian" /> },
            { step: '3', text: 'Both of you earn bonus points', icon: <Zap size={15} className="text-tyrian" /> },
          ].map((item, i) => (
            <div key={item.step} className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-tyrian/10 border-2 border-tyrian/30 flex items-center justify-center mb-2">
                {item.icon}
              </div>
              <p className="text-xs text-cloud-muted text-center leading-snug px-1">{item.text}</p>
              {i < 2 && <div className="absolute translate-x-full -mt-5 text-cloud-muted hidden" />}
            </div>
          ))}
        </div>
      </div>

      {/* Reward tiers */}
      <div>
        <h3 className="text-sm font-semibold text-cloud-ink mb-3">Reward tiers</h3>
        <div className="grid grid-cols-2 gap-3">
          {TIERS.map((tier) => {
            const achieved = joinedCount >= tier.threshold;
            return (
              <div
                key={tier.label}
                className={cn(
                  'rounded-xl p-4 border transition-all',
                  achieved
                    ? 'border-tyrian/40 bg-tyrian/5'
                    : 'border-cloud-deep bg-cloud',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tier.icon}</span>
                  {achieved && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-md">UNLOCKED</span>}
                </div>
                <p className="font-semibold text-cloud-ink text-sm">{tier.label}</p>
                <p className="text-xs text-cloud-muted">{tier.req}</p>
                <p className="text-xs text-tyrian font-medium mt-1">{tier.reward}</p>
              </div>
            );
          })}
        </div>
        {nextTier && (
          <div className="mt-3 p-3 bg-cloud-deep/50 rounded-xl flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-cloud-muted">Next tier: <span className="font-semibold text-cloud-ink">{nextTier.label}</span></p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 bg-cloud-deep rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-tyrian"
                    style={{ width: `${Math.min(100, (joinedCount / nextTier.threshold) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-cloud-muted shrink-0">{joinedCount}/{nextTier.threshold}</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-cloud-muted" />
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-cloud-ink mb-3">Recent referrals</h3>
        {HISTORY.length === 0 ? (
          <p className="text-sm text-cloud-muted text-center py-8">No referrals yet — share your link!</p>
        ) : (
          <div className="bg-cloud border border-cloud-deep rounded-xl overflow-hidden">
            {HISTORY.map((h, i) => (
              <div
                key={h.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  i < HISTORY.length - 1 && 'border-b border-cloud-deep',
                )}
              >
                <div className="w-8 h-8 rounded-full bg-tyrian/10 flex items-center justify-center text-sm font-semibold text-tyrian shrink-0">
                  {h.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cloud-ink truncate">{h.name}</p>
                  <p className="text-xs text-cloud-muted">{h.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={cn(
                      'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                      h.status === 'joined'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700',
                    )}
                  >
                    {h.status === 'joined' ? '✓ Joined' : '⏳ Pending'}
                  </span>
                  {h.points > 0 && (
                    <p className="text-[10px] text-tyrian font-medium mt-0.5">+{h.points} pts</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
