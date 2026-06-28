import React, { useState } from 'react';
import { IssueCategory, IssueSeverity } from '../types';
import { AlertCircle, Camera, Check, HelpCircle, Loader2, MapPin, Sparkles, Wand2 } from 'lucide-react';

interface ReportIssueWizardProps {
  x: number | null;
  y: number | null;
  onReportSubmitted: (formData: {
    title: string;
    description: string;
    category: IssueCategory;
    severity: IssueSeverity;
    x: number;
    y: number;
    imageUrl?: string;
    requestAiAnalysis: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReportIssueWizard({ x, y, onReportSubmitted, isSubmitting }: ReportIssueWizardProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Roads & Sidewalks');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [requestAiAnalysis, setRequestAiAnalysis] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Local preset testing hazards for instant user evaluation of AI capabilities
  const testPresets = [
    {
      label: '⚡ Preset: Broken streetlight',
      title: 'Dark trail with dangling fixture wires',
      desc: 'The park pathway light fixture has been damaged by a storm. The bulb housing is hanging by cords and sparks occasionally.',
      img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
      category: 'Public Lighting' as IssueCategory
    },
    {
      label: '💧 Preset: Burst water pipe',
      title: 'Pressurized water leak flooding driveway',
      desc: 'Sub-surface utility pipe cracked. Potable drinking water is pooling and starting to crack the sidewalk on West Maple.',
      img: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=800&q=80',
      category: 'Water & Sanitation' as IssueCategory
    },
    {
      label: '🗑️ Preset: Litter pileup',
      title: 'Commercial waste dumped on nature reserve',
      desc: 'Multiple garbage bags and structural plastic trash dumped overnight at the entrance of Evergreen forest walkway.',
      img: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
      category: 'Waste Management' as IssueCategory
    }
  ];

  const handleApplyPreset = (preset: typeof testPresets[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setCategory(preset.category);
    setImageUrl(preset.img);
    setRequestAiAnalysis(true);
    setErrorMsg('');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMsg('Image size must be smaller than 2.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setErrorMsg('');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (x === null || y === null) {
      setErrorMsg('Please click on the District Map to place a hazard location pin.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please supply an issue title and physical description.');
      return;
    }

    try {
      await onReportSubmitted({
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        x,
        y,
        imageUrl: imageUrl || undefined,
        requestAiAnalysis,
      });

      // Clear Form state
      setTitle('');
      setDescription('');
      setImageUrl('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish community report.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl h-full" id="report-wizard-container">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
          <Wand2 className="w-4 h-4" />
          <span>Lodge Hyperlocal Hazard</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Provide a description and select location coordinates. Let AI route the ticket.
        </p>
      </div>

      {/* Preset Testers bar */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Fast Demo Presets</span>
        <div className="flex flex-wrap gap-1.5">
          {testPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-850 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left font-sans"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" id="lodge-report-form">
        {/* Coordinate details */}
        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
          x !== null && y !== null 
            ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-amber-950/10 border-amber-500/20 text-amber-400'
        }`}>
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${x !== null && y !== null ? 'text-emerald-400' : 'text-amber-400 animate-bounce'}`} />
            <div>
              <p className="font-semibold text-xs">
                {x !== null && y !== null ? 'Location Captured Successfully' : 'Pin Location Pending'}
              </p>
              <p className="text-[10px] opacity-80 font-sans mt-0.5">
                {x !== null && y !== null 
                  ? `Grid coordinates assigned: Sector East ${x}%, North ${y}%` 
                  : 'Click anywhere on the interactive map to lock coordinates.'}
              </p>
            </div>
          </div>
          {x !== null && y !== null && <Check className="w-4 h-4" />}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 block uppercase">Issue Summary Heading</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fallen oak branch blocking primary bike path"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 block uppercase">Physical Hazard Description</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the exact hazard, danger tags, size, or impact to traffic/pedestrians..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
          />
        </div>

        {/* Category & Severity Overrides (Shown but disabled/bypassed if requestAiAnalysis is active) */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/20 p-3 rounded-xl border border-slate-850">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">Category Override</label>
            <select
              disabled={requestAiAnalysis}
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-300 focus:outline-none disabled:opacity-50"
            >
              <option value="Roads & Sidewalks">Roads & Sidewalks</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Public Lighting">Public Lighting</option>
              <option value="Parks & Public Spaces">Parks & Public Spaces</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">Initial Severity</label>
            <select
              disabled={requestAiAnalysis}
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-300 focus:outline-none disabled:opacity-50"
            >
              <option value="low">Low (Aesthetic)</option>
              <option value="medium">Medium (Annoyance)</option>
              <option value="high">High (Local Risk)</option>
              <option value="critical">Critical (Immediate Danger)</option>
            </select>
          </div>
        </div>

        {/* Media Photo Upload */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 block uppercase">Attach Hazard Evidence (Photo/Video)</label>
          
          <div className="flex gap-2 items-center">
            <label className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors border-dashed text-[11px]">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span>Browse Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
            
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste direct image URL link..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-650 focus:outline-none"
            />
          </div>

          {/* Uploaded image preview */}
          {imageUrl && (
            <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-800 max-h-[140px] bg-slate-950">
              <img
                src={imageUrl}
                alt="Upload preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
              >
                <XCircleIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* AI Assist Toggle */}
        <div className="flex items-start gap-2.5 bg-emerald-950/10 border border-emerald-500/20 p-3 rounded-xl">
          <input
            type="checkbox"
            id="ai-assist-checkbox"
            checked={requestAiAnalysis}
            onChange={(e) => setRequestAiAnalysis(e.target.checked)}
            className="mt-0.5 rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-emerald-500 focus:ring-opacity-25"
          />
          <div>
            <label htmlFor="ai-assist-checkbox" className="font-bold text-emerald-400 flex items-center gap-1 cursor-pointer select-none">
              <Sparkles className="w-3.5 h-3.5 fill-emerald-400/20" />
              <span>Run Automated Gemini AI Analysis</span>
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              Gemini will evaluate the statements or image to automatically select categories, estimate hazards severity, route notifications to responsible services, and issue standard operating plans.
            </p>
          </div>
        </div>

        {/* Success / Error notification */}
        {success && (
          <div className="bg-emerald-950/25 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-lg text-center font-medium animate-fade-in text-[11px]" id="submit-success-banner">
            ✓ Report published! AI dispatched to Evergreen Valley emergency registry.
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-400 p-2.5 rounded-lg text-center font-medium flex items-center gap-1.5 justify-center text-[11px]" id="submit-error-banner">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit action */}
        <button
          type="submit"
          disabled={isSubmitting}
          id="submit-report-button"
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
              <span>Analyzing & Dispatching Report...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200 fill-emerald-100/20" />
              <span>Dispatch Report to Municipal Registry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// Small inline icon helper
function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
