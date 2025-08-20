import localFont from 'next/font/local';

const geistStatic = localFont({
    src: [
        {
            path: '../fonts/static/Geist-Thin.ttf',
            weight: '100',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-ExtraLight.ttf',
            weight: '200',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-ExtraBold.ttf',
            weight: '800',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Black.ttf',
            weight: '900',
            style: 'normal',
        },
    ],
    variable: '--font-sans',
    display: 'swap',
});

export default geistStatic;
