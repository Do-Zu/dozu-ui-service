import { IColorTheme } from '@/types/mindmap/mindmap.type';

const SOFT_PASTELS_1 = ['#FFD6FF', '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF'];
const SOFT_PASTELS_2 = ['#9C89B8', '#F0A6CA', '#EFC3E6', '#F0E6EF', '#B8BEDD'];
const SUNRISE_GLOW = ['#FFC09F', '#FFEE93', '#FCF5C7', '#A0CED9', '#ADF7B6'];
const REFRESHING_SPRING_HUES = ['#90F1EF', '#FFD6E0', '#FFEF9F', '#C1FBA4', '#7BF1A8'];
const PASTEL_DREAMS = ['#FF99C8', '#FCF6BD', '#D0F4DE', '#A9DEF9', '#E4C1F9'];

const PASTEL_DREAMLAND_ADVENTURE = ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF'];
const GOLDEN_SUMMER_FIELDS = ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#FAEDCD', '#D4A373'];
const PASTEL_BLISS = ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FEC89A'];
const SOFT_SAND = ['#EDEDE9', '#D6CCC2', '#F5EBE0', '#E3D5CA', '#D5BDAF'];
const SWEET_SUMMER_MELODY = ['#F6BD60', '#F7EDE2', '#F5CAC3', '#84A59D', '#F28482'];

const BIRDS_EYE_MOOD = ['#212226', '#2A3B42', '#445A4D', '#B8520A', '#779E7F'];
const MOODY_BERRY = ['#2C2D32', '#263437', '#1B4B4B', '#5A293C', '#B62779'];
const STILL_LIFE_IN_ORANGE = ['#292C33', '#313E35', '#B14B34', '#E86726', '#FE9B33'];
const DEEP_PURPLE = ['#212531', '#322F42', '#4B3A70', '#B7A2C9', '#C5C3C4'];

const INTO_THE_WOODS = ['#262B15', '#3F3F3F', '#464B37', '#848871', '#AFB4AD'];
const DEEP_BLOOMS = ['#1A1859', '#241149', '#641159', '#B91B6F', '#F7B8B3'];
const AL_LIGHTNING = ['#041421', '#042630', '#4C7273', '#86B9B0', '#D0D6D6'];
const FOREST_MIST = ['#001B2E', '#1D3F58', '#537692', '#B3CDE4', '#EEF3F9'];

const DEEP_NAVY_NIGHT = ['#1B3C53', '#234C6A', '#456882', '#D2C1B6'];
const MIDNIGHT_BERRY = ['#432E54', '#4B4376', '#AE445A', '#E8BCB9'];

export const COLOR_THEMES: IColorTheme[] = [
    { name: 'Soft Pastels Dream', colors: SOFT_PASTELS_1, type: 'light' },
    { name: 'Soft Pastel Harmony', colors: SOFT_PASTELS_2, type: 'light' },
    { name: 'Sunrise Glow', colors: SUNRISE_GLOW, type: 'light' },
    { name: 'Refreshing Spring Hues', colors: REFRESHING_SPRING_HUES, type: 'light' },
    { name: 'Pastel Dreams', colors: PASTEL_DREAMS, type: 'light' },

    { name: 'Pastel Dreamland Adventure', colors: PASTEL_DREAMLAND_ADVENTURE, type: 'light' },
    { name: 'Golden Summer Fields', colors: GOLDEN_SUMMER_FIELDS, type: 'light' },
    { name: 'Pastel Bliss', colors: PASTEL_BLISS, type: 'light' },
    { name: 'Soft Sand', colors: SOFT_SAND, type: 'light' },
    { name: 'Sweet Summer Melody', colors: SWEET_SUMMER_MELODY, type: 'light' },

    { name: 'Bird’s Eye Mood', colors: BIRDS_EYE_MOOD, type: 'dark' },
    { name: 'Moody Berry', colors: MOODY_BERRY, type: 'dark' },
    { name: 'Still Life In Orange', colors: STILL_LIFE_IN_ORANGE, type: 'dark' },
    { name: 'Deep Purple', colors: DEEP_PURPLE, type: 'dark' },

    { name: 'Into The Woods', colors: INTO_THE_WOODS, type: 'dark' },
    { name: 'Deep Blooms', colors: DEEP_BLOOMS, type: 'dark' },
    { name: 'Al Lightning', colors: AL_LIGHTNING, type: 'dark' },
    { name: 'Forest Mist', colors: FOREST_MIST, type: 'dark' },

    { name: 'Deep Navy Night', colors: DEEP_NAVY_NIGHT, type: 'dark' },
    { name: 'Midnight Berry', colors: MIDNIGHT_BERRY, type: 'dark' },
];

const DEFAULT_THEME_NAME = 'Refreshing Spring Hues';
export const DEFAULT_THEME = COLOR_THEMES.find((item) => item.name === DEFAULT_THEME_NAME) ?? COLOR_THEMES[0];
