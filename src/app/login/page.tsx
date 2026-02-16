"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err) {
            setError("Невірний логін або пароль");
            console.error(err);
        }
    };

    return (
        // Темний фон на весь екран
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">

            {/* Темна картка форми */}
            <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-white">Вхід для Адміна</h1>

                {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-400/10 p-2 rounded">{error}</p>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-500 transition shadow-lg shadow-sky-900/20 mt-2"
                    >
                        Увійти
                    </button>
                </div>
            </form>
        </div>
    );
}