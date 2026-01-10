export default function CommunityPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl mb-4 animate-pulse">
                💬
            </div>
            <h1 className="text-3xl font-serif font-bold">مجتمع Brainy</h1>
            <p className="text-white/50 max-w-md">
                مكان للنقاش وتبادل المعرفة بين الطلاب والأساتذة. هذه الميزة قيد التطوير حالياً وستكون متاحة قريباً.
            </p>
            <button className="btn btn-ghost">
                أخبرني عند الاطلاق
            </button>
        </div>
    );
}
