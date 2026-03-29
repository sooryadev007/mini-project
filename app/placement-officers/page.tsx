"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FaArrowLeft, FaUsers, FaPlus, FaUpload, FaBriefcase, FaSignOutAlt, FaTrash, FaDownload, FaChevronUp, FaChevronDown, FaGripVertical, FaCopy } from "react-icons/fa";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";

export default function PlacementOfficerPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isViewApplicantsOpen, setIsViewApplicantsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

   // Form states
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", rollNumber: "", department: "", year: "1", cgpa: "0" });
  const [newJob, setNewJob] = useState({ 
    title: "", 
    description: "", 
    requirements: "", 
    salary: "", 
    location: "", 
    jobType: "FULL_TIME", 
    companyId: "", 
    deadline: "", 
    minCgpa: "0",
    probation: "",
    trainingPeriod: "",
    jobOpportunity: "",
    jobDescription: ""
  });
  const [customForm, setCustomForm] = useState<{ id: string; type: string; label: string; required: boolean; options: string }[]>([]);
  const [newCompany, setNewCompany] = useState({ name: "", description: "", website: "", industry: "", location: "" });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, jRes] = await Promise.all([
        fetch("/api/officers/students").then(r => r.json()),
        fetch("/api/companies").then(r => r.json()),
        fetch("/api/jobs").then(r => r.json()),
      ]);
      setStudents(sRes.students || []);
      setCompanies(cRes.companies || []);
      setJobs(jRes.jobs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/officers/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
    if (res.ok) {
      setIsAddStudentOpen(false);
      setNewStudent({ name: "", email: "", password: "", rollNumber: "", department: "", year: "1", cgpa: "0" });
      fetchData();
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      const data = lines.slice(1).filter(l => l.trim()).map(line => {
        // Simple CSV parser that handles quotes
        const values: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        const obj: any = {};
        headers.forEach((h, i) => {
          let key = h.trim().toLowerCase().replace(/\s+/g, "");
          // Map common variations to API expected keys
          if (key === "rollnumber" || key === "rollno") key = "rollNumber";
          if (key === "mincgpa") key = "minCgpa";
          
          obj[key] = values[i];
        });
        return obj;
      });

      const res = await fetch("/api/officers/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setCsvFile(null);
        fetchData();
        alert("Students imported successfully!");
      }
    };
    reader.readAsText(csvFile);
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...newJob, 
        requirements: newJob.requirements ? newJob.requirements.split(",").map(r => r.trim()) : [],
        customForm: customForm.length > 0 ? customForm : null
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setIsAddJobOpen(false);
      setNewJob({ 
        title: "", 
        description: "", 
        requirements: "", 
        salary: "", 
        location: "", 
        jobType: "FULL_TIME", 
        companyId: "", 
        deadline: "", 
        minCgpa: "0",
        probation: "",
        trainingPeriod: "",
        jobOpportunity: "",
        jobDescription: ""
      });
      setCustomForm([]);
      fetchData();
    } else {
      setError(data.error || "Failed to create drive");
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCompany),
    });
    if (res.ok) {
      setIsAddCompanyOpen(false);
      setNewCompany({ name: "", description: "", website: "", industry: "", location: "" });
      fetchData();
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
  };

  const handleViewApplicants = async (job: any) => {
    setSelectedJob(job);
    setIsViewApplicantsOpen(true);
    setLoadingApplicants(true);
    try {
      const res = await fetch(`/api/applications?jobId=${job.id}`);
      const data = await res.json();
      setApplicants(data.applications || []);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleExportData = (format: "csv" | "xlsx" | "ods" | "html" | "tsv" | "pdf") => {
    if (!applicants.length || !selectedJob) return;
    
    const formKeys = selectedJob.customForm ? selectedJob.customForm.map((f: any) => f) : [];
    
    const rows = applicants.map(a => {
      const baseObj: any = {
        "Student Name": a.student.user.name,
        "Roll Number": a.student.rollNumber,
        "Department": a.student.department,
        "CGPA": a.student.cgpa,
        "Applied On": new Date(a.appliedAt).toLocaleDateString(),
        "Eligibility Exception": a.isException ? "YES" : "NO",
        "Exception Reason": a.exceptionReason || ""
      };
      
      formKeys.forEach((f: any) => {
         baseObj[f.label] = (a.answers && a.answers[f.id]) ? a.answers[f.id] : "";
      });
      return baseObj;
    });

    const headers = Object.keys(rows[0] || {});

    if (format === "pdf") {
      const doc = new jsPDF("landscape");
      doc.text(`Applicants - ${selectedJob.title}`, 14, 15);
      autoTable(doc, {
        head: [headers],
        body: rows.map(r => headers.map(h => r[h])),
        startY: 20
      });
      doc.save(`applicants-${selectedJob.title.replace(/\s+/g, '-')}.pdf`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");

    if (format === "csv") {
      XLSX.writeFile(workbook, `applicants-${selectedJob.title.replace(/\s+/g, '-')}.csv`);
    } else if (format === "tsv") {
      XLSX.writeFile(workbook, `applicants-${selectedJob.title.replace(/\s+/g, '-')}.txt`, { bookType: "txt" });
    } else if (format === "html") {
      XLSX.writeFile(workbook, `applicants-${selectedJob.title.replace(/\s+/g, '-')}.html`);
    } else if (format === "ods") {
      XLSX.writeFile(workbook, `applicants-${selectedJob.title.replace(/\s+/g, '-')}.ods`);
    } else {
      XLSX.writeFile(workbook, `applicants-${selectedJob.title.replace(/\s+/g, '-')}.xlsx`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <FaArrowLeft /> Home
              </Link>
            </Button>
            <div className="flex items-center gap-2 font-semibold px-4 py-1.5 bg-emerald-100 rounded-full text-sm">
              <FaUsers className="text-emerald-600" />
              Office Portal
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <FaSignOutAlt className="mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="students" className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Placement Officer Dashboard</h1>
                <p className="text-slate-600 mt-2 text-base md:text-lg">Manage student records and plan upcoming drives.</p>
              </div>
              <TabsList className="bg-white/50 backdrop-blur-md p-1 self-start md:self-auto w-full md:w-auto flex">
                <TabsTrigger value="students" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 md:flex-none px-4 md:px-6">Students</TabsTrigger>
                <TabsTrigger value="drives" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 md:flex-none px-4 md:px-6">Drives</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="students" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FaPlus className="text-emerald-600" /> Add Student Manually</CardTitle>
                    <CardDescription>Individual record entry</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleAddStudent}>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label>Full Name</Label>
                        <Input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Roll Number</Label>
                        <Input value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input value={newStudent.department} onChange={e => setNewStudent({...newStudent, department: e.target.value})} required placeholder="CSE, IT..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input type="number" value={newStudent.year} onChange={e => setNewStudent({...newStudent, year: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA</Label>
                        <Input type="number" step="0.01" value={newStudent.cgpa} onChange={e => setNewStudent({...newStudent, cgpa: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} required />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Add Student</Button>
                    </CardFooter>
                  </form>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FaUpload className="text-emerald-600" /> Bulk Import</CardTitle>
                    <CardDescription>Upload CSV with student data</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleCsvUpload}>
                    <CardContent className="space-y-4">
                      <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50/50">
                        <FaUpload className="text-slate-400 text-3xl mb-4" />
                        <p className="text-sm text-slate-500 mb-4">Required format: name,email,pass,cgpa,rollNumber,department,year</p>
                        <Input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="max-w-[200px]" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={!csvFile} className="w-full">Upload and Process</Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Registered Students</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-y">
                        <tr className="text-left font-medium">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Roll</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Dept</th>
                          <th className="px-6 py-4">CGPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {students.map(s => (
                          <tr key={s.id}>
                            <td className="px-6 py-4 font-semibold">{s.name}</td>
                            <td className="px-6 py-4">{s.studentProfile?.rollNumber}</td>
                            <td className="px-6 py-4">{s.email}</td>
                            <td className="px-6 py-4">{s.studentProfile?.department}</td>
                            <td className="px-6 py-4 text-emerald-600 font-bold">{s.studentProfile?.cgpa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drives" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-none shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2"><FaBriefcase className="text-emerald-600" /> Create Drive</CardTitle>
                      <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><FaPlus className="mr-2" /> Add Company</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Company</DialogTitle>
                            <DialogDescription>Add a company before creating a drive.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddCompany} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Company Name</Label>
                              <Input value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Industry</Label>
                              <Input value={newCompany.industry} onChange={e => setNewCompany({...newCompany, industry: e.target.value})} placeholder="e.g. IT, Finance" />
                            </div>
                            <div className="space-y-2">
                              <Label>Location</Label>
                              <Input value={newCompany.location} onChange={e => setNewCompany({...newCompany, location: e.target.value})} placeholder="e.g. Remote, Bangalore" />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-600">Save Company</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardDescription>Post a new recruitment event</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleAddJob}>
                    <CardContent className="space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                          {error}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Select value={newJob.companyId} onValueChange={(val) => setNewJob({...newJob, companyId: val})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Requirements (Comma separated)</Label>
                        <Input value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} placeholder="e.g. Python, SQL, Communication" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Deadline</Label>
                        <Input type="date" value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Min. CGPA Requirement</Label>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g. 7.5" 
                          value={newJob.minCgpa}
                          onChange={e => setNewJob({...newJob, minCgpa: e.target.value})}
                          required 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CTC / Stipend (Optional)</Label>
                          <Input value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} placeholder="e.g. 12 LPA / 50k pm" />
                        </div>
                        <div className="space-y-2">
                          <Label>Job Location (Optional)</Label>
                          <Input value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Bangalore / Remote" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Probation Period (Optional)</Label>
                          <Input value={newJob.probation} onChange={e => setNewJob({...newJob, probation: e.target.value})} placeholder="e.g. 6 months" />
                        </div>
                        <div className="space-y-2">
                          <Label>Training Period (Optional)</Label>
                          <Input value={newJob.trainingPeriod} onChange={e => setNewJob({...newJob, trainingPeriod: e.target.value})} placeholder="e.g. 3 months" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Job Opportunity Details (Optional)</Label>
                        <Input value={newJob.jobOpportunity} onChange={e => setNewJob({...newJob, jobOpportunity: e.target.value})} placeholder="e.g. Full time offer after internship" />
                      </div>

                      <div className="space-y-2">
                        <Label>Job Description Link / Doc (Optional)</Label>
                        <Input value={newJob.jobDescription} onChange={e => setNewJob({...newJob, jobDescription: e.target.value})} placeholder="Paste link to JD or brief details" />
                      </div>

                      <div className="space-y-4 border-t pt-4 mt-4">
                        <div>
                          <Label className="text-lg font-bold">Custom Registration Form (Optional)</Label>
                          <p className="text-sm text-slate-500">Add dynamic fields for students to fill out when applying.</p>
                        </div>
                        {customForm.map((f, i) => (
                          <div key={f.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-4 relative group transition-all hover:border-emerald-300">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-emerald-600" 
                                onClick={() => {
                                  if (i === 0) return;
                                  const nf = [...customForm];
                                  const temp = nf[i];
                                  nf[i] = nf[i - 1];
                                  nf[i - 1] = temp;
                                  setCustomForm(nf);
                                }}
                                disabled={i === 0}
                              >
                                <FaChevronUp size={14} />
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-emerald-600" 
                                onClick={() => {
                                  if (i === customForm.length - 1) return;
                                  const nf = [...customForm];
                                  const temp = nf[i];
                                  nf[i] = nf[i + 1];
                                  nf[i + 1] = temp;
                                  setCustomForm(nf);
                                }}
                                disabled={i === customForm.length - 1}
                              >
                                <FaChevronDown size={14} />
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-emerald-600" 
                                title="Duplicate Question"
                                onClick={() => {
                                  const nf = [...customForm];
                                  const dup = { ...nf[i], id: Math.random().toString(36).substr(2, 9) };
                                  nf.splice(i + 1, 0, dup);
                                  setCustomForm(nf);
                                }}
                              >
                                <FaCopy size={13} />
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" 
                                title="Delete Question"
                                onClick={() => setCustomForm(customForm.filter(x => x.id !== f.id))}
                              >
                                <FaTrash size={14} />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2 mb-1 cursor-grab active:cursor-grabbing">
                                <FaGripVertical className="text-slate-300 mr-1" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Question {i + 1}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-12">
                              <div className="space-y-1.5 flex flex-col">
                                <Label className="text-sm font-medium">Question Text</Label>
                                <Input 
                                  value={f.label} 
                                  onChange={e => {
                                    const nf = [...customForm];
                                    nf[i].label = e.target.value;
                                    setCustomForm(nf);
                                  }} 
                                  required 
                                  placeholder="e.g. Do you have a valid passport?" 
                                  className="h-10 text-sm bg-slate-50/50 focus:bg-white border-slate-200" 
                                />
                              </div>
                              <div className="space-y-1.5 flex flex-col">
                                <Label className="text-sm font-medium">Type of Answer</Label>
                                <Select value={f.type} onValueChange={v => {
                                  const nf = [...customForm];
                                  nf[i].type = v;
                                  setCustomForm(nf);
                                }}>
                                  <SelectTrigger className="h-10 text-sm bg-slate-50/50 focus:bg-white border-slate-200"><SelectValue/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Short Answer (Text)</SelectItem>
                                    <SelectItem value="number">Number (CGPA, Year, etc.)</SelectItem>
                                    <SelectItem value="dropdown">Selection Menu (Dropdown)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            {f.type === "dropdown" && (
                              <div className="space-y-1.5 mt-1 animate-in fade-in slide-in-from-top-1 bg-emerald-50/30 p-3 rounded-lg border border-emerald-100/50">
                                <Label className="text-sm font-medium text-emerald-800">Menu Options <span className="text-xs text-emerald-600 font-normal">(Separate with commas)</span></Label>
                                <Input 
                                  value={f.options} 
                                  onChange={e => {
                                    const nf = [...customForm];
                                    nf[i].options = e.target.value;
                                    setCustomForm(nf);
                                  }} 
                                  required 
                                  placeholder="e.g. Yes, No, In Progress" 
                                  className="h-10 text-sm bg-white border-emerald-200" 
                                />
                                <p className="text-[10px] text-emerald-600 italic">Students will pick from these choices.</p>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100">
                              <input 
                                type="checkbox" 
                                checked={f.required} 
                                onChange={e => {
                                  const nf = [...customForm];
                                  nf[i].required = e.target.checked;
                                  setCustomForm(nf);
                                }} 
                                id={`req-${f.id}`} 
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                              />
                              <Label htmlFor={`req-${f.id}`} className="text-sm font-medium cursor-pointer text-slate-600">This field is mandatory for students</Label>
                            </div>
                          </div>
                        ))}
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full border-dashed border-2 py-8 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex flex-col gap-2 h-auto" 
                          onClick={() => setCustomForm([...customForm, { id: Math.random().toString(36).substr(2, 9), type: "text", label: "", required: true, options: "" }])}
                        >
                          <FaPlus className="text-lg" />
                          <span className="font-semibold">Add New Question</span>
                        </Button>
                      </div>

                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Publish Drive</Button>
                    </CardFooter>
                  </form>
                </Card>

                <Card className="md:col-span-2 border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Active Placement Drives</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {jobs.map(j => (
                      <div key={j.id} className="p-4 border rounded-xl flex items-center justify-between bg-white hover:border-emerald-200 transition-colors">
                        <div>
                          <h3 className="font-bold text-lg">{j.title}</h3>
                          <p className="text-sm text-slate-500">{j.company?.name} • Deadline: {new Date(j.deadline).toLocaleDateString()}</p>
                          <p className="text-xs text-emerald-600 mt-1 font-semibold">Min. CGPA: {j.minCgpa}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-full">{j._count?.applications || 0} applications</span>
                          <Button size="sm" variant="outline" onClick={() => handleViewApplicants(j)}>View Profile</Button>
                        </div>
                      </div>
                    ))}

                    <Dialog open={isViewApplicantsOpen} onOpenChange={setIsViewApplicantsOpen}>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <DialogTitle>Applicants for {selectedJob?.title}</DialogTitle>
                              <DialogDescription>{selectedJob?.company?.name}</DialogDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={applicants.length === 0}>
                                  <FaDownload className="mr-2" /> Export Data
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExportData("xlsx")}>Export as Excel (.xlsx)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportData("ods")}>Export as OpenDocument (.ods)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportData("csv")}>Export as CSV (.csv)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportData("tsv")}>Export as TSV (.tsv)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportData("pdf")}>Export as PDF (.pdf)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportData("html")}>Export as HTML (.html)</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </DialogHeader>
                        {loadingApplicants ? (
                          <div className="p-10 text-center">Loading applicants...</div>
                        ) : applicants.length === 0 ? (
                          <div className="p-10 text-center text-slate-500">No applications yet.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-50 border-y">
                                <tr>
                                  <th className="px-4 py-3 text-left font-medium">Student Name</th>
                                  <th className="px-4 py-3 text-left font-medium">Roll Number</th>
                                  <th className="px-4 py-3 text-left font-medium">Department</th>
                                  <th className="px-4 py-3 text-left font-medium">CGPA</th>
                                   <th className="px-4 py-3 text-left font-medium">Applied On</th>
                                  <th className="px-4 py-3 text-left font-medium">Exception?</th>
                                  <th className="px-4 py-3 text-left font-medium">Reason</th>
                                  {selectedJob?.customForm && selectedJob.customForm.map((f: any) => (
                                    <th key={f.id} className="px-4 py-3 text-left font-medium">{f.label}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {applicants.map(a => (
                                  <tr key={a.id} className={cn("hover:bg-slate-50", a.isException && "bg-yellow-100/50 hover:bg-yellow-100")}>
                                    <td className="px-4 py-3 font-semibold flex items-center gap-2">
                                      {a.student.user.name}
                                      {a.isException && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded border border-amber-200 uppercase font-black">Exception</span>}
                                    </td>
                                    <td className="px-4 py-3">{a.student.rollNumber}</td>
                                    <td className="px-4 py-3">{a.student.department}</td>
                                    <td className="px-4 py-3 text-emerald-600 font-bold">{a.student.cgpa}</td>
                                    <td className="px-4 py-3 text-slate-400">{new Date(a.appliedAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                      {a.isException ? <span className="text-amber-600 font-bold">YES</span> : "NO"}
                                    </td>
                                    <td className="px-4 py-3 text-xs max-w-[150px] truncate" title={a.exceptionReason}>
                                      {a.exceptionReason || "-"}
                                    </td>
                                    {selectedJob?.customForm && selectedJob.customForm.map((f: any) => (
                                      <td key={f.id} className="px-4 py-3 text-slate-600">
                                        {a.answers && a.answers[f.id] ? a.answers[f.id] : "-"}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
