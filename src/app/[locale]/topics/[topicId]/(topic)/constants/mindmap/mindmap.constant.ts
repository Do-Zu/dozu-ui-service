import { IColorTheme } from '@/types/mindmap/mindmap.type';

const SUNNY_BEACH_DAY = ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51']; // ok
const PURPLE_SUNSET = ['#390099', '#9E0059', '#FF0054', '#FF5400', '#FFBD00'];
const WATERMELON_SORBET = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];
const CANDY_POP = ['#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4'];
const SOFT_PASTELS_1 = ['#FFD6FF', '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF'];
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
    { name: 'Sunny Beach Day', colors: SUNNY_BEACH_DAY },
    { name: 'Watermelon Sorbet', colors: WATERMELON_SORBET },
    { name: 'Candy Pop', colors: CANDY_POP },
    { name: 'Purple Sunset', colors: PURPLE_SUNSET },
    { name: 'Soft Pastels Dream', colors: SOFT_PASTELS_1 },
    { name: 'Soft Pastel Harmony', colors: SOFT_PASTELS_2 },
    { name: 'Sunrise Glow', colors: SUNRISE_GLOW },
    { name: 'Refreshing Spring Hues', colors: REFRESHING_SPRING_HUES },
    { name: 'Pastel Dreams', colors: PASTEL_DREAMS },
    { name: 'Fiery Red Depth', colors: FIERY_RED_DEPTH },
    { name: 'Deep Navy Night', colors: DEEP_NAVY_NIGHT },
    { name: 'Soft Ivory Purity', colors: SOFT_IVORY_PURITY },
    { name: 'Midnight Berry', colors: MIDNIGHT_BERRY },
    { name: 'Deep Space Gradient', colors: DEEP_SPACE_GRADIENT },
];
