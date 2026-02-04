"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaBuilding, FaUserGraduate, FaUserTie, FaSignInAlt, FaUserPlus } from "react-icons/fa";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <header className="fixed w-full bg-white/80 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="p-2 bg-blue-600 rounded-lg">
              <FaBuilding className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Placement Portal
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-1">
            {['Home', 'About', 'Contact', 'Help'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="ghost" asChild>
              <Link href="/sign-in" className="flex items-center gap-2">
                <FaSignInAlt /> Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up" className="flex items-center gap-2">
                <FaUserPlus /> Sign Up
              </Link>
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-slate-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to the <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Placement Portal</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-slate-600 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Streamlining the recruitment process for students, placement officers, and companies. 
            Connect, apply, and manage placements seamlessly.
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" asChild>
              <Link href="/sign-up" className="text-lg px-8 py-6">
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </motion.div>

          {/* Role-based Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <FaUserGraduate className="h-12 w-12 mb-4 text-blue-600" />,
                title: "For Students",
                description: "Find and apply to job opportunities, track applications, and get placement assistance.",
                link: "/sign-up/student"
              },
              {
                icon: <FaUserTie className="h-12 w-12 mb-4 text-blue-600" />,
                title: "For Placement Officers",
                description: "Manage student records, coordinate with companies, and track placement statistics.",
                link: "/sign-up/officer"
              },
              {
                icon: <FaBuilding className="h-12 w-12 mb-4 text-blue-600" />,
                title: "For Admin",
                description: "Oversee the entire placement process, manage users, and generate reports.",
                link: "/sign-up/admin"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-center">{feature.title}</CardTitle>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-center">
                    <Button variant="outline" asChild>
                      <Link href={feature.link}>Get Started</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FaBuilding className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Placement Portal
                </span>
              </div>
              <p className="mt-2 text-slate-600">Empowering your career journey</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Placement Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}