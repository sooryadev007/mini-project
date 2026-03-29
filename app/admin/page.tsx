"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaArrowLeft, FaUserShield, FaUsersCog, FaPlus, FaTrash, FaSignOutAlt, FaImage, FaLink, FaEye, FaCheckCircle, FaTimesCircle, FaBullhorn, FaExternalLinkAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  placementOfficer?: {
    employeeId: string;
    department: string;
  };
  createdAt: string | Date;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"faculty" | "posters">("faculty");
  const [officers, setOfficers] = useState<UserRow[]>([]);
  const [posters, setPosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddPosterOpen, setIsAddPosterOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
  });
  const [newPoster, setNewPoster] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: ""
  });
  const [imageError, setImageError] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facRes, postRes] = await Promise.all([
        fetch("/api/admin/officers"),
        fetch("/api/posters")
      ]);
      const facData = await facRes.json();
      const postData = await postRes.json();
      
      setOfficers(facData.officers || []);
      setPosters(postData.posters || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOfficer),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddOpen(false);
        setNewOfficer({ name: "", email: "", password: "", employeeId: "", department: "" });
        fetchData();
      } else {
        setError(data.error || "Failed to add officer");
      }
    } catch (err) {
      setError("Failed to add officer");
    }
  };

  const handleDeleteOfficer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this placement officer?")) return;
    try {
      const res = await fetch("/api/admin/officers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert("Failed to delete officer");
    }
  };

  const handleAddPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPoster),
      });
      if (res.ok) {
        setShowCreator(false);
        setNewPoster({ title: "", description: "", imageUrl: "", link: "" });
        setImageError(false);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add poster");
      }
    } catch (err) {
      setError("Failed to add poster");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePoster = async (id: string) => {
    if (!confirm("Delete this poster?")) return;
    try {
      const res = await fetch(`/api/posters/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      alert("Failed to delete poster");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <FaArrowLeft /> Home
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-slate-900 font-semibold px-4 py-1.5 bg-purple-100 rounded-full text-sm">
              <FaUserShield className="text-purple-600" />
              Admin Portal
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-slate-600 hover:text-red-600 transition-colors">
            <FaSignOutAlt className="mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4 md:mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Placement Coordination</h1>
              <p className="mt-2 text-slate-600 text-base md:text-lg tracking-tight">Manage faculty roles and publish announcements posters.</p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-md p-1 rounded-2xl flex shadow-inner border border-white/50 w-full md:w-auto">
              <button 
                onClick={() => setActiveTab("faculty")}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === "faculty" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-purple-600"
                )}
              >
                Faculty
              </button>
              <button 
                onClick={() => setActiveTab("posters")}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === "posters" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-purple-600"
                )}
              >
                Posters
              </button>
            </div>
          </div>

          {activeTab === "faculty" ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                  <h2 className="text-xl font-bold">Placement Officers</h2>
                  <p className="text-sm text-slate-500">Add or remove faculty coordinators</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                      <FaPlus className="mr-2" /> Add Officer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Placement Officer</DialogTitle>
                      <DialogDescription>
                        Create a new account for a faculty member.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddOfficer}>
                      <div className="grid gap-4 py-4">
                        {error && <div className="p-2 text-xs bg-red-50 text-red-600 border border-red-100 rounded">{error}</div>}
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" value={newOfficer.name} onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={newOfficer.email} onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" value={newOfficer.password} onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="empId">Employee ID</Label>
                          <Input id="empId" value={newOfficer.employeeId} onChange={(e) => setNewOfficer({ ...newOfficer, employeeId: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dept">Department</Label>
                          <Input id="dept" value={newOfficer.department} onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })} required placeholder="e.g. CSE, IT" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full bg-purple-600">Create Officer</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md overflow-hidden">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-10 text-center text-slate-500">Loading faculty records...</div>
                  ) : officers.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">No placement officers found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-500 font-medium bg-slate-50/50">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Employee ID</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {officers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-900">{u.name}</div>
                                <div className="text-xs text-slate-400">{u.placementOfficer?.department || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{u.email}</td>
                              <td className="px-6 py-4 text-slate-600 font-mono text-xs">{u.placementOfficer?.employeeId || "N/A"}</td>
                              <td className="px-6 py-4 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteOfficer(u.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header bar */}
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                  <h2 className="text-xl font-bold">Announcement Posters</h2>
                  <p className="text-sm text-slate-500">{posters.length} poster{posters.length !== 1 ? "s" : ""} currently live on home page</p>
                </div>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 shadow-lg"
                  onClick={() => { setShowCreator(true); setError(""); }}
                >
                  <FaPlus className="mr-2" /> Create Poster
                </Button>
              </div>

              {/* Inline creator panel */}
              {showCreator && (
                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 p-2 rounded-xl">
                        <FaBullhorn className="text-white text-sm" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">New Announcement Poster</h3>
                        <p className="text-xs text-slate-500">Fill in the details and see a live preview</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowCreator(false); setNewPoster({ title: "", description: "", imageUrl: "", link: "" }); setImageError(false); }}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Left: Form */}
                    <div className="p-8 border-r border-slate-100">
                      <form onSubmit={handleAddPoster} className="space-y-5">
                        {error && (
                          <div className="p-3 text-sm bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center gap-2">
                            <FaTimesCircle className="shrink-0" /> {error}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Poster Title *</Label>
                          <Input
                            value={newPoster.title}
                            onChange={e => setNewPoster({...newPoster, title: e.target.value})}
                            placeholder="e.g. Google Drive – Batch 2026"
                            required
                            className="rounded-xl border-slate-200 focus:border-purple-400 h-12 text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
                          <Textarea
                            value={newPoster.description}
                            onChange={e => setNewPoster({...newPoster, description: e.target.value})}
                            placeholder="Brief subtitle or description shown below the title..."
                            className="rounded-xl border-slate-200 focus:border-purple-400 resize-none"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Image URL *</Label>
                          <div className="relative">
                            <FaImage className="absolute left-3.5 top-3.5 text-slate-400" />
                            <Input
                              value={newPoster.imageUrl}
                              onChange={e => { setNewPoster({...newPoster, imageUrl: e.target.value}); setImageError(false); }}
                              placeholder="https://example.com/poster.jpg"
                              required
                              className="pl-10 rounded-xl border-slate-200 focus:border-purple-400 h-12"
                            />
                            {newPoster.imageUrl && (
                              <div className="absolute right-3 top-3.5">
                                {imageError
                                  ? <FaTimesCircle className="text-red-400" title="Image failed to load" />
                                  : <FaCheckCircle className="text-green-400" title="Image loaded!" />
                                }
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">Paste any publicly accessible image URL. The live preview on the right will update instantly.</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Call-to-Action Link <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span></Label>
                          <div className="relative">
                            <FaLink className="absolute left-3.5 top-3.5 text-slate-400" />
                            <Input
                              value={newPoster.link}
                              onChange={e => setNewPoster({...newPoster, link: e.target.value})}
                              placeholder="e.g. /sign-in or https://company.com"
                              className="pl-10 rounded-xl border-slate-200 focus:border-purple-400 h-12"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-12"
                            onClick={() => { setShowCreator(false); setNewPoster({ title: "", description: "", imageUrl: "", link: "" }); setImageError(false); }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={submitting || !newPoster.title || !newPoster.imageUrl || imageError}
                            className="flex-1 rounded-xl h-12 bg-purple-600 hover:bg-purple-700 font-bold text-base"
                          >
                            {submitting ? "Publishing..." : "🚀 Publish Poster"}
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="p-8 bg-slate-50">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><FaEye /> Live Preview</p>
                      <div className="overflow-hidden rounded-2xl shadow-xl bg-white border border-slate-100 group">
                        {/* Image area */}
                        <div className="aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
                          {newPoster.imageUrl && !imageError ? (
                            <img
                              key={newPoster.imageUrl}
                              src={newPoster.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={() => setImageError(true)}
                              onLoad={() => setImageError(false)}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                              <FaImage className="text-4xl opacity-30" />
                              {imageError
                                ? <p className="text-xs text-red-400 font-medium">Could not load image. Check the URL.</p>
                                : <p className="text-xs">Image preview will appear here</p>
                              }
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                        </div>
                        {/* Info area */}
                        <div className="p-5">
                          <h3 className="font-bold text-slate-900 text-base truncate">
                            {newPoster.title || <span className="text-slate-300">Poster Title...</span>}
                          </h3>
                          {(newPoster.description || !newPoster.title) && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {newPoster.description || <span className="text-slate-200">Short description here...</span>}
                            </p>
                          )}
                          {newPoster.link && (
                            <span className="inline-flex items-center gap-1 mt-3 text-xs text-purple-500 font-semibold">
                              <FaExternalLinkAlt className="text-[9px]" /> {newPoster.link}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-4 text-center">This is how your poster will appear on the home page.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Posters Grid */}
              {!loading && posters.length === 0 && !showCreator ? (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <FaBullhorn className="mx-auto text-4xl text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No posters published yet.</p>
                  <p className="text-sm text-slate-400 mt-1">Click "Create Poster" above to get started.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? ([1,2,3].map(i => (
                    <div key={i} className="aspect-[16/9] rounded-3xl bg-slate-100 animate-pulse" />
                  ))) : (
                    posters.map(p => (
                      <Card key={p.id} className="overflow-hidden border-none shadow-lg group relative bg-white">
                        <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeletePoster(p.id)}
                            >
                              <FaTrash size={11} />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                          </div>
                        </div>
                        <CardHeader className="p-4 pb-3">
                          <CardTitle className="text-sm font-bold truncate">{p.title}</CardTitle>
                          {p.description && <CardDescription className="text-xs line-clamp-1">{p.description}</CardDescription>}
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
