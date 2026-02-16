"use client";

import { useAuth } from "@/context/AuthContext"; // <--- Беремо справжню авторизацію
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/layout/Footer";
import { LogOut } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth(); // Дістаємо юзера
  const isAdmin = !!user; // Якщо юзер є — значить це адмін (true), якщо ні — false

  return (
    <main className="relative min-h-screen bg-white">
      
      {/* Панель адміна (показуємо ТІЛЬКИ якщо залогінені) */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 text-sm border border-gray-700">
          <span className="text-green-400 font-bold">● Admin Mode</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 hover:text-red-400 transition-colors ml-2"
            title="Вийти"
          >
            <LogOut size={16} />
            Вийти
          </button>
        </div>
      )}

      {/* Передаємо статус адміна в компоненти */}
      <Hero isAdmin={isAdmin} />
      <Projects isAdmin={isAdmin} />
      <Footer isAdmin={isAdmin} /> 
    </main>
  );
}