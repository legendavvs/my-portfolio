"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
    currentImageUrl?: string; // Поточне фото (якщо є)
    onSave: (url: string) => void; // Що робити, коли фото завантажилось
    isEditing: boolean; // Чи ми в адмінці
    className?: string; // Стилі розміру
}

export default function ImageUploader({
    currentImageUrl,
    onSave,
    isEditing,
    className = "w-full h-64",
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);

    // Логіка завантаження на Cloudinary
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            // Беремо дані з .env
            formData.append(
                "upload_preset",
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_preset"
            );

            try {
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const data = await res.json();
                if (data.secure_url) {
                    onSave(data.secure_url); // Зберігаємо посилання
                } else {
                    alert("Помилка Cloudinary: " + (data.error?.message || "Невідома помилка"));
                }
            } catch (error) {
                console.error("Upload error:", error);
                alert("Не вдалося завантажити фото");
            } finally {
                setUploading(false);
            }
        },
        [onSave]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: !isEditing || uploading,
        accept: { "image/*": [] }, // Приймаємо тільки картинки
        multiple: false,
    });

    // 1. Режим перегляду (не адмін)
    if (!isEditing) {
        if (!currentImageUrl) return null; // Якщо фото немає, нічого не показуємо
        return (
            <div className={`relative overflow-hidden rounded-2xl ${className}`}>
                <Image
                    src={currentImageUrl}
                    alt="Uploaded content"
                    fill
                    className="object-cover"
                />
            </div>
        );
    }

    // 2. Режим редагування (Drag & Drop)
    return (
        <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl flex items-center justify-center transition-all cursor-pointer group ${className} ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
        >
            <input {...getInputProps()} />

            {/* Якщо фото вже є, показуємо його на фоні */}
            {currentImageUrl && (
                <Image
                    src={currentImageUrl}
                    alt="Current"
                    fill
                    className={`object-cover transition-opacity ${isDragActive ? "opacity-50" : "opacity-40 group-hover:opacity-30"
                        }`}
                />
            )}

            {/* Індикатор завантаження або іконка */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
                {uploading ? (
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                ) : (
                    <>
                        <UploadCloud className="w-10 h-10 mb-2 text-gray-400 group-hover:text-blue-500" />
                        <p className="text-sm font-medium text-center px-4">
                            {isDragActive
                                ? "Кидай сюди!"
                                : "Перетягни фото або клікни"}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}