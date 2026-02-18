"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";

interface EditableTextProps {
    initialValue: string;
    isEditing: boolean;
    onSave: (newValue: string) => void;
    className?: string;
    multiline?: boolean;
    // ДОДАНО: Типізація для onClick
    onClick?: (e: React.MouseEvent) => void;
}

export default function EditableText({
    initialValue,
    isEditing,
    onSave,
    className,
    multiline = false,
    onClick, // ДОДАНО: Деструктуризація
}: EditableTextProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    if (isEditing) {
        const commonClasses = clsx(
            "w-full bg-slate-800/50 border-b-2 border-sky-500 text-white px-2 py-1 outline-none transition-all focus:bg-slate-800",
            className
        );

        if (multiline) {
            return (
                <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={() => onSave(value)}
                    // ДОДАНО: Передаємо клік далі
                    onClick={onClick}
                    className={clsx(commonClasses, "rounded-lg border-2 border-dashed border-slate-600 focus:border-sky-500")}
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
                // ДОДАНО: Передаємо клік далі
                onClick={onClick}
                className={commonClasses}
            />
        );
    }

    // ДОДАНО: Передаємо клік і сюди (для span)
    return <span className={className} onClick={onClick}>{value}</span>;
}