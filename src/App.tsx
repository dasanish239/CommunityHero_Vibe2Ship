import React, { useEffect, useState } from 'react';
import { CommunityIssue, IssueCategory, IssueSeverity, IssueStatus, Quest, UserProfile, LeaderboardEntry } from './types';
import InteractiveMap from './components/InteractiveMap';
import IssueDetailModal from './components/IssueDetailModal';
import ReportIssueWizard from './components/ReportIssueWizard';
import DistrictMetrics from './components/DistrictMetrics';
import AIInsightsTab from './components/AIInsightsTab';
import LeaderboardTab from './components/LeaderboardTab';
import {
  MapPin,
  Shield,
  Award,
  Sparkles,
  Layers,
  CheckCircle,
  PlusCircle,
  Bell,
  MessageSquare,
  Search,
  Filter,
  BarChart3,
  Flame,
  Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'metrics' | 'ai' | 'leaderboard'>('map');
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  // Filtering states
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reporting location capture states
  const [isPlacingPin, setIsPlacingPin] = useState<boolean>(false);
  const [placementCoords, setPlacementCoords] = useState<{ x: number; y: number } | null>(null);
  const [isReportingSubmitting, setIsReportingSubmitting] = useState<boolean>(false);

  // App notification feed alerts
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Gamification & Session Tracking (Mocked Session in state with dynamic XP up-scaling)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Jenkins',
    xp: 1250,
    level: 3,
    badges: ['Road Patrol', 'Streetlight Scout']
  });

  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'q-1',
      title: 'Verify a Nearby Hazard',
      description: 'Confirm a pending report close to your neighborhood to help municipal dispatch.',
      xp: 100,
      completed: false,
      icon: '🔍'
    },
    {
      id: 'q-2',
      title: 'Lodge a Photo Report',
      description: 'Submit a new infrastructure issue with an attached evidence photo.',
      xp: 250,
      completed: false,
      icon: '📸'
    },
    {
      id: 'q-3',
      title: 'Coordinate a Resolution',
      description: 'Resolve a pending community ticket or add a constructive update log.',
      xp: 150,
      completed: false,
      icon: '🛠️'
    }
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { name: 'Sarah Jenkins', xp: 2450, level: 5, badgesCount: 4, rank: 1, avatarColor: '#f43f5e' },
    { name: 'Marcus Vance', xp: 1980, level: 4, badgesCount: 3, rank: 2, avatarColor: '#3b82f6' },
    { name: 'Alex Jenkins', xp: 1250, level: 3, badgesCount: 2, rank: 3, avatarColor: '#10b981' }, // User
    { name: 'David Kim', xp: 950, level: 2, badgesCount: 1, rank: 4, avatarColor: '#f59e0b' },
    { name: 'Emily Thomas', xp: 820, level: 2, badgesCount: 2, rank: 5, avatarColor: '#8b5cf6' }
  ]);

  // Synchronize issues from full-stack server
  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (err) {
      console.error('Failed to communicate with community database server.', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Show a disappearing top toast alert
  const showToast = (message: string) => {
    setNotificationMsg(message);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Up-scales user level based on earned XP bounds
  const awardXp = (xpAmount: number) => {
    setUserProfile((prev) => {
      const nextXp = prev.xp + xpAmount;
      const nextLevel = Math.floor(nextXp / 500) + 1; // 500 XP per level
      
      if (nextLevel > prev.level) {
        showToast(`🎉 Level Up! You reached Citizen Level ${nextLevel}!`);
      } else {
        showToast(`⭐ Gained +${xpAmount} Contribution XP!`);
      }

      // Update leaderboard entry in-place
      setLeaderboard((prevBoard) => {
        const updated = prevBoard.map((entry) => {
          if (entry.name === prev.name) {
            return {
              ...entry,
              xp: nextXp,
              level: nextLevel
            };
          }
          return entry;
        });
        
        // Re-sort board by XP
        return updated
          .sort((a, b) => b.xp - a.xp)
          .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      });

      return {
        ...prev,
        xp: nextXp,
        level: nextLevel
      };
    });
  };

  // Triggers quest completion and grants rewards
  const completeQuest = (questId: string) => {
    setQuests((prevQuests) => {
      return prevQuests.map((q) => {
        if (q.id === questId && !q.completed) {
          awardXp(q.xp);
          showToast(`🏆 Quest Complete: "${q.title}"! Got +${q.xp} XP`);
          return { ...q, completed: true };
        }
        return q;
      });
    });
  };

  // --- ACTIONS ---

  const handleMapClick = (x: number, y: number) => {
    if (isPlacingPin) {
      setPlacementCoords({ x, y });
      setIsPlacingPin(false);
      showToast(`📍 Coordinates locked at Sector (${x}%, ${y}%). Fill in the report below.`);
    }
  };

  const handleReportSubmitted = async (formData: {
    title: string;
    description: string;
    category: IssueCategory;
    severity: IssueSeverity;
    x: number;
    y: number;
    imageUrl?: string;
    requestAiAnalysis: boolean;
  }) => {
    setIsReportingSubmitting(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reportedBy: userProfile.name
        })
      });

      if (!response.ok) {
        throw new Error('Server declined the reported infrastructure ticket.');
      }

      const newIssue = await response.json();
      setIssues((prev) => [newIssue, ...prev]);
      setPlacementCoords(null);
      setSelectedIssueId(newIssue.id);

      // Reward citizen contribution
      awardXp(120);

      // Complete Daily Quest "Lodge a Photo Report"
      if (formData.imageUrl) {
        completeQuest('q-2');
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsReportingSubmitting(false);
    }
  };

  const handleVote = async (issueId: string, voteType: 'upvote' | 'verify' | 'flag') => {
    try {
      const response = await fetch(`/api/issues/${issueId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteType,
          user: userProfile.name
        })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues((prev) => prev.map(i => i.id === issueId ? updatedIssue : i));
        
        // Give minor interaction points
        if (voteType === 'upvote') {
          awardXp(15);
        } else if (voteType === 'verify') {
          awardXp(35);
          // Complete daily quest "Verify a nearby hazard"
          completeQuest('q-1');
        } else if (voteType === 'flag') {
          showToast('⚠️ Spam flagged. System moderator notified.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (issueId: string, user: string, text: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, text })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues((prev) => prev.map(i => i.id === issueId ? updatedIssue : i));
        awardXp(10);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (
    issueId: string,
    status: IssueStatus,
    message: string,
    author: string,
    imageUrl?: string
  ) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message, author, imageUrl })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues((prev) => prev.map(i => i.id === issueId ? updatedIssue : i));
        
        if (status === 'Resolved') {
          awardXp(150);
          completeQuest('q-3');
          showToast(`💚 Issue resolved! Outstanding job coordinating local repairs.`);
        } else {
          awardXp(50);
          showToast(`📋 Operations status updated to: "${status}".`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Find the currently clicked issue to display in detail drawer
  const selectedIssue = issues.find(i => i.id === selectedIssueId) || null;

  // Filter list of issues showing on left sidebar
  const sidebarFilteredIssues = issues.filter((issue) => {
    const matchesCategory = activeCategoryFilter === 'all' || issue.category === activeCategoryFilter;
    const matchesStatus = activeStatusFilter === 'all' || issue.status === activeStatusFilter;
    const matchesSearch = searchQuery === '' || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root-wrapper">
      {/* Dynamic Top Notification Toast Banner */}
      {notificationMsg && (
        <div
          id="toast-notification"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-400/30 transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 fill-slate-950/20 text-slate-950" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Elegant Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/10">
              <Shield className="w-5 h-5 fill-slate-950/20" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base font-display tracking-tight leading-none">
                Community Hero
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                Hyperlocal Problem Solver
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-900">
            <button
              onClick={() => setActiveTab('map')}
              id="tab-map-trigger"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              The District Grid
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              id="tab-metrics-trigger"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'metrics'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Community Analytics
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              id="tab-ai-trigger"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'ai'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse fill-emerald-400/15" />
              <span>AI Warden Warnings</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              id="tab-leaderboard-trigger"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Leaderboard & Quests
            </button>
          </nav>

          {/* User Widget */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{userProfile.name}</p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <Award className="w-3.5 h-3.5" />
                <span>Level {userProfile.level} ({userProfile.xp} XP)</span>
              </div>
            </div>
            
            {/* Quick-select Mobile Tab Indicator dropdown */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl p-2 font-semibold focus:outline-none"
              >
                <option value="map">Map & Grid</option>
                <option value="metrics">Analytics</option>
                <option value="ai">AI Warden</option>
                <option value="leaderboard">Leaderboard</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: DISTRICT GRID (Interactive Map & Left Reporting panel) */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-start" id="map-tab-layout-grid">
            
            {/* Left Panel: Filter & Lodge Form OR Search */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Filter Widget & Quick Action */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider font-display flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-emerald-400" />
                    <span>Sift Hazards</span>
                  </h3>
                  
                  <button
                    onClick={() => {
                      setIsPlacingPin(true);
                      showToast('📍 Click on the map in the center to drop the location coordinates.');
                    }}
                    id="trigger-pin-placement"
                    className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Lodge Report</span>
                  </button>
                </div>

                {/* Filters Row */}
                <div className="space-y-2 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search descriptions, streets, hazards..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block mb-1">Category</span>
                      <select
                        value={activeCategoryFilter}
                        onChange={(e) => setActiveCategoryFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 focus:outline-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="Roads & Sidewalks">Roads & Sidewalks</option>
                        <option value="Water & Sanitation">Water & Sanitation</option>
                        <option value="Waste Management">Waste Management</option>
                        <option value="Public Lighting">Public Lighting</option>
                        <option value="Parks & Public Spaces">Parks & Public Spaces</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block mb-1">Status</span>
                      <select
                        value={activeStatusFilter}
                        onChange={(e) => setActiveStatusFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Reported">Reported</option>
                        <option value="Verifying">Verifying</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show Wizard if coordinates are being captured or are locked */}
              {(isPlacingPin || placementCoords) ? (
                <div className="relative">
                  <ReportIssueWizard
                    x={placementCoords?.x ?? null}
                    y={placementCoords?.y ?? null}
                    onReportSubmitted={handleReportSubmitted}
                    isSubmitting={isReportingSubmitting}
                  />
                  <button
                    onClick={() => {
                      setPlacementCoords(null);
                      setIsPlacingPin(false);
                    }}
                    className="absolute top-4 right-4 text-xs text-slate-500 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Else, show the active lists card feed */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Active District Log ({sidebarFilteredIssues.length})
                    </span>
                    {issues.length > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {Math.round((issues.filter(i => i.status === 'Resolved').length / issues.length) * 100)}% Responded
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {sidebarFilteredIssues.length === 0 ? (
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-2 border-dashed">
                        <Info className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs font-semibold text-slate-400">No matching issues</p>
                        <p className="text-[11px] text-slate-600 max-w-xs mx-auto font-sans leading-relaxed">
                          Try resetting filters or lodge a new community report to populate the registry.
                        </p>
                      </div>
                    ) : (
                      sidebarFilteredIssues.map((issue) => {
                        const isSelected = selectedIssueId === issue.id;
                        
                        return (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                            id={`issue-sidebar-card-${issue.id}`}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                              isSelected
                                ? 'bg-slate-900 border-emerald-500/40 shadow-emerald-500/5 shadow-md'
                                : 'bg-slate-900 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-xs text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {issue.title}
                              </h4>
                              
                              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${
                                issue.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/15 animate-pulse' :
                                issue.severity === 'high' ? 'bg-orange-500/10 text-orange-400' :
                                issue.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-950 text-slate-400'
                              }`}>
                                {issue.severity}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 font-sans leading-relaxed">
                              {issue.description}
                            </p>

                            <div className="flex justify-between items-center text-[10px] font-mono mt-3 pt-2.5 border-t border-slate-850">
                              <span className="text-slate-500">{issue.category}</span>
                              <div className="flex gap-2 items-center">
                                <span className="text-slate-500">Votes: <strong>{issue.upvotes}</strong></span>
                                <span className={`w-2 h-2 rounded-full ${
                                  issue.status === 'Resolved' ? 'bg-emerald-500' :
                                  issue.status === 'In Progress' ? 'bg-purple-500' :
                                  issue.status === 'Scheduled' ? 'bg-amber-500' : 'bg-slate-500'
                                }`} />
                                <span className="text-slate-300">{issue.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Center Panel: Large Interactive Map & Slide detail drawer */}
            <div className={`xl:col-span-8 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full`}>
              
              <div className={`${selectedIssue ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
                <InteractiveMap
                  issues={issues}
                  selectedIssueId={selectedIssueId}
                  onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                  isPlacingPin={isPlacingPin}
                  placementCoords={placementCoords}
                  onMapClick={handleMapClick}
                  activeCategoryFilter={activeCategoryFilter}
                  activeStatusFilter={activeStatusFilter}
                />
              </div>

              {/* Right Panel side drawer: Selected Issue Details */}
              {selectedIssue && (
                <div className="lg:col-span-5 h-full animate-fade-in">
                  <IssueDetailModal
                    issue={selectedIssue}
                    onClose={() => setSelectedIssueId(null)}
                    onVote={handleVote}
                    onAddComment={handleAddComment}
                    onUpdateStatus={handleUpdateStatus}
                    currentUser={userProfile.name}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DISTRICT ANALYTICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-4 animate-fade-in" id="metrics-tab-stage">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
              <h2 className="text-xl font-bold font-display tracking-tight text-white">Community Engagement Dashboard</h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time overview of reports, verification metrics, categories distribution, and average resolution efficiency within the district.
              </p>
            </div>
            <DistrictMetrics issues={issues} />
          </div>
        )}

        {/* TAB 3: AI WARDEN REACTION/TRENDS */}
        {activeTab === 'ai' && (
          <div className="animate-fade-in" id="ai-tab-stage">
            <AIInsightsTab />
          </div>
        )}

        {/* TAB 4: GAMIFICATION LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="animate-fade-in" id="leaderboard-tab-stage">
            <LeaderboardTab
              userProfile={userProfile}
              quests={quests}
              leaderboard={leaderboard}
            />
          </div>
        )}

      </main>

      {/* Humble Aesthetic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-[10px] font-mono text-slate-600 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p>Evergreen Valley Municipality Public Safety Portal.</p>
          <p className="opacity-75">Empowering community-driven safety, physical coordination, and rapid resolution services.</p>
        </div>
      </footer>
    </div>
  );
}
