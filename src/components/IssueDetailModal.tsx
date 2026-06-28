import React, { useState } from 'react';
import { CommunityIssue, Comment, TimelineEvent, IssueStatus } from '../types';
import {
  X,
  Clock,
  User,
  ThumbsUp,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Send,
  Camera,
  Activity,
  Briefcase
} from 'lucide-react';

interface IssueDetailModalProps {
  issue: CommunityIssue;
  onClose: () => void;
  onVote: (issueId: string, voteType: 'upvote' | 'verify' | 'flag') => void;
  onAddComment: (issueId: string, user: string, text: string) => void;
  onUpdateStatus: (issueId: string, status: IssueStatus, message: string, author: string, imageUrl?: string) => void;
  currentUser: string;
}

export default function IssueDetailModal({
  issue,
  onClose,
  onVote,
  onAddComment,
  onUpdateStatus,
  currentUser,
}: IssueDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [showStatusUpdateForm, setShowStatusUpdateForm] = useState(false);
  const [statusInput, setStatusInput] = useState<IssueStatus>(issue.status);
  const [statusMessage, setStatusMessage] = useState('');
  const [resolutionImgUrl, setResolutionImgUrl] = useState('');

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(issue.id, currentUser, commentText.trim());
    setCommentText('');
  };

  const handleStatusUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(
      issue.id,
      statusInput,
      statusMessage || `Status changed to ${statusInput} by community team.`,
      currentUser,
      resolutionImgUrl || undefined
    );
    setShowStatusUpdateForm(false);
    setStatusMessage('');
    setResolutionImgUrl('');
  };

  const getStatusBadgeStyles = (status: IssueStatus) => {
    switch (status) {
      case 'Reported':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Verifying':
        return 'bg-blue-950/50 text-blue-300 border-blue-900';
      case 'Scheduled':
        return 'bg-amber-950/50 text-amber-300 border-amber-900';
      case 'In Progress':
        return 'bg-purple-950/50 text-purple-300 border-purple-900';
      case 'Resolved':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-900';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSeverityBadgeStyles = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-slate-400 bg-slate-800';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10';
      case 'high':
        return 'text-orange-400 bg-orange-500/10';
      case 'critical':
        return 'text-red-400 bg-red-500/10 animate-pulse';
      default:
        return 'text-slate-400 bg-slate-800';
    }
  };

  // List of pre-filled evidence images for easy mock resolving
  const mockResolveImages = [
    { name: 'Asphalt patched', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Swing replaced', url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80' },
    { name: 'Streetlight Fixed', url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80' },
    { name: 'Pipe welded', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl h-full flex flex-col overflow-hidden" id={`issue-detail-drawer-${issue.id}`}>
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-950/50">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Report ID: {issue.id}</span>
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight mt-1" id="issue-detail-title">{issue.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-850 text-slate-300 border-slate-700">
              {issue.category}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(issue.status)}`}>
              ● {issue.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getSeverityBadgeStyles(issue.severity)}`}>
              {issue.severity}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          id="close-detail-drawer"
          className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Issue Hero Media */}
        {issue.imageUrl && (
          <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 group">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur">
              <Camera className="w-3 h-3 text-emerald-400" />
              <span>Report Media Attachment</span>
            </div>
          </div>
        )}

        {/* Reporter Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <User className="w-3 h-3" />
            </div>
            <span>Reported by <strong>{issue.reportedBy}</strong></span>
          </div>
          <span>{new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Detailed Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Citizen Statement</h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>

        {/* AI-Powered Diagnostics Panel */}
        {issue.aiCategorized && (
          <div className="bg-slate-950/80 rounded-xl border border-emerald-500/20 p-4 relative overflow-hidden" id="ai-diagnostics-panel">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span>AI Problem Routing & Plan</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-500/80 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Gemini 3.5 Verified
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span>Assigned Department</span>
                </span>
                <p className="text-xs font-medium text-slate-200 mt-0.5">{issue.aiDepartment}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-slate-400" />
                  <span>Dynamic Action Plan</span>
                </span>
                <div className="text-xs text-slate-300 mt-1 space-y-1 bg-slate-900/50 p-2 rounded.md border border-slate-850">
                  {issue.aiPlan ? (
                    issue.aiPlan.split(/\n|(?=\d\.)/).map((step, idx) => {
                      const trimmed = step.trim();
                      if (!trimmed) return null;
                      return (
                        <p key={idx} className="leading-relaxed text-slate-300 flex items-start gap-1.5 py-0.5">
                          <span className="text-emerald-400 font-mono">▸</span>
                          <span>{trimmed}</span>
                        </p>
                      );
                    })
                  ) : (
                    <p className="italic text-slate-500 text-[11px]">No specific action plan drafted.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Verification Engine */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Citizen Collaboration</h4>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onVote(issue.id, 'upvote')}
              id={`upvote-button-${issue.id}`}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 transition-all group"
            >
              <ThumbsUp className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">{issue.upvotes}</span>
              <span className="text-[9px] text-slate-500">Upvotes</span>
            </button>

            <button
              onClick={() => onVote(issue.id, 'verify')}
              id={`verify-button-${issue.id}`}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 text-slate-300 hover:text-blue-400 transition-all group"
            >
              <CheckCircle className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">{issue.verifications}</span>
              <span className="text-[9px] text-slate-500">Verifications</span>
            </button>

            <button
              onClick={() => onVote(issue.id, 'flag')}
              id={`flag-button-${issue.id}`}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500 hover:bg-slate-850 text-slate-300 hover:text-red-400 transition-all group"
            >
              <AlertTriangle className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-slate-400 group-hover:text-red-400">{issue.flags}</span>
              <span className="text-[9px] text-slate-500">Flag Spam</span>
            </button>
          </div>
          
          <p className="text-[10px] text-slate-500 text-center italic">
            *Verification checks help elevate the report to the municipal emergency queue (Requires 3 residents).
          </p>
        </div>

        {/* State Transition Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational Timeline</h4>
            <button
              onClick={() => setShowStatusUpdateForm(!showStatusUpdateForm)}
              id="action-log-update-btn"
              className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-2 py-1 rounded transition-colors"
            >
              {showStatusUpdateForm ? 'Cancel Status action' : 'Update Status / Resolve'}
            </button>
          </div>

          {/* Interactive State Update form */}
          {showStatusUpdateForm && (
            <form onSubmit={handleStatusUpdateSubmit} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3" id="status-transition-form">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">New State</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as IssueStatus)}
                    className="w-full bg-slate-900 border border-slate-850 text-xs rounded p-1.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Reported">Reported</option>
                    <option value="Verifying">Verifying</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved ✅</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Log Author</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser} (Community)`}
                    className="w-full bg-slate-900/65 border border-slate-850 text-xs rounded p-1.5 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Operational Update Message</label>
                <textarea
                  required
                  rows={2}
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="Describe dispatch, repairs scheduled, or final hardware components replaced..."
                  className="w-full bg-slate-900 border border-slate-850 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>

              {/* Resolution Image attachment helper if Resolved */}
              {statusInput === 'Resolved' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 block">Attach Resolution Proof (Optional URL)</label>
                  <input
                    type="text"
                    value={resolutionImgUrl}
                    onChange={(e) => setResolutionImgUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-900 border border-slate-850 text-xs rounded p-1.5 text-white focus:outline-none"
                  />
                  <div className="flex gap-1 overflow-x-auto py-1">
                    {mockResolveImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setResolutionImgUrl(img.url)}
                        className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full hover:bg-slate-850 hover:text-slate-200 shrink-0"
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="submit-status-update-btn"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded transition-colors"
              >
                Publish Official Action Log
              </button>
            </form>
          )}

          {/* Vertical Timeline component */}
          <div className="space-y-4 border-l-2 border-slate-850 pl-4 ml-2 relative">
            {issue.timeline.slice().reverse().map((event, idx) => (
              <div key={idx} className="relative space-y-1">
                {/* Timeline node icon indicator */}
                <div className={`absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                  event.status === 'Resolved' ? 'bg-emerald-500' :
                  event.status === 'In Progress' ? 'bg-purple-500' :
                  event.status === 'Scheduled' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />
                
                <div className="flex justify-between items-start text-[10px] font-mono">
                  <span className={`font-semibold ${
                    event.status === 'Resolved' ? 'text-emerald-400' :
                    event.status === 'In Progress' ? 'text-purple-400' :
                    event.status === 'Scheduled' ? 'text-amber-400' : 'text-slate-400'
                  }`}>{event.status}</span>
                  <span className="text-slate-500">
                    {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{event.message}</p>
                
                <div className="text-[9px] font-mono text-slate-500">
                  Action taken by: <span className="text-slate-400 font-sans">{event.author}</span>
                </div>

                {event.imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-850 max-h-[140px] bg-slate-950">
                    <img
                      src={event.imageUrl}
                      alt="Resolution evidence"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Collaborative Community Chat/Comments Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community Coordination ({issue.comments.length})</span>
          </h4>

          {/* Comments Feed List */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {issue.comments.length === 0 ? (
              <p className="text-xs italic text-slate-500 text-center py-4 bg-slate-950/20 rounded-lg border border-slate-850 border-dashed">
                No local updates. Be the first to share coordination advice.
              </p>
            ) : (
              issue.comments.map((comment) => (
                <div key={comment.id} className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-semibold text-slate-300">{comment.user}</span>
                    <span className="text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {/* New Comment submission */}
          <form onSubmit={handleAddCommentSubmit} className="flex gap-2" id="add-comment-form">
            <input
              type="text"
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Suggest repair shortcuts or upload updates..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              id="submit-comment-button"
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
