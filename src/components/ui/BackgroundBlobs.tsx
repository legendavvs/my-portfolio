"use client";

export default function BackgroundBlobs() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
            {/* Пляма 1: Синя */}
            {/* БУЛО: opacity-40, СТАЛО: opacity-20 */}
            <div className="blob bg-blue-600 w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply opacity-10 animate-blob"></div>

            {/* Пляма 2: Фіолетова */}
            {/* БУЛО: opacity-40, СТАЛО: opacity-20 */}
            <div className="blob bg-purple-600 w-96 h-96 rounded-full top-0 -right-20 mix-blend-multiply opacity-10 animate-blob animation-delay-2000"></div>

            {/* Пляма 3: Рожева/Індиго */}
            {/* БУЛО: opacity-40, СТАЛО: opacity-20 */}
            <div className="blob bg-indigo-600 w-80 h-80 rounded-full bottom-0 left-1/2 -translate-x-1/2 mix-blend-multiply opacity-10 animate-blob animation-delay-4000"></div>
        </div>
    );
}