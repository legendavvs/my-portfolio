"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";

interface EditableTextProps {
    initialValue: string;
    isEditing: boolean; // Чи включений режим редагування
    onSave: (newValue: string) => void; // Функція, яка спрацює при збереженні
    className?: string; // Класи для стилізації (розмір шрифту, колір)
    multiline?: boolean; // Чи це великий текст (textarea) чи малий (input)
}

export default function EditableText({
    initialValue,
    isEditing,
    onSave,
    className,
    multiline = false,
}: EditableTextProps) {
    const [value, setValue] = useState(initialValue);

    // Оновлюємо локальний стейт, якщо дані прийшли з бази
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={() => onSave(value)} // Зберігаємо, коли клікнули повз
                    className={clsx(
                        "w-full border-2 border-dashed border-blue-400 bg-blue-50 p-2 outline-none rounded transition-all",
                        className
                    )}
                    rows={4}
                />
            );
        }

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => onSave(value)}
                className={clsx(
                    "min-w-[100px] border-b-2 border-dashed border-blue-400 bg-blue-50 px-1 outline-none transition-all",
                    className
                )}
            />
        );
    }

    // Режим перегляду (звичайний текст)
    return <span className={className}>{value}</span>;
}