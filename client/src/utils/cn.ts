import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({});

export default function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
