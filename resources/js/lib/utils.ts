import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ResolvableUrl = string | { url: string } | (() => { url: string });

export function resolveUrl(url: ResolvableUrl): string {
    if (typeof url === 'string') {
        return url;
    }
    if (typeof url === 'function') {
        return url().url;
    }
    return url.url;
}

export function isSameUrl(url1: ResolvableUrl, url2: ResolvableUrl): boolean {
    const normalize = (url: ResolvableUrl) => resolveUrl(url).replace(/\/$/, '');
    return normalize(url1) === normalize(url2);
}
