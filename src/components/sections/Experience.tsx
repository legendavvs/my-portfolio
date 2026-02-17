"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditableText from "@/components/admin/EditableText";
import { Plus, Trash2 } from "lucide-react";

interface ExperienceItem {
    id: string;
    year: string;
    title: string;
    desc: string;
    createdAt: number;
}

export default function Experience({ isAdmin }: { isAdmin?: boolean }) { // Додав isAdmin?
    const [items, setItems] = useState<ExperienceItem[]>([]);

    // 1. Завантаження (Сортуємо, щоб нові були зверху)
    useEffect(() => {
        const q = query(collection(db, "experience"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExperienceItem)));
        });
        return () => unsubscribe();
    }, []);

    // 2. Додавання
    const handleAdd = async () => {
        await addDoc(collection(db, "experience"), {
            year: "2026",
            title: "Нова посада",
            desc: "Опис обов'язків...",
            createdAt: Date.now(),
        });
    };

    // 3. Збереження тексту
    const handleSave = async (id: string, key: keyof ExperienceItem, value: string) => {
        await updateDoc(doc(db, "experience", id), { [key]: value });
    };

    // 4. Видалення
    const handleDelete = async (id: string) => {
        if (confirm("Видалити цей запис?")) {
            await deleteDoc(doc(db, "experience", id));
        }
    };

    return (
        <section className="py-24 px-6 md:px-20 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-16">
                <h2 className="text-4xl font-bold text-white text-center w-full">Шлях & Досвід</h2>
                {isAdmin && (
                    <button onClick={handleAdd} className="absolute right-6 md:right-20 p-2 bg-sky-600 rounded-full hover:bg-sky-500 transition shadow-lg">
                        <Plus size={24} text-white />
                    </button>
                )}
            </div>

            <div className="relative border-l-2 border-white/10 ml-4 space-y-12">
                {items.map((item) => (
                    <div key={item.id} className="relative pl-12 group">

                        {/* Точка на лінії */}
                        <div className="absolute left-[-9px] top-1 w-4 h-4 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.6)] border-4 border-[#0f172a]"></div>

                        {/* Рік (Редагується) */}
                        <div className="inline-block px-3 py-1 bg-sky-500/10 text-sky-400 text-sm font-bold rounded-full mb-3 border border-sky-500/20">
                            <EditableText initialValue={item.year} isEditing={!!isAdmin} onSave={(v) => handleSave(item.id, "year", v)} />
                        </div>

                        {/* Картка (Редагується) */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-all relative">
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                                <EditableText initialValue={item.title} isEditing={!!isAdmin} onSave={(v) => handleSave(item.id, "title", v)} />
                            </h3>
                            <div className="text-slate-400 text-sm leading-relaxed">
                                <EditableText initialValue={item.desc} isEditing={!!isAdmin} onSave={(v) => handleSave(item.id, "desc", v)} multiline />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}