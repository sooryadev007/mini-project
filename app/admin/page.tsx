"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaArrowLeft, FaUserShield, FaUsersCog, FaPlus, FaTrash, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

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
  const [officers, setOfficers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/officers");
      const data = await res.json();
      if (res.ok) {
        setOfficers(data.officers || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
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
        fetchOfficers();
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
        fetchOfficers();
      }
    } catch (err) {
      alert("Failed to delete officer");
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
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Placement Coordination</h1>
              <p className="mt-2 text-slate-600 text-lg">Manage faculty roles and portal permissions.</p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                  <FaPlus className="mr-2" /> Add Placement Officer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Placement Officer</DialogTitle>
                  <DialogDescription>
                    Create a new account for a faculty member to manage placements.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddOfficer}>
                  <div className="grid gap-4 py-4">
                    {error && <div className="p-2 text-xs bg-red-50 text-red-600 border border-red-100 rounded">{error}</div>}
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newOfficer.name}
                        onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newOfficer.email}
                        onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newOfficer.password}
                        onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="empId">Employee ID</Label>
                      <Input
                        id="empId"
                        value={newOfficer.employeeId}
                        onChange={(e) => setNewOfficer({ ...newOfficer, employeeId: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dept">Department</Label>
                      <Input
                        id="dept"
                        value={newOfficer.department}
                        onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                        required
                        placeholder="e.g. CSE, IT"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">Create Officer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-white/80 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <FaUsersCog className="text-white" />
                </div>
                <div>
                  <CardTitle>Placement Officers</CardTitle>
                  <CardDescription>Accounts with management permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
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
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {officers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{u.name}</div>
                            <div className="text-xs text-slate-400">Added on {new Date(u.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{u.email}</td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">{u.placementOfficer?.employeeId || "N/A"}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold uppercase">
                              {u.placementOfficer?.department || "N/A"}
                            </span>
                          </td>
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
      </main>
    </div>
  );
}
