"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
    useEffect(() => {
        // Ініціалізація Lenis
        const lenis = new Lenis({
            duration: 1.2, // Тривалість інерції (чим більше, тим плавніше)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Функція плавності
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            touchMultiplier: 2, // Чутливість на тачпадах
        });

        // Цикл анімації (requestAnimationFrame)
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Очистка при виході
        return () => {
            lenis.destroy();
        };
    }, []);

    return null; // Цей компонент нічого не рендерить візуально
}