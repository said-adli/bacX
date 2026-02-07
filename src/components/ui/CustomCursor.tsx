"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        // Track mouse everywhere, but visibility might be controlled by parent or CSS
        window.addEventListener("mousemove", updateMousePosition);

        // Optional: Hide cursor when leaving window
        document.body.addEventListener("mouseenter", handleMouseEnter);
        document.body.addEventListener("mouseleave", handleMouseLeave);


        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50 mix-blend-screen"
            animate={{
                x: mousePosition.x - 16,
                y: mousePosition.y - 16,
                scale: isVisible ? 1 : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                mass: 0.1,
            }}
        >
            <div className="w-full h-full rounded-full bg-primary/30 blur-md" />
            <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-primary" />
        </motion.div>
    );
}
