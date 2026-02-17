"use client";

import { useAuth } from "@/context/AuthContext";
import Hero from "@/components/sections/Hero";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/layout/Footer";
import { LogOut } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const isAdmin = !!user;

  return (
    <main className="relative min-h-screen">
      
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 glass-panel px-4 py-2 rounded-full flex items-center gap-3 text-sm text-white backdrop-blur-md border border-white/10">
          <span className="text-sky-400 font-bold">● Admin Mode</span>
          <button onClick={logout} className="flex items-center gap-2 hover:text-red-400 transition ml-2">
            <LogOut size={16} /> Вийти
          </button>
        </div>
      )}

      <Hero isAdmin={isAdmin} />
      {/* ПЕРЕДАЄМО isAdmin СЮДИ: */}
      <Skills isAdmin={isAdmin} />      
      <Experience isAdmin={isAdmin} />  
      
      <Projects isAdmin={isAdmin} />
      <Footer isAdmin={isAdmin} /> 
    </main>
  );
}