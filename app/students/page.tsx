"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaArrowLeft, FaBriefcase, FaGraduationCap, FaSignOutAlt, FaCheckCircle, FaExclamationCircle, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StudentPage() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  
  // New States
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });

  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, jRes, aRes] = await Promise.all([
        fetch("/api/auth/me").then(r => r.json()),
        fetch("/api/jobs").then(r => r.json()),
        fetch("/api/applications").then(r => r.json()),
      ]);
      setUser(uRes.user || null);
      setJobs(jRes.jobs || []);
      setApplications(aRes.applications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Applied successfully!");
        fetchData();
      } else {
        alert(data.error || "Failed to apply");
      }
    } finally {
      setApplyingId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/students/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passForm),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Password changed successfully!");
      setIsPasswordOpen(false);
      setPassForm({ currentPassword: "", newPassword: "" });
    } else {
      alert(data.error || "Failed to change password");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
  };

  const isApplied = (jobId: string) => applications.some(a => a.jobId === jobId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <FaArrowLeft /> Home
              </Link>
            </Button>
            <div className="flex items-center gap-2 font-semibold px-4 py-1.5 bg-blue-100 rounded-full text-sm">
              <FaGraduationCap className="text-blue-600" />
              Student Portal
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FaKey className="mr-2" /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={passForm.currentPassword} onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} required />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600">Update Password</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold">Welcome, {user?.name || "Student"}</h1>
              <p className="text-slate-600 mt-2 text-lg">Browse placement drives and track your career journey.</p>
            </div>
            {user?.studentProfile && (
              <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex gap-8 items-center">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CGPA</p>
                  <p className="text-2xl font-bold text-blue-600">{user.studentProfile.cgpa}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Major</p>
                  <p className="text-lg font-semibold text-slate-700">{user.studentProfile.department}</p>
                </div>

              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaBriefcase className="text-blue-600" /> Available Drives
              </h2>
              {loading ? (
                <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed">Loading upcoming drives...</div>
              ) : jobs.length === 0 ? (
                <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed">No active drives at the moment.</div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(j => {
                    const eligible = user?.studentProfile?.cgpa >= j.minCgpa;
                    const applied = isApplied(j.id);
                    
                    return (
                      <Card key={j.id} className={cn(
                        "overflow-hidden border-none shadow-lg hover:shadow-xl transition-all bg-white/50 backdrop-blur-md",
                        !eligible && "grayscale opacity-75 pointer-events-none"
                      )}>
                        <CardHeader className="bg-white/80 border-b border-slate-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{j.title}</CardTitle>
                              <CardDescription className="text-blue-600 font-semibold">{j.company?.name}</CardDescription>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-tight">Deadline</p>
                              <p className="text-sm font-semibold">{new Date(j.deadline).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-6">
                          <p className="text-slate-600 mb-6">{j.description}</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {j.requirements?.map((r: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">{r}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-500">Criteria:</span>
                              {eligible ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1"><FaCheckCircle /> Eligible (Min {j.minCgpa})</span>
                              ) : (
                                <span className="text-red-500 font-bold flex items-center gap-1"><FaExclamationCircle /> Not Eligible (Min {j.minCgpa})</span>
                              )}
                            </div>
                            <Button 
                              disabled={!eligible || applied || applyingId === j.id}
                              onClick={() => handleApply(j.id)}
                              className={applied ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-blue-600 hover:bg-blue-700"}
                            >
                              {applied ? "Applied" : applyingId === j.id ? "Processing..." : "Apply Now"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}


            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">My Applications</h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed">Loading...</div>
                ) : applications.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed">You haven't applied to any drives yet.</div>
                ) : (
                  applications.map(a => (
                    <div key={a.id} className="p-4 bg-white rounded-xl shadow-md border border-slate-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{a.job.title}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{a.status}</span>
                      </div>
                      <span className="text-xs text-slate-500">{a.job.company.name}</span>
                      <span className="text-[10px] text-slate-400">Applied on {new Date(a.appliedAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
