"use client";

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, ExternalLink, Github, X, Maximize2 } from "lucide-react"; // Додав іконки
import EditableText from "@/components/admin/EditableText";
import ImageUploader from "@/components/admin/ImageUploader";
import { Project } from "@/types";
import { createPortal } from "react-dom"; // Для модального вікна

interface ProjectCardProps {
    data: Project;
    isAdmin: boolean;
}

// Додаємо нові поля до типу Project локально, якщо їх немає в types.ts
// (Бажано потім додати їх в types.ts: problem?: string; solution?: string; features?: string;)
interface ExtendedProject extends Project {
    problem?: string;
    solution?: string;
    features?: string;
}

export default function ProjectCard({ data, isAdmin }: ProjectCardProps) {
    const [project, setProject] = useState<ExtendedProject>(data);
    const [isOpen, setIsOpen] = useState(false); // Стан відкриття модалки

    const handleSave = async (key: keyof ExtendedProject, value: string) => {
        const newData = { ...project, [key]: value };
        setProject(newData);
        try {
            await updateDoc(doc(db, "projects", project.id), { [key]: value });
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Щоб не відкривалась модалка при видаленні
        if (confirm("Точно видалити?")) await deleteDoc(doc(db, "projects", project.id));
    };

    // Блокуємо скрол сторінки, коли відкрито модалку
    const toggleModal = () => {
        setIsOpen(!isOpen);
        document.body.style.overflow = !isOpen ? "hidden" : "auto";
    };

    return (
        <>
            {/* --- КАРТКА (ПРЕВ'Ю) --- */}
            <div 
                onClick={toggleModal}
                className="group relative glass-panel rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            >
                {/* Картинка */}
                <div className="aspect-video w-full bg-slate-900 relative">
                    <ImageUploader
                        currentImageUrl={project.imageUrl}
                        isEditing={isAdmin}
                        onSave={(url) => handleSave("imageUrl", url)}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    
                    {/* Кнопка "Розгорнути" (для візуальної підказки) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 pointer-events-none">
                        <span className="flex items-center gap-2 text-white font-bold bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <Maximize2 size={16} /> Детальніше
                        </span>
                    </div>

                    {isAdmin && (
                        <button onClick={handleDelete} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg z-20 hover:bg-red-600 transition">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Контент картки */}
                <div className="p-6 flex flex-col grow space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                        <EditableText 
                            initialValue={project.title} 
                            isEditing={isAdmin} 
                            onSave={(val) => handleSave("title", val)} 
                            onClick={(e) => e.stopPropagation()} // Щоб редагування не відкривало модалку
                        />
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        {isAdmin ? (
                            <EditableText
                                initialValue={project.tags.join(", ")}
                                isEditing={true}
                                onSave={(val) => handleSave("tags", val.split(",").map(t => t.trim()) as any)}
                                className="text-sm text-sky-400 w-full bg-white/5 p-1 rounded"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            project.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs rounded-full font-medium tracking-wide">
                                    {tag}
                                </span>
                            ))
                        )}
                    </div>

                    <div className="text-slate-400 text-sm leading-relaxed grow line-clamp-3">
                        <EditableText 
                            initialValue={project.description} 
                            isEditing={isAdmin} 
                            onSave={(val) => handleSave("description", val)} 
                            multiline 
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Посилання (футер картки) */}
                    <div className="pt-4 border-t border-white/10 flex gap-4 mt-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 text-sm font-bold text-sky-400 hover:text-white transition-colors">
                            <ExternalLink size={18} />
                            {isAdmin ? (
                                <EditableText initialValue={project.link} isEditing={true} onSave={(val) => handleSave("link", val)} className="w-full min-w-[100px]" />
                            ) : (
                                <a href={project.link} target="_blank" className="hover:underline decoration-sky-500/50 underline-offset-4">Live Demo</a>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors ml-auto">
                            <Github size={18} />
                            {isAdmin ? (
                                <EditableText initialValue={project.githubLink || ""} isEditing={true} onSave={(val) => handleSave("githubLink", val)} className="w-20" />
                            ) : (
                                project.githubLink && <a href={project.githubLink} target="_blank" className="hover:underline underline-offset-4">Code</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- МОДАЛЬНЕ ВІКНО (ПОВНИЙ ОПИС) --- */}
            {isOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Затемнення фону */}
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={toggleModal}
                    ></div>

                    {/* Контент модалки */}
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        
                        {/* Кнопка закриття */}
                        <button 
                            onClick={toggleModal} 
                            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-50"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col md:flex-row">
                            {/* Лівo: Картинка (велика) */}
                            <div className="w-full md:w-2/5 h-64 md:h-auto bg-slate-900 relative min-h-[300px]">
                                <ImageUploader
                                    currentImageUrl={project.imageUrl}
                                    isEditing={isAdmin}
                                    onSave={(url) => handleSave("imageUrl", url)}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Право: Детальний опис */}
                            <div className="w-full md:w-3/5 p-8 md:p-10 space-y-8 bg-[#0f172a]/80">
                                
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-sky-500/20 text-sky-300 text-xs rounded-full border border-sky-500/30">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-slate-300 leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                {/* --- НОВІ СЕКЦІЇ ДЛЯ КЕЙС-СТАДІ (РЕДАГУЮТЬСЯ) --- */}
                                
                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    {/* 1. Проблема */}
                                    <div>
                                        <h4 className="text-sky-400 font-bold uppercase text-sm tracking-wider mb-2">Проблема / Задача</h4>
                                        <div className="text-slate-300 text-sm leading-relaxed">
                                            <EditableText 
                                                initialValue={project.problem || "Опиши проблему, яку вирішував цей проект..."} 
                                                isEditing={isAdmin} 
                                                onSave={(val) => handleSave("problem", val)} 
                                                multiline 
                                                className="w-full min-h-[60px] border border-white/5 p-2 rounded hover:bg-white/5"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. Рішення */}
                                    <div>
                                        <h4 className="text-purple-400 font-bold uppercase text-sm tracking-wider mb-2">Технічне Рішення</h4>
                                        <div className="text-slate-300 text-sm leading-relaxed">
                                            <EditableText 
                                                initialValue={project.solution || "Які технології використав і чому..."} 
                                                isEditing={isAdmin} 
                                                onSave={(val) => handleSave("solution", val)} 
                                                multiline
                                                className="w-full min-h-[60px] border border-white/5 p-2 rounded hover:bg-white/5"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Фічі */}
                                    <div>
                                        <h4 className="text-emerald-400 font-bold uppercase text-sm tracking-wider mb-2">Ключові Фічі</h4>
                                        <div className="text-slate-300 text-sm leading-relaxed">
                                            <EditableText 
                                                initialValue={project.features || "Список головного функціоналу..."} 
                                                isEditing={isAdmin} 
                                                onSave={(val) => handleSave("features", val)} 
                                                multiline
                                                className="w-full min-h-[60px] border border-white/5 p-2 rounded hover:bg-white/5"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Кнопки дій */}
                                <div className="flex gap-4 pt-4">
                                    <a 
                                        href={project.link} 
                                        target="_blank" 
                                        className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                                    >
                                        <ExternalLink size={18} /> Дивитись Demo
                                    </a>
                                    {project.githubLink && (
                                        <a 
                                            href={project.githubLink} 
                                            target="_blank" 
                                            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition border border-white/10"
                                        >
                                            <Github size={18} /> Код
                                        </a>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}