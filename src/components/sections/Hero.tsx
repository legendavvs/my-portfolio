"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditableText from "@/components/admin/EditableText";
import ImageUploader from "@/components/admin/ImageUploader"; // Імпортуємо новинку
import { HeroData } from "@/types";

const DEFAULT_DATA: HeroData = {
    title: "Привіт, я Розробник 👋",
    subtitle: "Frontend & Creative Developer",
    description: "Я створюю сучасні веб-сайти...",
    imageUrl: "", // Початкове пусте фото
};

export default function Hero({ isAdmin }: { isAdmin: boolean }) {
    const [data, setData] = useState<HeroData>(DEFAULT_DATA);
    const [loading, setLoading] = useState(true);

    // Завантаження даних
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "content", "hero"), (docSnap) => {
            if (docSnap.exists()) {
                setData(docSnap.data() as HeroData);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Збереження (універсальне)
    const handleSave = async (key: keyof HeroData, value: string) => {
        // 1. Оновлюємо інтерфейс миттєво
        const newData = { ...data, [key]: value };
        setData(newData);

        // 2. Відправляємо в базу
        try {
            await setDoc(doc(db, "content", "hero"), newData, { merge: true });
        } catch (e) {
            console.error("Save error:", e);
        }
    };

    if (loading) return <div className="p-20 text-center">Завантаження...</div>;

    return (
        <section className="min-h-screen flex items-center justify-center px-6 md:px-20 max-w-7xl mx-auto py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">

                {/* ЛІВА КОЛОНКА: Текст */}
                <div className="space-y-6 order-2 md:order-1">
                    <h2 className="text-2xl md:text-3xl text-blue-600 font-medium">
                        <EditableText
                            initialValue={data.subtitle}
                            isEditing={isAdmin}
                            onSave={(val) => handleSave("subtitle", val)}
                        />
                    </h2>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                        <EditableText
                            initialValue={data.title}
                            isEditing={isAdmin}
                            onSave={(val) => handleSave("title", val)}
                        />
                    </h1>

                    <div className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                        <EditableText
                            initialValue={data.description}
                            isEditing={isAdmin}
                            onSave={(val) => handleSave("description", val)}
                            multiline
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button className="px-8 py-3 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform">
                            Проекти
                        </button>
                        <button className="px-8 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors">
                            Зв'язатись
                        </button>
                    </div>
                </div>

                {/* ПРАВА КОЛОНКА: Фото */}
                <div className="order-1 md:order-2 flex justify-center md:justify-end">
                    <div className="w-full max-w-md aspect-square">
                        {/* aspect-square робить блок квадратним */}
                        <ImageUploader
                            currentImageUrl={data.imageUrl}
                            isEditing={isAdmin}
                            onSave={(url) => handleSave("imageUrl", url)}
                            className="w-full h-full object-cover rounded-3xl shadow-2xl"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}