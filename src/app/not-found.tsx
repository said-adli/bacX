import { NotFoundState } from "@/components/ui/NotFoundState";

export default function GlobalNotFound() {
    return (
        <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center p-4">
            <NotFoundState />
        </div>
    );
}
