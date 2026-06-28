import React from 'react';
import { LeaderboardEntry, Quest, UserProfile } from '../types';
import { Trophy, Medal, Star, ShieldCheck, Flame, CircleDot, Sparkles, Sword } from 'lucide-react';

interface LeaderboardTabProps {
  userProfile: UserProfile;
  quests: Quest[];
  leaderboard: LeaderboardEntry[];
}

export default function LeaderboardTab({ userProfile, quests, leaderboard }: LeaderboardTabProps) {
  // Predefined badge definitions with visual representations
  const badgeMeta: Record<string, { title: string; desc: string; icon: string; color: string; border: string }> = {
    'Road Patrol': {
      title: 'Road Patrol',
      desc: 'Logged or verified 5+ road hazard cave-ins or sidewalk cracks.',
      icon: '🚧',
      color: 'bg-red-500/10 text-red-400',
      border: 'border-red-500/35'
    },
    'Streetlight Scout': {
      title: 'Streetlight Scout',
      desc: 'Shed light on dark pathways by flagging 3+ damaged streetlight networks.',
      icon: '💡',
      color: 'bg-amber-500/10 text-amber-400',
      border: 'border-amber-500/35'
    },
    'Aqua Sentinel': {
      title: 'Aqua Sentinel',
      desc: 'Prevented urban flooding and water wastage by reporting cracked valves.',
      icon: '💧',
      color: 'bg-blue-500/10 text-blue-400',
      border: 'border-blue-500/35'
    },
    'Eco-Warrior': {
      title: 'Eco-Warrior',
      desc: 'Maintained district aesthetics by resolving public trash dumping.',
      icon: '🌿',
      color: 'bg-emerald-500/10 text-emerald-400',
      border: 'border-emerald-500/35'
    },
    'Community Pillar': {
      title: 'Community Pillar',
      desc: 'Gained 10+ verifications and comments on reported infrastructure updates.',
      icon: '🏛️',
      color: 'bg-purple-500/10 text-purple-400',
      border: 'border-purple-500/35'
    }
  };

  // Calculate XP threshold for next level (Level 4 -> 5 requires e.g., 2000 XP)
  const currentLevelXpFloor = (userProfile.level - 1) * 500;
  const nextLevelXpCeil = userProfile.level * 500;
  const levelProgressXp = userProfile.xp - currentLevelXpFloor;
  const levelTargetXp = nextLevelXpCeil - currentLevelXpFloor;
  const progressPercent = Math.min(Math.round((levelProgressXp / levelTargetXp) * 100), 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-200" id="leaderboard-tab-container">
      {/* Left Columns: Profile, Badges, and Quests */}
      <div className="lg:col-span-2 space-y-6">
        {/* User Progression Hub */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          {/* Decorative subtle visual */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-xl shadow-inner select-none relative">
                <span>👤</span>
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-slate-900">
                  {userProfile.level}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400" />
                  <span>Citizen Contributor Status</span>
                </span>
                <h3 className="font-bold text-white text-base tracking-tight">{userProfile.name}</h3>
                <p className="text-[10px] text-slate-400 font-sans">
                  Total Impact Rating: <strong className="text-slate-200">{userProfile.xp} XP</strong>
                </p>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="w-full sm:w-48 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>LEVEL PROGRESS</span>
                <span>{userProfile.xp}/{nextLevelXpCeil} XP</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850 p-0.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-500 text-right italic font-mono">
                {nextLevelXpCeil - userProfile.xp} XP until Level {userProfile.level + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Earned Achievements (Badges) */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Community Achievements ({userProfile.badges.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(badgeMeta).map((key) => {
              const b = badgeMeta[key];
              const isEarned = userProfile.badges.includes(key);
              
              return (
                <div
                  key={key}
                  className={`p-3.5 rounded-xl border flex gap-3.5 items-start transition-all ${
                    isEarned 
                      ? `${b.color} ${b.border} opacity-100 shadow-sm` 
                      : 'bg-slate-950/20 border-slate-850 opacity-40 grayscale'
                  }`}
                >
                  <div className="text-2xl p-1 bg-slate-950/60 rounded-lg border border-slate-850 shadow-inner select-none shrink-0">
                    {b.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-200 leading-none">{b.title}</h4>
                      {isEarned && (
                        <span className="text-[8px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-semibold">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Quests Board */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display flex items-center gap-1.5">
            <Sword className="w-4 h-4 text-emerald-400" />
            <span>Active District Quests</span>
          </h3>

          <div className="space-y-3">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  quest.completed
                    ? 'bg-emerald-950/5 border-emerald-500/10 text-slate-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-750 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border select-none ${
                    quest.completed ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-slate-950 border-slate-850 shadow-inner'
                  }`}>
                    {quest.completed ? '✓' : quest.icon}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${quest.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {quest.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-sans">{quest.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    quest.completed 
                      ? 'bg-slate-950 border-slate-850 text-slate-600' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse'
                  }`}>
                    +{quest.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Leaderboard Top Contributors */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg h-full space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-display flex items-center gap-1.5">
              <Trophy className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10" />
              <span>Neighbor Hero Board</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              Earn status by reporting hazards, coordinating solutions, and upvoting valid issues nearby.
            </p>
          </div>

          <div className="space-y-3">
            {leaderboard.map((hero) => {
              const isCurrentUser = hero.name === userProfile.name;
              
              return (
                <div
                  key={hero.rank}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isCurrentUser
                      ? 'bg-emerald-500/5 border-emerald-500/25 shadow-sm'
                      : 'bg-slate-950/30 border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Rank number or medal */}
                    <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs text-slate-400 select-none shrink-0 font-bold">
                      {hero.rank === 1 ? '🥇' : hero.rank === 2 ? '🥈' : hero.rank === 3 ? '🥉' : hero.rank}
                    </div>

                    {/* Avatar circle */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs shrink-0 select-none"
                      style={{ backgroundColor: hero.avatarColor }}
                    >
                      {hero.name.charAt(0)}
                    </div>

                    {/* Username detail */}
                    <div>
                      <h4 className={`text-xs font-bold leading-none ${isCurrentUser ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {hero.name} {isCurrentUser && '(You)'}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-mono">
                        Level {hero.level} • {hero.badgesCount} Badges
                      </p>
                    </div>
                  </div>

                  {/* Impact XP rating */}
                  <div className="text-right font-mono text-xs font-bold text-slate-300">
                    {hero.xp} <span className="text-[8px] text-slate-500 font-semibold font-sans">XP</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 text-[10px] text-slate-500 leading-relaxed italic text-center">
            *Ranking resets monthly. Next leaderboard compilation in 7 days.
          </div>
        </div>
      </div>
    </div>
  );
}
