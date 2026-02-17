"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditableText from "@/components/admin/EditableText";
import {
    Code, Database, Layout, Smartphone, Terminal,
    Cpu, Globe, Layers, Zap, PenTool, Server, Box
} from "lucide-react";
import { Plus, Trash2, Settings2 } from "lucide-react";

// 1. Мапа доступних іконок
const ICON_MAP: Record<string, any> = {
    Layout, Smartphone, Database, Code,
    Terminal, Cpu, Globe, Layers,
    Zap, PenTool, Server, Box
};

interface SkillItem {
    id: string;
    title: string;
    desc: string;
    iconName: string; // Зберігаємо назву іконки (наприклад, "Code")
    createdAt: number;
}

export default function Skills({ isAdmin }: { isAdmin?: boolean }) {
    const [items, setItems] = useState<SkillItem[]>([]);
    const [isEditingIcon, setIsEditingIcon] = useState<string | null>(null); // ID елемента, де міняємо іконку

    // Завантаження скілів
    useEffect(() => {
        const q = query(collection(db, "skills_list"), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillItem)));
        });
        return () => unsubscribe();
    }, []);

    // Додавання нового
    const handleAdd = async () => {
        await addDoc(collection(db, "skills_list"), {
            title: "Нова навичка",
            desc: "Опис навички...",
            iconName: "Code", // Стандартна іконка
            createdAt: Date.now(),
        });
    };

    // Збереження тексту
    const handleSave = async (id: string, key: keyof SkillItem, value: string) => {
        await updateDoc(doc(db, "skills_list", id), { [key]: value });
    };

    // Видалення
    const handleDelete = async (id: string) => {
        if (confirm("Видалити цю навичку?")) {
            await deleteDoc(doc(db, "skills_list", id));
        }
    };

    // Зміна іконки
    const handleChangeIcon = async (id: string, newIconName: string) => {
        await updateDoc(doc(db, "skills_list", id), { iconName: newIconName });
        setIsEditingIcon(null);
    };

    return (
        <section className="py-20 px-6 md:px-20 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-bold text-white">Мій Арсенал </h2>
                {isAdmin && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 rounded-lg text-white hover:bg-sky-500 transition shadow-lg"
                    >
                        <Plus size={20} /> <span className="hidden md:inline">Додати</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {items.map((item) => {
                    const IconComponent = ICON_MAP[item.iconName] || Code; // Фолбек на Code, якщо іконки немає

                    return (
                        <div key={item.id} className="glass-panel rounded-3xl p-8 flex flex-col justify-center hover:bg-white/5 transition group relative min-h-[220px]">

                            {/* --- HEADER КАРТКИ (Іконка + Кнопки) --- */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="relative">
                                    {/* Відображення іконки */}
                                    <div
                                        className={`p-3 bg-sky-500/10 rounded-xl text-sky-400 w-max border border-sky-500/20 ${isAdmin ? 'cursor-pointer hover:bg-sky-500/20' : ''}`}
                                        onClick={() => isAdmin && setIsEditingIcon(isEditingIcon === item.id ? null : item.id)}
                                        title={isAdmin ? "Клікніть, щоб змінити іконку" : ""}
                                    >
                                        <IconComponent size={32} />
                                    </div>

                                    {/* Меню вибору іконок (Випадає при кліку на іконку в адмінці) */}
                                    {isAdmin && isEditingIcon === item.id && (
                                        <div className="absolute top-14 left-0 w-64 bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-2xl z-50 grid grid-cols-4 gap-2">
                                            {Object.keys(ICON_MAP).map((iconKey) => {
                                                const Icon = ICON_MAP[iconKey];
                                                return (
                                                    <button
                                                        key={iconKey}
                                                        onClick={() => handleChangeIcon(item.id, iconKey)}
                                                        className={`p-2 rounded hover:bg-white/10 flex justify-center text-slate-300 hover:text-white ${item.iconName === iconKey ? 'bg-sky-600 text-white' : ''}`}
                                                        title={iconKey}
                                                    >
                                                        <Icon size={20} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Кнопка видалення */}
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition bg-white/5 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            {/* --- КОНТЕНТ --- */}
                            <h3 className="text-xl font-bold text-white mb-2">
                                <EditableText initialValue={item.title} isEditing={!!isAdmin} onSave={(v) => handleSave(item.id, "title", v)} />
                            </h3>

                            <div className="text-slate-400 text-sm leading-relaxed">
                                <EditableText initialValue={item.desc} isEditing={!!isAdmin} onSave={(v) => handleSave(item.id, "desc", v)} multiline />
                            </div>

                            {/* Підказка для адміна */}
                            {isAdmin && (
                                <div className="absolute bottom-2 right-4 text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition">
                                    Клікни іконку, щоб змінити
                                </div>
                            )}
                        </div>
                    );
                })}

            </div>
        </section>
    );
}