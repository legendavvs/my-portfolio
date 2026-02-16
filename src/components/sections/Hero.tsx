"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditableText from "@/components/admin/EditableText";
import ImageUploader from "@/components/admin/ImageUploader";
import { HeroData } from "@/types";

const DEFAULT_DATA: HeroData = {
    title: "Full-Stack Developer",
    subtitle: "Створюю цифрові рішення",
    description: "Я розробляю сучасні веб-додатки, фокусуючись на швидкості, дизайні та зручності користування.",
    imageUrl: "",
};

export default function Hero({ isAdmin }: { isAdmin: boolean }) {
    const [data, setData] = useState<HeroData>(DEFAULT_DATA);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "content", "hero"), (docSnap) => {
            if (docSnap.exists()) setData(docSnap.data() as HeroData);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async (key: keyof HeroData, value: string) => {
        const newData = { ...data, [key]: value };
        setData(newData);
        await setDoc(doc(db, "content", "hero"), newData, { merge: true });
    };

    // Функція для плавного скролу до секцій
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center px-6 md:px-20 py-20 bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl w-full">

                {/* Текст */}
                <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl text-sky-400 font-semibold tracking-wide uppercase">
                        <EditableText
                            initialValue={data.subtitle}
                            isEditing={isAdmin}
                            onSave={(val) => handleSave("subtitle", val)}
                        />
                    </h2>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-50 leading-tight">
                        <EditableText
                            initialValue={data.title}
                            isEditing={isAdmin}
                            onSave={(val) => handleSave("title", val)}
                        />
                    </h1>

                    <div className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-lg">
                        <EditableText
                            initialValue={data.description}
                            isEditing={isAdmin}
                            onSave={(val) => handleSave("description", val)}
                            multiline
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => scrollToSection("projects")}
                            className="px-8 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-500 transition shadow-lg shadow-sky-900/20"
                        >
                            Мої роботи
                        </button>
                        <button
                            onClick={() => scrollToSection("contact")}
                            className="px-8 py-3 border border-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition"
                        >
                            Контакти
                        </button>
                    </div>
                </div>

                {/* Фото */}
                <div className="flex justify-center md:justify-end">
                    <div className="w-full max-w-md aspect-square bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-purple-500/10 pointer-events-none"></div>
                        <ImageUploader
                            currentImageUrl={data.imageUrl}
                            isEditing={isAdmin}
                            onSave={(url) => handleSave("imageUrl", url)}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}