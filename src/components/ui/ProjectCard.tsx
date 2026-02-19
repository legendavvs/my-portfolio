"use client";

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
// Додав іконки Maximize і Monitor для перемикання режиму
import { Trash2, ExternalLink, Github, X, Maximize2, ChevronLeft, ChevronRight, Plus, Scan, Monitor } from "lucide-react";
import EditableText from "@/components/admin/EditableText";
import ImageUploader from "@/components/admin/ImageUploader";
import { Project } from "@/types";
import { createPortal } from "react-dom";

interface ProjectCardProps {
    data: Project;
    isAdmin: boolean;
}

interface ExtendedProject extends Project {
    problem?: string;
    solution?: string;
    features?: string;
    problemTitle?: string;
    solutionTitle?: string;
    featuresTitle?: string;
    galleryUrls?: string[];
    // ДОДАНО: Поле для налаштування відображення фото ('cover' - заповнити, 'contain' - вмістити)
    imageFit?: "cover" | "contain";
}

export default function ProjectCard({ data, isAdmin }: ProjectCardProps) {
    const [project, setProject] = useState<ExtendedProject>({
        ...data,
        imageFit: (data as ExtendedProject).imageFit || "cover" // За замовчуванням 'cover'
    });
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleSave = async (key: keyof ExtendedProject, value: any) => {
        const newData = { ...project, [key]: value };
        setProject(newData);
        try {
            await updateDoc(doc(db, "projects", project.id), { [key]: value });
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Точно видалити?")) await deleteDoc(doc(db, "projects", project.id));
    };

    const toggleModal = () => {
        setIsOpen(!isOpen);
        document.body.style.overflow = !isOpen ? "hidden" : "auto";
        if (!isOpen) setCurrentSlide(0);
    };

    // --- ЛОГІКА СЛАЙДЕРА ---

    const gallery = project.galleryUrls && project.galleryUrls.length > 0
        ? project.galleryUrls
        : [project.imageUrl];

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
    };

    const handleAddSlide = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentGallery = project.galleryUrls && project.galleryUrls.length > 0
            ? project.galleryUrls
            : [project.imageUrl];

        const newGallery = [...currentGallery, ""];
        await handleSave("galleryUrls", newGallery);
        setCurrentSlide(newGallery.length - 1);
    };

    const handleUpdateSlide = async (url: string, index: number) => {
        const currentGallery = project.galleryUrls && project.galleryUrls.length > 0
            ? [...project.galleryUrls]
            : [project.imageUrl];

        currentGallery[index] = url;
        await handleSave("galleryUrls", currentGallery);
    };

    const handleDeleteSlide = async (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        if (!confirm("Видалити це фото з галереї?")) return;
        const currentGallery = [...(project.galleryUrls || [])];
        currentGallery.splice(index, 1);
        await handleSave("galleryUrls", currentGallery);

        if (currentSlide >= currentGallery.length) {
            setCurrentSlide(Math.max(0, currentGallery.length - 1));
        }
    };

    // ДОДАНО: Функція перемикання режиму відображення
    const toggleImageFit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newFit = project.imageFit === "contain" ? "cover" : "contain";
        handleSave("imageFit", newFit);
    };

    return (
        <>
            {/* --- КАРТКА (ПРЕВ'Ю - БЕЗ ЗМІН) --- */}
            <div
                onClick={toggleModal}
                className="group relative glass-panel rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            >
                <div className="aspect-video w-full bg-slate-900 relative">
                    <ImageUploader
                        currentImageUrl={project.imageUrl}
                        isEditing={isAdmin}
                        onSave={(url) => handleSave("imageUrl", url)}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />

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

                <div className="p-6 flex flex-col grow space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                        <EditableText
                            initialValue={project.title}
                            isEditing={isAdmin}
                            onSave={(val) => handleSave("title", val)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        {isAdmin ? (
                            <EditableText
                                initialValue={project.tags.join(", ")}
                                isEditing={true}
                                onSave={(val) => handleSave("tags", val.split(",").map(t => t.trim()))}
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

            {/* --- МОДАЛЬНЕ ВІКНО --- */}
            {isOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={toggleModal}
                    ></div>

                    <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden glass-panel rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">

                        <button
                            onClick={toggleModal}
                            className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition z-50"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden">

                            {/* --- ЛІВО: СЛАЙДЕР ФОТОГРАФІЙ --- */}
                            <div className="w-full md:w-1/2 flex flex-col relative shrink-0 bg-slate-950">

                                {/* Зона картинки (Виправлено конфлікт висоти) */}
                                <div className="relative w-full h-[250px] sm:h-[300px] md:h-full flex-grow flex items-center justify-center overflow-hidden bg-black">

                                    {/* Примусовий вплив на тег img всередині ImageUploader */}
                                    <div className={`absolute inset-0 w-full h-full ${project.imageFit === "contain"
                                            ? "[&_img]:!object-contain [&_img]:!p-2"
                                            : "[&_img]:!object-cover"
                                        } transition-all duration-300`}>
                                        <ImageUploader
                                            currentImageUrl={gallery[currentSlide] || ""}
                                            isEditing={isAdmin}
                                            onSave={(url) => handleUpdateSlide(url, currentSlide)}
                                            className="w-full h-full"
                                        />
                                    </div>

                                    {/* Стрілочки навігації (Тепер завжди видимі) */}
                                    {gallery.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevSlide}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-sm transition z-10"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button
                                                onClick={nextSlide}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-sm transition z-10"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </>
                                    )}

                                    {isAdmin && project.galleryUrls && project.galleryUrls.length > 0 && (
                                        <button onClick={(e) => handleDeleteSlide(e, currentSlide)} className="absolute top-4 left-4 p-2 bg-red-500/80 text-white rounded-lg z-20 hover:bg-red-500 transition backdrop-blur-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Панель управління (Адмінка) та Індикатори */}
                                <div className="p-4 bg-slate-900 border-t border-white/5 flex items-center justify-between z-10 shrink-0">
                                    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                                        {gallery.map((_, i) => (
                                            <div
                                                key={i}
                                                onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                                                className={`w-2 h-2 rounded-full cursor-pointer transition-colors shrink-0 ${i === currentSlide ? 'bg-sky-400 scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                                            />
                                        ))}
                                    </div>

                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            {/* Кнопка перемикання режиму (Fit / Fill) */}
                                            <button
                                                onClick={toggleImageFit}
                                                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
                                                title={project.imageFit === "contain" ? "Розтягнути на весь екран" : "Вмістити повністю"}
                                            >
                                                {project.imageFit === "contain" ? <Maximize2 size={16} /> : <Scan size={16} />}
                                            </button>

                                            <button onClick={handleAddSlide} className="flex items-center gap-1.5 text-xs font-bold bg-sky-600/80 hover:bg-sky-500 text-white px-3 py-2 rounded-lg transition shadow-lg shrink-0">
                                                <Plus size={16} /> <span className="hidden sm:inline">Фото</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- ПРАВО: ДЕТАЛЬНИЙ ОПИС (БЕЗ ЗМІН) --- */}
                            <div className="w-full md:w-1/2 p-8 md:p-10 space-y-8 bg-[#0f172a]/95 md:overflow-y-auto">

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

                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <div>
                                        <h4 className="text-sky-400 font-bold uppercase text-sm tracking-wider mb-2">
                                            <EditableText
                                                initialValue={project.problemTitle || "Проблема / Задача"}
                                                isEditing={isAdmin}
                                                onSave={(val) => handleSave("problemTitle", val)}
                                            />
                                        </h4>
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

                                    <div>
                                        <h4 className="text-purple-400 font-bold uppercase text-sm tracking-wider mb-2">
                                            <EditableText
                                                initialValue={project.solutionTitle || "Технічне Рішення"}
                                                isEditing={isAdmin}
                                                onSave={(val) => handleSave("solutionTitle", val)}
                                            />
                                        </h4>
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

                                    <div>
                                        <h4 className="text-emerald-400 font-bold uppercase text-sm tracking-wider mb-2">
                                            <EditableText
                                                initialValue={project.featuresTitle || "Ключові Фічі"}
                                                isEditing={isAdmin}
                                                onSave={(val) => handleSave("featuresTitle", val)}
                                            />
                                        </h4>
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

                                <div className="flex gap-3 md:gap-4 pt-4">
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-2 md:py-3 rounded-lg md:rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm md:text-base shadow-lg shadow-sky-900/20"
                                    >
                                        <ExternalLink size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                        Дивитись Demo
                                    </a>

                                    {project.githubLink && (
                                        <a
                                            href={project.githubLink}
                                            target="_blank"
                                            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 md:py-3 rounded-lg md:rounded-xl font-bold flex items-center justify-center gap-2 transition border border-white/10 text-sm md:text-base"
                                        >
                                            <Github size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                            Код
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