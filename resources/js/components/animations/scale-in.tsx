import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScaleInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
