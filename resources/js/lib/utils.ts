import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function resolveUrl(url: string | { url: string } | (() => { url: string })): string {
    if (typeof url === 'string') {
        return url;
    }
    if (typeof url === 'function') {
        return url().url;
    }
    return url.url;
}

export function isSameUrl(url1: string, url2: string): boolean {
    const normalize = (url: string) => url.replace(/\/$/, '');
    return normalize(url1) === normalize(url2);
}
