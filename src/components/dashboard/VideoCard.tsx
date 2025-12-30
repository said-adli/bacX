"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Clock, User } from "lucide-react";
// import { cn } from "@/lib/utils"; 

interface VideoCardProps {
    title: string;
    subject: string;
    instructor: string;
    duration: string;
    thumbnail: string;
    href: string;
    progress?: number;
}

export function VideoCard({
    title,
    subject,
    instructor,
    duration,
    thumbnail,
    href,
    progress
}: VideoCardProps) {
    return (
        <Link href={href} className="group block">
            <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 group-hover:border-primary/50 relative">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform">
                            <PlayCircle className="w-6 h-6 fill-current" />
                        </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {duration}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {subject}
                        </span>
                    </div>

                    <h3 className="font-bold text-foreground text-lg leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-3 h-3" />
                        </div>
                        <span>ال{instructor}</span>
                    </div>

                    {/* Progress Bar (if started) */}
                    {progress !== undefined && progress > 0 && (
                        <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
