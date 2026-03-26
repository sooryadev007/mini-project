"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaUserGraduate,
  FaUserTie,
  FaUserShield,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaInfoCircle,
  FaGraduationCap,
  FaGlobe,
  FaQuestionCircle
} from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function Home() {
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Login successful!");
        if (role === "ADMIN") router.push("/admin");
        else if (role === "PLACEMENT_OFFICER") router.push("/placement-officers");
        else router.push("/students");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
      {/* Background with subtle overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center brightness-75 transition-all duration-1000"
        style={{ backgroundImage: "url('/college.jpeg')" }}
      />
      <div className="absolute inset-0 z-0 bg-slate-900/40" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Section: Hero Text */}
        <motion.div
          className="text-white max-w-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-8">
            Empowering <br />
            Your <span className="text-blue-300">Career</span> <br />
            <span className="text-blue-400">Odyssey.</span>
          </h1>
          <p className="text-xl text-slate-200 mb-10 leading-relaxed max-w-lg">
            The EduPlacement Portal serves as the bridge between academic excellence and global professional opportunities.
          </p>

          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-fit border border-white/20 shadow-xl">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <FaGraduationCap className="text-2xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-300 uppercase tracking-widest font-semibold">Academic Session</p>
              <p className="text-lg font-bold text-white tracking-wide">2026-2027</p>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Login Card */}
        <motion.div
          className="w-full max-w-[480px]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-[#f0f2f5] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50">
            <div className="p-10">
              {/* Header Icon & Title */}
              <div className="flex flex-col items-center mb-10">
                <div className="bg-[#0f2a4a] p-4 rounded-2xl shadow-lg mb-4">
                  <FaUserTie className="text-3xl text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[#0f2a4a]">EduPlacement</h2>
                <p className="text-slate-500 font-medium mt-1">Institutional Career Services</p>
              </div>

              {/* Role Selection Tabs */}
              <div className="bg-slate-200/50 p-1 rounded-2xl flex mb-10 shadow-inner">
                {[
                  { id: "STUDENT", label: "Student", icon: FaUserGraduate },
                  { id: "PLACEMENT_OFFICER", label: "Placement Officer", icon: FaUserTie },
                  { id: "ADMIN", label: "Admin", icon: FaUserShield }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 ${role === item.id
                      ? "bg-white text-[#0f2a4a] shadow-lg scale-100"
                      : "text-slate-500 hover:text-[#0f2a4a] hover:bg-white/40 scale-[0.98]"
                      }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 ml-1">
                    University Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-slate-400 group-focus-within:text-[#0f2a4a] transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-white/70 border-none rounded-2xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#0f2a4a] focus:bg-white transition-all shadow-sm"
                      placeholder="student@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-3 ml-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-slate-400 group-focus-within:text-[#0f2a4a] transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-4 bg-white/70 border-none rounded-2xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#0f2a4a] focus:bg-white transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0f2a4a]"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 py-5 bg-[#0f2a4a] text-white rounded-2xl font-bold text-lg hover:bg-[#1a3a5a] transition-all active:scale-[0.98] shadow-xl disabled:opacity-70 group"
                >
                  <span>{isLoading ? "Verifying..." : "Access Portal"}</span>
                  {!isLoading && <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />}
                </button>
              </form>



              {/* Additional Link for other roles */}
              {(role === "ADMIN" || role === "PLACEMENT_OFFICER") && (
                <div className="mt-6 text-center">


                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-200/30 px-10 py-5 flex justify-between items-center border-t border-slate-200/60">
              <button className="flex items-center space-x-2 text-slate-500 hover:text-[#0f2a4a] transition-colors group">
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Language Icon */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-white p-4 rounded-2xl shadow-2xl text-[#0f2a4a] hover:scale-110 active:scale-95 transition-all">
          <FaGlobe className="text-xl" />
        </button>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-slate-500/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}