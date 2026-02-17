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
            await updateDoc(doc(db, "projects", project.id), { [key]: value });
        } catch (e) { console.error(e); }
    };

    const handleDelete = async () => {
        if (confirm("Точно видалити?")) await deleteDoc(doc(db, "projects", project.id));
    };

    return (
        <div className="group relative glass-panel rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2">

            {/* Картинка */}
            <div className="aspect-video w-full bg-slate-900 relative">
                <ImageUploader
                    currentImageUrl={project.imageUrl}
                    isEditing={isAdmin}
                    onSave={(url) => handleSave("imageUrl", url)}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                {isAdmin && (
                    <button onClick={handleDelete} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg z-20">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* Контент */}
            <div className="p-6 flex flex-col grow space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                    <EditableText initialValue={project.title} isEditing={isAdmin} onSave={(val) => handleSave("title", val)} />
                </h3>

                {/* ТЕГИ: Зробив фон світлішим (bg-sky-500/10) і текст яскравішим */}
                <div className="flex flex-wrap gap-2">
                    {isAdmin ? (
                        <EditableText
                            initialValue={project.tags.join(", ")}
                            isEditing={true}
                            onSave={(val) => handleSave("tags", val.split(",").map(t => t.trim()) as any)}
                            className="text-sm text-sky-400 w-full bg-white/5 p-1 rounded"
                        />
                    ) : (
                        project.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs rounded-full font-medium tracking-wide">
                                {tag}
                            </span>
                        ))
                    )}
                </div>

                <div className="text-slate-400 text-sm leading-relaxed grow">
                    <EditableText initialValue={project.description} isEditing={isAdmin} onSave={(val) => handleSave("description", val)} multiline />
                </div>

                {/* ПОСИЛАННЯ: Зробив яскравішими і помітнішими */}
                <div className="pt-4 border-t border-white/10 flex gap-4 mt-auto">
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
    );
}