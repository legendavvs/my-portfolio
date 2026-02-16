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

    // Функція збереження конкретного поля
    const handleSave = async (key: keyof Project, value: string) => {
        const newData = { ...project, [key]: value };
        setProject(newData); // Оновлюємо візуально

        try {
            const docRef = doc(db, "projects", project.id);
            await updateDoc(docRef, { [key]: value });
        } catch (e) {
            console.error("Error updating project:", e);
        }
    };

    // Функція видалення проекту
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
        <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">

            {/* 1. Картинка проекту */}
            <div className="aspect-video w-full bg-gray-50 relative">
                <ImageUploader
                    currentImageUrl={project.imageUrl}
                    isEditing={isAdmin}
                    onSave={(url) => handleSave("imageUrl", url)}
                    className="w-full h-full object-cover"
                />

                {/* Кнопка видалення (Тільки для адміна) */}
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

                {/* Назва */}
                <h3 className="text-xl font-bold text-gray-900">
                    <EditableText
                        initialValue={project.title}
                        isEditing={isAdmin}
                        onSave={(val) => handleSave("title", val)}
                    />
                </h3>

                {/* Теги (Вводимо через кому, відображаємо як бейджі) */}
                <div className="flex flex-wrap gap-2">
                    {isAdmin ? (
                        <div className="w-full">
                            <span className="text-xs text-gray-400 block mb-1">Теги (через кому):</span>
                            <EditableText
                                initialValue={project.tags.join(", ")}
                                isEditing={true}
                                onSave={(val) => handleSave("tags", val.split(",").map(t => t.trim()) as any)}
                                className="text-sm text-blue-600 w-full"
                            />
                        </div>

                    ) : (
                        project.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                {tag}
                            </span>
                        ))
                    )}
                </div>

                {/* Опис */}
                <div className="text-gray-600 text-sm leading-relaxed flex-grow">
                    <EditableText
                        initialValue={project.description}
                        isEditing={isAdmin}
                        onSave={(val) => handleSave("description", val)}
                        multiline
                    />
                </div>

                {/* Посилання (Футер картки) */}
                <div className="pt-4 border-t border-gray-100 flex gap-4 mt-auto">
                    {/* Посилання на сайт */}
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                        <ExternalLink size={16} />
                        {isAdmin ? (
                            <EditableText
                                initialValue={project.link}
                                isEditing={true}
                                onSave={(val) => handleSave("link", val)}
                                className="w-full"
                            />
                        ) : (
                            <a href={project.link} target="_blank" className="hover:underline">Live Demo</a>
                        )}
                    </div>

                    {/* Посилання на GitHub (опціонально) */}
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 ml-auto">
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