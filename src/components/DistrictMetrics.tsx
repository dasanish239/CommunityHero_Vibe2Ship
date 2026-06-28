import React from 'react';
import { CommunityIssue, IssueCategory, IssueStatus } from '../types';
import { Award, CheckSquare, ListTodo, ShieldCheck, Users, Vote } from 'lucide-react';

interface DistrictMetricsProps {
  issues: CommunityIssue[];
}

export default function DistrictMetrics({ issues }: DistrictMetricsProps) {
  // 1. Calculate general numbers
  const totalReports = issues.length;
  const activeReports = issues.filter(i => i.status !== 'Resolved').length;
  const resolvedReports = issues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;
  
  const totalUpvotes = issues.reduce((acc, curr) => acc + curr.upvotes, 0);
  const totalVerifications = issues.reduce((acc, curr) => acc + curr.verifications, 0);

  // 2. Count reports per category
  const categories: IssueCategory[] = [
    'Roads & Sidewalks',
    'Water & Sanitation',
    'Waste Management',
    'Public Lighting',
    'Parks & Public Spaces'
  ];

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = issues.filter(i => i.category === cat).length;
    return acc;
  }, {} as Record<IssueCategory, number>);

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Colors mapping for category indicators
  const getCategoryThemeColors = (cat: IssueCategory) => {
    switch (cat) {
      case 'Roads & Sidewalks':
        return { bg: 'bg-red-500/15 text-red-400 border-red-500/20', bar: 'bg-red-500' };
      case 'Water & Sanitation':
        return { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/20', bar: 'bg-blue-500' };
      case 'Waste Management':
        return { bg: 'bg-purple-500/15 text-purple-400 border-purple-500/20', bar: 'bg-purple-500' };
      case 'Public Lighting':
        return { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/20', bar: 'bg-amber-500' };
      case 'Parks & Public Spaces':
        return { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', bar: 'bg-emerald-500' };
      default:
        return { bg: 'bg-slate-500/15 text-slate-400 border-slate-500/20', bar: 'bg-slate-500' };
    }
  };

  // 3. Count reports per status
  const statuses: IssueStatus[] = ['Reported', 'Verifying', 'Scheduled', 'In Progress', 'Resolved'];
  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = issues.filter(i => i.status === status).length;
    return acc;
  }, {} as Record<IssueStatus, number>);

  // SVG circular progress offsets
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (resolutionRate / 100) * circumference;

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="district-metrics-dashboard">
      {/* Overview Stat Widgets (Bento Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-850">
            <ListTodo className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Total Logged</span>
            <span className="text-xl font-extrabold text-white tracking-tight leading-none mt-1 block">
              {totalReports}
            </span>
          </div>
        </div>

        {/* Resolved Issues */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Resolved</span>
            <span className="text-xl font-extrabold text-white tracking-tight leading-none mt-1 block">
              {resolvedReports}
            </span>
          </div>
        </div>

        {/* Total Upvotes */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/5 text-amber-400 border border-amber-500/10">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Upvote Signal</span>
            <span className="text-xl font-extrabold text-white tracking-tight leading-none mt-1 block">
              {totalUpvotes}
            </span>
          </div>
        </div>

        {/* Total Verifications */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="p-2.5 rounded-xl bg-blue-500/5 text-blue-400 border border-blue-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Verifications</span>
            <span className="text-xl font-extrabold text-white tracking-tight leading-none mt-1 block">
              {totalVerifications}
            </span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular resolution efficiency Gauge */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display w-full text-left border-b border-slate-800 pb-3">
            District Resolution Index
          </h3>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Ring Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-850"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-emerald-500 transition-all duration-1000"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white tracking-tight">{resolutionRate}%</span>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Solved Rate</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-slate-200 font-medium">Resolution Pace: Efficient</p>
            <p className="text-[10px] text-slate-500 max-w-xs font-sans leading-relaxed">
              Target municipality response index is 75%. Evergreen Valley currently maintains a healthy trajectory.
            </p>
          </div>
        </div>

        {/* Category breakdown bar indicators */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display border-b border-slate-800 pb-3">
            Report Density by Category
          </h3>

          <div className="space-y-3.5 pt-2">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const percent = Math.round((count / maxCategoryCount) * 100);
              const theme = getCategoryThemeColors(cat);
              
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">{cat}</span>
                    <span className="font-mono text-slate-400">{count} issue{count !== 1 && 's'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
                      <div
                        className={`${theme.bar} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operational Status Breakdown */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display border-b border-slate-800 pb-3">
          Hazard Lifecycle Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {statuses.map((status) => {
            const count = statusCounts[status] || 0;
            const percent = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
            
            return (
              <div key={status} className="bg-slate-950/35 border border-slate-850 p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">{status}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white tracking-tight leading-none">{count}</span>
                  <span className="text-[10px] font-mono text-slate-400">{percent}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      status === 'Resolved' ? 'bg-emerald-500' :
                      status === 'In Progress' ? 'bg-purple-500' :
                      status === 'Scheduled' ? 'bg-amber-500' :
                      status === 'Verifying' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
