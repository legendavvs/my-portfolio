"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus } from "lucide-react";
import ProjectCard from "@/components/ui/ProjectCard";
import { Project } from "@/types";
import EditableText from "@/components/admin/EditableText";

export default function Projects({ isAdmin }: { isAdmin: boolean }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [sectionTitle, setSectionTitle] = useState("Обрані роботи");

    // 1. Завантажуємо проекти з бази
    useEffect(() => {
        // Сортуємо за датою створення (якщо поле є) або просто беремо всі
        const q = query(collection(db, "projects"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];
            setProjects(projectsData);
        });

        return () => unsubscribe();
    }, []);

    // 2. Додавання нового (пустого) проекту
    const handleAddProject = async () => {
        const newProject: Omit<Project, "id"> = {
            title: "Новий Проект",
            description: "Короткий опис проекту...",
            tags: ["React", "Demo"],
            imageUrl: "", // Пусте фото
            link: "#",
            githubLink: "#",
        };

        try {
            await addDoc(collection(db, "projects"), newProject);
        } catch (e) {
            console.error("Error adding project:", e);
            alert("Помилка створення проекту");
        }
    };

    return (
        <section className="py-20 px-6 md:px-20 max-w-7xl mx-auto bg-white" id="projects">
            {/* Заголовок секції */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        {isAdmin ? (
                            <EditableText
                                initialValue={sectionTitle}
                                isEditing={true}
                                onSave={setSectionTitle} // Тут можна теж зберегти в базу, якщо хочеш
                            />
                        ) : sectionTitle}
                    </h2>
                    <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
                </div>

                {/* Кнопка додавання (Тільки Адмін) */}
                {isAdmin && (
                    <button
                        onClick={handleAddProject}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-lg"
                    >
                        <Plus size={20} />
                        Додати проект
                    </button>
                )}
            </div>

            {/* Сітка проектів */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <ProjectCard key={project.id} data={project} isAdmin={isAdmin} />
                ))}
            </div>

            {/* Якщо проектів немає */}
            {projects.length === 0 && (
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed">
                    <p>Проектів поки немає. Додай перший!</p>
                </div>
            )}
        </section>
    );
}