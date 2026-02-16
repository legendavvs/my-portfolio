"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Тип контексту
interface AuthContextType {
  user: User | null; // Об'єкт користувача або null
  loading: boolean;  // Чи ми ще перевіряємо
  logout: () => Promise<void>; // Функція виходу
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

// Хук, щоб легко використовувати це в будь-якому місці
export const useAuth = () => useContext(AuthContext);

// Провайдер (обгортка)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Слухаємо Firebase: зайшов хтось чи вийшов?
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}