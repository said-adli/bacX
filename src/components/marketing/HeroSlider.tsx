"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

export type HeroSlideData = {
    id: string;
    image_url: string;
    title: string | null;
    cta_link: string | null;
    display_order: number;
};

export function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000); // 6 seconds per slide
        return () => clearInterval(interval);
    }, [slides.length]);

    if (!slides || slides.length === 0) {
        return null; // Fallback handled by parent or just empty
    }

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] bg-black/50 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {/* Link Wrap if CTA exists */}
                    {slides[currentIndex].cta_link ? (
                        <Link href={slides[currentIndex].cta_link as string} className="block w-full h-full">
                            <Image
                                src={slides[currentIndex].image_url}
                                alt={slides[currentIndex].title || `Hero Slide ${currentIndex + 1}`}
                                fill
                                priority={currentIndex === 0} // Priority ONLY for the first slide to fix CLS
                                sizes="100vw"
                                className="object-cover"
                                unoptimized // Storage URLs
                            />
                        </Link>
                    ) : (
                        <Image
                            src={slides[currentIndex].image_url}
                            alt={slides[currentIndex].title || `Hero Slide ${currentIndex + 1}`}
                            fill
                            priority={currentIndex === 0} // Priority ONLY for the first slide to fix CLS
                            sizes="100vw"
                            className="object-cover"
                            unoptimized // Storage URLs
                        />
                    )}

                    {/* Gradient Overlay for Title (Optional) */}
                    {slides[currentIndex].title && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-6">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white text-xl md:text-3xl font-bold max-w-2xl text-center px-4"
                            >
                                {slides[currentIndex].title}
                            </motion.h2>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls (Visible on Hover) */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
                        aria-label="Previous Slide"
                        dir="ltr"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
                        aria-label="Next Slide"
                        dir="ltr"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
