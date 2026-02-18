"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function ParticlesContainer() {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            className="absolute inset-0 z-0 pointer-events-none" // z-0 щоб був під текстом, але над плямами
            options={{
                fullScreen: { enable: false }, // Важливо: false, щоб він сидів у батьківському блоці
                background: {
                    color: { value: "transparent" }, // Прозорий, бо у нас вже є градієнт
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "grab", // Ефект "павутинки" при наведенні
                        },
                        resize: true,
                    },
                    modes: {
                        grab: {
                            distance: 140,
                            links: { opacity: 0.5 },
                        },
                    },
                },
                particles: {
                    color: { value: "#ffffff" },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.1, // Ледь помітні лінії
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: { default: "bounce" },
                        random: true,
                        speed: 1, // Дуже повільний рух
                        straight: false,
                    },
                    number: {
                        density: { enable: true, area: 800 },
                        value: 60, // Кількість частинок (не став багато, щоб не лагало)
                    },
                    opacity: {
                        value: 0.1, // Дуже прозорі
                    },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 3 } },
                },
                detectRetina: true,
            }}
        />
    );
}