"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, UserPlus, Timer, Plus, Briefcase, MapPin, Trash2, X, ChevronDown } from "lucide-react";
import { authenticatedFetch } from "@/lib/api";

// ── Types ──
interface Referral { id: string; person: string; date: string; last_followup: string; }
interface TrackedJob { _id: string; job_id: string; title: string; company: string; location: string; link: string; status: string; source: string; last_followup: string | null; notes: any[]; created_at: string; referrals?: Referral[]; }

const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "Referral Requested": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Interviewing: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Offer: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function JobsPage() {
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isCustomJobModalOpen, setIsCustomJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<TrackedJob | null>(null);
  const [referralName, setReferralName] = useState("");
  const [customJob, setCustomJob] = useState({ title: "", company: "", location: "", url: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`/api/jobs`);
      if (res.ok) setTrackedJobs(await res.json());
    } catch (error) { console.error("Failed to fetch tracked jobs:", error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !referralName) return;
    setIsSaving(true);
    try {
      await authenticatedFetch(`/api/jobs/${selectedJob.job_id}/referrals`, { method: "POST", body: JSON.stringify({ person: referralName }) });
      setIsReferralModalOpen(false); setReferralName(""); fetchJobs();
    } catch (error) { console.error(error); }
    finally { setIsSaving(false); }
  };

  const handleAddCustomJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customJob.title || !customJob.company) return;
    setIsSaving(true);
    try {
      await authenticatedFetch("/api/jobs", { method: "POST", body: JSON.stringify({ ...customJob, job_id: `custom_${Date.now().toString(36)}`, link: customJob.url, status: "Applied", source: "manual" }) });
      setIsCustomJobModalOpen(false); setCustomJob({ title: "", company: "", location: "", url: "" }); fetchJobs();
    } catch (error) { console.error(error); }
    finally { setIsSaving(false); }
  };

  const handleFollowUp = async (jobId: string, referralId: string) => {
    try {
      await authenticatedFetch(`/api/jobs/${jobId}/referrals?referralId=${referralId}`, { method: "PATCH" });
      fetchJobs();
    } catch (error) { console.error(error); }
  };

  const handleRemoveJob = async (jobId: string) => {
    if (!confirm("Remove this job from tracking?")) return;
    try { await authenticatedFetch(`/api/jobs?jobId=${jobId}`, { method: "DELETE" }); fetchJobs(); }
    catch (error) { console.error(error); }
  };

  const filteredJobs = statusFilter === "All" ? trackedJobs : trackedJobs.filter((j) => j.status === statusFilter);
  const statuses = ["All", ...Array.from(new Set(trackedJobs.map((j) => j.status)))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black gradient-text mb-1">Tracked Applications</h2>
          <p className="text-zinc-400">Manage your active job applications and referrals.</p>
        </div>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto text-sm py-2 px-3 bg-white/5">{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <button onClick={() => setIsCustomJobModalOpen(true)} className="primary-button"><Plus size={18} /> Add Entry</button>
        </div>
      </header>

      {loading ? (<div className="text-center py-20 text-zinc-400 animate-pulse">Loading tracked jobs...</div>) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.job_id} className="glass-panel group hover:border-white/20 transition-all hover:-translate-y-1 relative">
              <button onClick={() => handleRemoveJob(job.job_id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" title="Remove"><Trash2 size={16} /></button>
              <h3 className="text-lg font-bold text-white mb-1 pr-8">{job.title}</h3>
              <div className="text-zinc-400 text-sm mb-3 flex items-center gap-2"><Briefcase size={14} /><span className="font-semibold text-zinc-300">{job.company}</span><span>•</span><MapPin size={14} /><span>{job.location}</span></div>
              <div className="flex gap-2 items-center mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg border uppercase ${STATUS_COLORS[job.status] || "bg-white/10 text-zinc-400 border-white/10"}`}>{job.status}</span>
                {job.link && <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 font-semibold hover:underline">Original Listing →</a>}
              </div>

              {/* Referrals */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase">Network Referrals</h4>
                  <button onClick={() => { setSelectedJob(job); setIsReferralModalOpen(true); }} className="text-xs px-2 py-1 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"><Plus size={12} /> Add</button>
                </div>
                <div className="space-y-2">
                  {(job.referrals && job.referrals.length > 0) ? job.referrals!.map((ref) => (
                    <div key={ref.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition-all">
                      <div>
                        <p className="font-bold text-sm text-white flex items-center gap-1"><UserPlus size={12} />{ref.person}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Timer size={10} />Last: {ref.last_followup}</p>
                      </div>
                      <button onClick={() => handleFollowUp(job.job_id, ref.id)} className="text-xs px-2 py-1 border border-white/10 rounded-lg text-indigo-400 hover:bg-indigo-400/10 transition-all cursor-pointer">Follow Up</button>
                    </div>
                  )) : (
                    <div className="text-center text-zinc-500 text-xs py-3 border border-dashed border-white/10 rounded-xl">No referrals yet</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-20"><p className="text-zinc-500 text-lg mb-4">No tracked applications{statusFilter !== "All" ? ` with status "${statusFilter}"` : ""}.</p><button onClick={() => setIsCustomJobModalOpen(true)} className="primary-button mx-auto"><Plus size={18} /> Add Your First Entry</button></div>
      )}

      {/* Referral Modal */}
      {isReferralModalOpen && (
        <Modal onClose={() => setIsReferralModalOpen(false)} title={`Add Referral for ${selectedJob?.title}`}>
          <form onSubmit={handleAddReferral}>
            <label className="text-sm text-zinc-300 block mb-1">Referrer&apos;s Name</label>
            <input placeholder="e.g. John Doe" autoFocus value={referralName} onChange={(e) => setReferralName(e.target.value)} required className="input-field" />
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setIsReferralModalOpen(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300 font-semibold hover:bg-white/10 transition-all cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSaving} className="flex-1 primary-button">{isSaving ? "Saving..." : "Save Referral"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Custom Job Modal */}
      {isCustomJobModalOpen && (
        <Modal onClose={() => setIsCustomJobModalOpen(false)} title="Add Custom Job Entry">
          <form onSubmit={handleAddCustomJob} className="space-y-3">
            <div>
              <label className="text-sm text-zinc-300 block mb-1">Designation / Role</label>
              <div className="relative"><Briefcase size={16} className="absolute left-4 top-3.5 text-zinc-500" /><input placeholder="e.g. Frontend Engineer" className="input-field pl-10" value={customJob.title} onChange={(e) => setCustomJob({ ...customJob, title: e.target.value })} required /></div>
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-1">Company</label>
              <input placeholder="e.g. Google" className="input-field" value={customJob.company} onChange={(e) => setCustomJob({ ...customJob, company: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-1">Location</label>
              <div className="relative"><MapPin size={16} className="absolute left-4 top-3.5 text-zinc-500" /><input placeholder="e.g. Bangalore, Remote" className="input-field pl-10" value={customJob.location} onChange={(e) => setCustomJob({ ...customJob, location: e.target.value })} /></div>
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-1">Job URL (Optional)</label>
              <input placeholder="e.g. https://company.com/jobs/123" className="input-field" value={customJob.url} onChange={(e) => setCustomJob({ ...customJob, url: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setIsCustomJobModalOpen(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300 font-semibold hover:bg-white/10 transition-all cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSaving} className="flex-1 primary-button">{isSaving ? "Adding..." : "Add to Tracking"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ── Modal Component ──
function Modal({ isOpen, onClose, title, children }: { isOpen?: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel w-full max-w-lg animate-fade-in relative" onClick={(e) => e.stopPropagation()} style={{ background: "rgba(30,41,59,0.95)" }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="bg-none border-none text-zinc-400 hover:text-white cursor-pointer p-1"><X size={24} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
