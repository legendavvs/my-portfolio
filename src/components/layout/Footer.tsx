"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mail, Send, Linkedin, Github } from "lucide-react"; // Іконки
import EditableText from "@/components/admin/EditableText";

// Тип даних для контактів
interface ContactData {
    email: string;
    telegram: string;
    linkedin: string;
    github: string;
    copyright: string;
}

const DEFAULT_DATA: ContactData = {
    email: "email@example.com",
    telegram: "https://t.me/username",
    linkedin: "https://linkedin.com/in/username",
    github: "https://github.com/username",
    copyright: "© 2026 Всі права захищено",
};

export default function Footer({ isAdmin }: { isAdmin: boolean }) {
    const [data, setData] = useState<ContactData>(DEFAULT_DATA);

    // 1. Завантаження даних
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "content", "contact"), (docSnap) => {
            if (docSnap.exists()) {
                setData(docSnap.data() as ContactData);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Збереження
    const handleSave = async (key: keyof ContactData, value: string) => {
        const newData = { ...data, [key]: value };
        setData(newData);
        try {
            await setDoc(doc(db, "content", "contact"), newData, { merge: true });
        } catch (e) {
            console.error("Save error:", e);
        }
    };

    return (
        <footer id="contact" className="bg-black text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 md:px-20 flex flex-col md:flex-row justify-between items-center gap-8">

                {/* ЛІВА ЧАСТИНА: Копірайт */}
                <div className="text-gray-400 text-sm">
                    <EditableText
                        initialValue={data.copyright}
                        isEditing={isAdmin}
                        onSave={(val) => handleSave("copyright", val)}
                    />
                </div>

                {/* ПРАВА ЧАСТИНА: Соцмережі та контакти */}
                <div className="flex flex-col md:flex-row gap-6 items-center">

                    {/* Email */}
                    <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <Mail size={18} />
                        {isAdmin ? (
                            <EditableText
                                initialValue={data.email}
                                isEditing={true}
                                onSave={(val) => handleSave("email", val)}
                                className="bg-gray-800 text-white border-none"
                            />
                        ) : (
                            <a href={`mailto:${data.email}`}>{data.email}</a>
                        )}
                    </div>

                    {/* Telegram */}
                    <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <Send size={18} />
                        {isAdmin ? (
                            <EditableText
                                initialValue={data.telegram}
                                isEditing={true}
                                onSave={(val) => handleSave("telegram", val)}
                                className="bg-gray-800 text-white border-none w-32"
                            />
                        ) : (
                            <a href={data.telegram} target="_blank" rel="noreferrer">Telegram</a>
                        )}
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <Linkedin size={18} />
                        {isAdmin ? (
                            <EditableText
                                initialValue={data.linkedin}
                                isEditing={true}
                                onSave={(val) => handleSave("linkedin", val)}
                                className="bg-gray-800 text-white border-none w-32"
                            />
                        ) : (
                            <a href={data.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                        )}
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <Github size={18} />
                        {isAdmin ? (
                            <EditableText
                                initialValue={data.github}
                                isEditing={true}
                                onSave={(val) => handleSave("github", val)}
                                className="bg-gray-800 text-white border-none w-32"
                            />
                        ) : (
                            <a href={data.github} target="_blank" rel="noreferrer">GitHub</a>
                        )}
                    </div>

                </div>
            </div>
        </footer>
    );
}