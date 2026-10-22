import { type ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            src="/images/branding/icon-192.png"
            alt="LesbiLibre"
            width={192}
            height={192}
            {...props}
        />
    );
}
