import { Moon, Sun, Monitor } from 'lucide-react';

export const THEMES = [
    { key: 'light', icon: Sun, label: 'Light', labelVi: 'Sáng' },
    { key: 'dark', icon: Moon, label: 'Dark', labelVi: 'Tối' },
    { key: 'system', icon: Monitor, label: 'System', labelVi: 'Hệ thống' },
] as const;

export type ThemeKey = typeof THEMES[number]['key'];

