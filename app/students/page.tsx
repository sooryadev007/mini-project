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
  
  // Custom Form states
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  // Verification states
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Exception states
  const [isException, setIsException] = useState(false);
  const [exceptionReason, setExceptionReason] = useState("");
  
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

  const handleApplyTrigger = (job: any) => {
    setSelectedJob(job);
    setCustomAnswers({});
    setIsException(false);
    setExceptionReason("");
    setIsApplyModalOpen(true);
  };

  const handleApply = async (jobId: string, answers: Record<string, string> = {}) => {
    setApplyingId(jobId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, answers, isException, exceptionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Applied successfully!");
        setIsApplyModalOpen(false);
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

  const handleSendOtp = async () => {
    setSendLoading(true);
    try {
      const res = await fetch("/api/students/verify/send-otp", { method: "POST" });
      if (res.ok) {
        alert("OTP sent to your email (Check server console)");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send OTP");
      }
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/students/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpValue }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Verified successfully!");
        setIsVerifyModalOpen(false);
        fetchData();
      } else {
        alert(data.error || "Invalid OTP");
      }
    } finally {
      setVerifyLoading(false);
    }
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
            {!user?.studentProfile?.isVerified && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                onClick={() => {
                  setIsVerifyModalOpen(true);
                  handleSendOtp();
                }}
              >
                Verify Account
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user?.name || "Student"}</h1>
              <p className="text-slate-600 mt-2 text-base md:text-lg">Browse placement drives and track your career journey.</p>
            </div>
            {user?.studentProfile && (
              <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex justify-around md:justify-start gap-8 items-center w-full md:w-auto">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CGPA</p>
                  <p className="text-2xl font-bold text-blue-600">{user.studentProfile.cgpa}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Major</p>
                  <p className="text-lg font-semibold text-slate-700">{user.studentProfile.department}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                  {user.studentProfile.isVerified ? (
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1"><FaCheckCircle className="text-xs" /> Verified</p>
                  ) : (
                    <p className="text-sm font-bold text-amber-600 flex items-center gap-1"><FaExclamationCircle className="text-xs" /> Unverified</p>
                  )}
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
                        !eligible && "opacity-90"
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

                          {(j.salary || j.location || j.probation || j.trainingPeriod || j.jobOpportunity) && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                              {j.salary && (
                                <div>
                                  <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">CTC / Stipend</p>
                                  <p className="text-sm font-semibold text-slate-700">{j.salary}</p>
                                </div>
                              )}
                              {j.location && (
                                <div>
                                  <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Location</p>
                                  <p className="text-sm font-semibold text-slate-700">{j.location}</p>
                                </div>
                              )}
                              {j.probation && (
                                <div>
                                  <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Probation</p>
                                  <p className="text-sm font-semibold text-slate-700">{j.probation}</p>
                                </div>
                              )}
                              {j.trainingPeriod && (
                                <div>
                                  <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Training Period</p>
                                  <p className="text-sm font-semibold text-slate-700">{j.trainingPeriod}</p>
                                </div>
                              )}
                              {j.jobOpportunity && (
                                <div className="col-span-2 md:col-span-1">
                                  <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Opportunity</p>
                                  <p className="text-sm font-semibold text-slate-700 line-clamp-2" title={j.jobOpportunity}>{j.jobOpportunity}</p>
                                </div>
                              )}
                              {j.jobDescription && (
                                <div className="col-span-full pt-2 border-t border-blue-200/50">
                                  <a href={j.jobDescription.startsWith('http') ? j.jobDescription : `https://${j.jobDescription}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-700 flex items-center gap-1 hover:underline">
                                    <FaBriefcase className="text-[10px]" /> View Detailed Job Description
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
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
                              disabled={applied || applyingId === j.id || !user?.studentProfile?.isVerified}
                              onClick={() => handleApplyTrigger(j)}
                              className={applied ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-blue-600 hover:bg-blue-700"}
                            >
                              {!user?.studentProfile?.isVerified ? "Verify to Apply" : applied ? "Applied" : applyingId === j.id ? "Processing..." : "Apply Now"}
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

          <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                <DialogDescription>
                  {user?.studentProfile?.cgpa < selectedJob?.minCgpa && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs mb-4">
                      <strong>Note:</strong> You do not meet the minimum CGPA ({selectedJob?.minCgpa}) for this drive. 
                      You must provide a valid reason to apply with an exception.
                    </div>
                  )}
                  Please fill out the following required information.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleApply(selectedJob.id, customAnswers);
              }} className="space-y-4">
                {user?.studentProfile?.cgpa < selectedJob?.minCgpa && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-2">
                       <input 
                         type="checkbox" 
                         id="exception" 
                         checked={isException} 
                         onChange={e => setIsException(e.target.checked)}
                         className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                       />
                       <Label htmlFor="exception" className="text-sm font-bold text-slate-700">I&apos;ll acquired eligibility shortly(option)</Label>
                    </div>
                    {isException && (
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Please provide a detailed reason/plan *</Label>
                        <textarea 
                          required
                          value={exceptionReason}
                          onChange={e => setExceptionReason(e.target.value)}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Example: I have minor in X which will improve my CGPA..."
                        />
                      </div>
                    )}
                  </div>
                )}
                {selectedJob?.customForm?.map((f: any) => (
                  <div key={f.id} className="space-y-2">
                    <Label>{f.label} {f.required && <span className="text-red-500">*</span>}</Label>
                    {f.type === "dropdown" ? (
                      <select 
                        required={f.required}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={customAnswers[f.id] || ""}
                        onChange={e => setCustomAnswers({...customAnswers, [f.id]: e.target.value})}
                      >
                        <option value="" disabled>Select an option</option>
                        {f.options?.split(",").map((opt: string, i: number) => (
                          <option key={i} value={opt.trim()}>{opt.trim()}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={f.type === "number" ? "number" : "text"}
                        required={f.required}
                        value={customAnswers[f.id] || ""}
                        onChange={e => setCustomAnswers({...customAnswers, [f.id]: e.target.value})}
                      />
                    )}
                  </div>
                ))}
                <DialogFooter className="mt-6 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={applyingId === selectedJob?.id || (user?.studentProfile?.cgpa < selectedJob?.minCgpa && !isException)}>
                    {applyingId === selectedJob?.id ? "Submitting..." : "Submit Application"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Your Account</DialogTitle>
                <DialogDescription>We sent a 6-digit OTP to your registered email (Mocked in server console).</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Verification OTP</Label>
                  <Input 
                    placeholder="Enter 6-digit OTP" 
                    value={otpValue} 
                    onChange={e => setOtpValue(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="link" size="sm" onClick={handleSendOtp} disabled={sendLoading} className="text-blue-600 p-0 h-auto">
                    {sendLoading ? "Sending..." : "Resend OTP"}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsVerifyModalOpen(false)}>Cancel</Button>
                <Button onClick={handleVerifyOtp} disabled={verifyLoading || otpValue.length < 6} className="bg-blue-600">
                  {verifyLoading ? "Verifying..." : "Confirm Verification"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </main>
    </div>
  );
}
