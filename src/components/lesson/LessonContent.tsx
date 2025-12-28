"use client";

import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { Sidebar } from "@/components/lesson/Sidebar";

interface LessonContentProps {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
}

const SALT = process.env.NEXT_PUBLIC_VIDEO_SALT || "SECRET_SALT_V1";
export default function LessonContent({ title, description, videoUrl }: LessonContentProps) {
    const videoId = videoUrl;
    const cleanId = videoId.length > 20 ? "dQw4w9WgXcQ" : videoId;

    // ENCODE WITH SALT
    const saltedCoded = btoa(SALT + cleanId + SALT);

    return (
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h1 className="font-tajawal font-bold text-2xl sm:text-3xl lg:text-4xl mb-2 text-white/90">
                        {title}
                    </h1>
                    <p className="font-tajawal text-zinc-400 text-lg">
                        {description}
                    </p>
                </div>

                <EncodedVideoPlayer
                    encodedVideoId={saltedCoded}
                />
            </div>

            <div className="lg:col-span-1 h-full">
                <Sidebar />
            </div>
        </div>
    );
}
