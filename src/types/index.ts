// src/types/index.ts

// Тип для головної секції (Hero)
export interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string; // Може бути, а може й ні
}

// Тип для одного проекту
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[]; // Масив тегів, напр. ["React", "Firebase"]
  imageUrl: string;
  link: string;
  githubLink?: string;
}

// Тип для контактів
export interface ContactData {
  email: string;
  telegram: string;
  linkedin?: string;
}