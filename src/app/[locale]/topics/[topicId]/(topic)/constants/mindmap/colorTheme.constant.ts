import { IColorTheme } from '@/types/mindmap/mindmap.type';

const SOFT_PASTELS_1 = ['#FFD6FF', '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF']; // fine
const SOFT_PASTELS_2 = ['#9C89B8', '#F0A6CA', '#EFC3E6', '#F0E6EF', '#B8BEDD'];
const SUNRISE_GLOW = ['#FFC09F', '#FFEE93', '#FCF5C7', '#A0CED9', '#ADF7B6'];
const REFRESHING_SPRING_HUES = ['#90F1EF', '#FFD6E0', '#FFEF9F', '#C1FBA4', '#7BF1A8']; // ok
const PASTEL_DREAMS = ['#FF99C8', '#FCF6BD', '#D0F4DE', '#A9DEF9', '#E4C1F9'];
const FIERY_RED_DEPTH = ['#220901', '#621708', '#941B0C', '#BC3908', '#F6AA1C'];
const DEEP_NAVY_NIGHT = ['#1B3C53', '#234C6A', '#456882', '#D2C1B6'];
const SOFT_IVORY_PURITY = ['#D0B8AC', '#F3D8C7', '#EFE5DC', '#FBFEFB', '#FFFFFF'];
const MIDNIGHT_BERRY = ['#432E54', '#4B4376', '#AE445A', '#E8BCB9']; // ok
const DEEP_SPACE_GRADIENT = ['#0D1164', '#640D5F', '#EA2264', '#F78D60']; // ok

export const COLOR_THEMES: IColorTheme[] = [
    { name: 'Soft Pastels Dream', colors: SOFT_PASTELS_1, type: 'light' },
    { name: 'Soft Pastel Harmony', colors: SOFT_PASTELS_2, type: 'light' },
    { name: 'Sunrise Glow', colors: SUNRISE_GLOW, type: 'light' },
    { name: 'Refreshing Spring Hues', colors: REFRESHING_SPRING_HUES, type: 'light' },
    { name: 'Pastel Dreams', colors: PASTEL_DREAMS, type: 'light' },
    { name: 'Fiery Red Depth', colors: FIERY_RED_DEPTH, type: 'dark' },
    { name: 'Deep Navy Night', colors: DEEP_NAVY_NIGHT, type: 'dark' },
    { name: 'Soft Ivory Purity', colors: SOFT_IVORY_PURITY, type: 'light' },
    { name: 'Midnight Berry', colors: MIDNIGHT_BERRY, type: 'dark' },
    { name: 'Deep Space Gradient', colors: DEEP_SPACE_GRADIENT, type: 'dark' },
];

const DEFAULT_THEME_NAME = 'Refreshing Spring Hues';
export const DEFAULT_THEME = COLOR_THEMES.find((item) => item.name === DEFAULT_THEME_NAME) as IColorTheme;
