"use client";

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, ExternalLink, Github } from "lucide-react";
import EditableText from "@/components/admin/EditableText";
import ImageUploader from "@/components/admin/ImageUploader";
import { Project } from "@/types";

interface ProjectCardProps {
    data: Project;
    isAdmin: boolean;
}

export default function ProjectCard({ data, isAdmin }: ProjectCardProps) {
    const [project, setProject] = useState(data);

    const handleSave = async (key: keyof Project, value: string) => {
        const newData = { ...project, [key]: value };
        setProject(newData);
        try {
            const docRef = doc(db, "projects", project.id);
            await updateDoc(docRef, { [key]: value });
        } catch (e) {
            console.error("Error updating project:", e);
        }
    };

    const handleDelete = async () => {
        if (confirm("Точно видалити цей проект?")) {
            try {
                await deleteDoc(doc(db, "projects", project.id));
            } catch (e) {
                console.error("Error deleting:", e);
            }
        }
    };

    return (
        // БУЛО: bg-white -> СТАЛО: bg-slate-800 (Темна картка)
        // БУЛО: border-gray-100 -> СТАЛО: border-slate-700 (Темна рамка)
        <div className="group relative bg-slate-800 rounded-2xl shadow-lg shadow-black/20 border border-slate-700 hover:shadow-2xl hover:border-sky-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full">

            {/* 1. Картинка (фон заглушки змінив на темний bg-slate-900) */}
            <div className="aspect-video w-full bg-slate-900 relative">
                <ImageUploader
                    currentImageUrl={project.imageUrl}
                    isEditing={isAdmin}
                    onSave={(url) => handleSave("imageUrl", url)}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />

                {isAdmin && (
                    <button
                        onClick={handleDelete}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Видалити проект"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* 2. Контент картки */}
            <div className="p-6 flex flex-col flex-grow space-y-4">

                {/* Назва (Текст білий) */}
                <h3 className="text-xl font-bold text-white">
                    <EditableText
                        initialValue={project.title}
                        isEditing={isAdmin}
                        onSave={(val) => handleSave("title", val)}
                    />
                </h3>

                {/* Теги */}
                <div className="flex flex-wrap gap-2">
                    {isAdmin ? (
                        <div className="w-full">
                            <span className="text-xs text-slate-400 block mb-1">Теги (через кому):</span>
                            <EditableText
                                initialValue={project.tags.join(", ")}
                                isEditing={true}
                                onSave={(val) => handleSave("tags", val.split(",").map(t => t.trim()) as any)}
                                // Стиль інпуту тегів для адміна
                                className="text-sm text-sky-400 w-full bg-slate-900/50 p-1 rounded border border-slate-600"
                            />
                        </div>

                    ) : (
                        project.tags.map((tag, i) => (
                            // Бейджі: Темний фон, світлий текст
                            <span key={i} className="px-3 py-1 bg-slate-700 text-slate-200 text-xs rounded-full font-medium border border-slate-600">
                                {tag}
                            </span>
                        ))
                    )}
                </div>

                {/* Опис (Текст сірий) */}
                <div className="text-slate-300 text-sm leading-relaxed flex-grow">
                    <EditableText
                        initialValue={project.description}
                        isEditing={isAdmin}
                        onSave={(val) => handleSave("description", val)}
                        multiline
                    />
                </div>

                {/* Посилання (Футер) - Рамка зверху темна */}
                <div className="pt-4 border-t border-slate-700 flex gap-4 mt-auto">

                    {/* Посилання на сайт */}
                    <div className="flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">
                        <ExternalLink size={16} />
                        {isAdmin ? (
                            <EditableText
                                initialValue={project.link}
                                isEditing={true}
                                onSave={(val) => handleSave("link", val)}
                                className="w-full min-w-[100px]"
                            />
                        ) : (
                            <a href={project.link} target="_blank" className="hover:underline">Live Demo</a>
                        )}
                    </div>

                    {/* Посилання на GitHub */}
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors ml-auto">
                        <Github size={16} />
                        {isAdmin ? (
                            <EditableText
                                initialValue={project.githubLink || ""}
                                isEditing={true}
                                onSave={(val) => handleSave("githubLink", val)}
                                className="w-20"
                            />
                        ) : (
                            project.githubLink && <a href={project.githubLink} target="_blank" className="hover:underline">Code</a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}