"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus } from "lucide-react";
import ProjectCard from "@/components/ui/ProjectCard";
import { Project } from "@/types";
import EditableText from "@/components/admin/EditableText";

export default function Projects({ isAdmin }: { isAdmin: boolean }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [sectionTitle, setSectionTitle] = useState("Мої Проекти");

    useEffect(() => {
        const q = query(collection(db, "projects"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        });
        return () => unsubscribe();
    }, []);

    const handleAddProject = async () => {
        await addDoc(collection(db, "projects"), {
            title: "Новий Проект",
            description: "Опис проекту...",
            tags: ["Tech"],
            imageUrl: "",
            link: "#",
            githubLink: "#",
        });
    };

    return (
        // ЗМІНА ТУТ: Додав bg-slate-900, щоб точно було темно
        <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto bg-slate-900" id="projects">
            <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-8">
                <div>
                    {/* Заголовок тепер білий (text-slate-50) */}
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-50 mb-4">
                        {isAdmin ? (
                            <EditableText initialValue={sectionTitle} isEditing={true} onSave={setSectionTitle} />
                        ) : sectionTitle}
                    </h2>
                    <p className="text-slate-400 max-w-lg">Підбірка моїх найкращих робіт.</p>
                </div>

                {isAdmin && (
                    <button
                        onClick={handleAddProject}
                        className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition shadow-lg"
                    >
                        <Plus size={18} /> Додати проект
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <ProjectCard key={project.id} data={project} isAdmin={isAdmin} />
                ))}
            </div>
        </section>
    );
}