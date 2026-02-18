"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditableText from "@/components/admin/EditableText";
import ImageUploader from "@/components/admin/ImageUploader";
import { HeroData } from "@/types";
// Імпорт частинок
import ParticlesContainer from "@/components/ui/ParticlesContainer";

interface ExtendedHeroData extends HeroData {
    techStack?: string;
}

const DEFAULT_STACK = "React, Next.js, TypeScript, TailwindCSS, Firebase, Figma, Node.js, Git";

export default function Hero({ isAdmin }: { isAdmin: boolean }) {
    // ... (весь твій код зі станом data і useEffect залишається без змін) ...
    const [data, setData] = useState<ExtendedHeroData>({
        title: "Full-Stack Developer",
        subtitle: "Створюю цифрові рішення",
        description: "Я розробляю сучасні веб-додатки...",
        imageUrl: "",
        techStack: DEFAULT_STACK,
    });

    // ... (handleSave і useEffect без змін) ...
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "content", "hero"), (docSnap) => {
            if (docSnap.exists()) {
                const docData = docSnap.data() as ExtendedHeroData;
                setData({ ...docData, techStack: docData.techStack || DEFAULT_STACK });
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async (key: keyof ExtendedHeroData, value: string) => {
        const newData = { ...data, [key]: value };
        setData(newData);
        await setDoc(doc(db, "content", "hero"), newData, { merge: true });
    };

    const techArray = (data.techStack || DEFAULT_STACK).split(",").map(t => t.trim());
    const marqueeItems = [...techArray, ...techArray, ...techArray, ...techArray];

    return (
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-32 pb-20">

            {/* 2. ЧАСТИНКИ (Абсолютне позиціонування на фоні секції) */}
            <div className="absolute inset-0 z-0">
                <ParticlesContainer />
            </div>

            {/* Основний контент (z-10 щоб був над частинками) */}
            <div className="px-6 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full z-10">

                {/* ... (Всі твої тексти і фото залишаються без змін) ... */}
                {/* Текст */}
                <div className="space-y-8 relative z-20">
                    <h2 className="text-lg md:text-xl text-sky-400 font-bold tracking-widest uppercase">
                        <EditableText initialValue={data.subtitle} isEditing={isAdmin} onSave={(val) => handleSave("subtitle", val)} />
                    </h2>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                        <EditableText initialValue={data.title} isEditing={isAdmin} onSave={(val) => handleSave("title", val)} />
                    </h1>

                    <div className="text-lg text-slate-300 leading-relaxed max-w-lg border-l-4 border-sky-500 pl-6 bg-white/5 py-2 rounded-r-lg backdrop-blur-sm">
                        <EditableText initialValue={data.description} isEditing={isAdmin} onSave={(val) => handleSave("description", val)} multiline />
                    </div>
                </div>

                {/* Фото */}
                <div className="flex justify-center lg:justify-end relative z-10">
                    <div className="w-full max-w-[400px] aspect-square glass-panel rounded-[2rem] overflow-hidden relative border border-white/10 shadow-2xl">
                        <div className="absolute inset-0 bg-slate-800/50"></div>
                        <ImageUploader
                            currentImageUrl={data.imageUrl}
                            isEditing={isAdmin}
                            onSave={(url) => handleSave("imageUrl", url)}
                            className="w-full h-full object-cover relative z-10"
                        />
                    </div>
                </div>
            </div>

            {/* MARQUEE (z-20 щоб був над усім) */}
            <div className="w-full mt-auto pt-20 pb-10 z-20 relative">
                {isAdmin && (
                    <div className="max-w-7xl mx-auto px-6 mb-2">
                        <span className="text-xs text-sky-400 mb-1 block">Редагувати список технологій (через кому):</span>
                        <EditableText
                            initialValue={data.techStack || ""}
                            isEditing={true}
                            onSave={(val) => handleSave("techStack", val)}
                            className="w-full bg-slate-800 border border-sky-500/50 p-2 rounded text-sm text-white"
                        />
                    </div>
                )}

                <div className="border-t border-white/5 bg-black/20 overflow-hidden relative h-24 flex items-center backdrop-blur-sm">
                    <div className="flex w-max animate-scroll gap-16 items-center">
                        {marqueeItems.map((tech, i) => (
                            <span key={i} className="text-4xl md:text-6xl font-bold text-white/10 uppercase whitespace-nowrap select-none">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}