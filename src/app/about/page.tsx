
export const metadata = {
    title: "من نحن",
};

// import { Hero } from "@/components/sections/Hero";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <div className="container mx-auto px-6 py-24">
                <h1 className="text-4xl font-bold mb-8 text-foreground">عن المنصة</h1>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead text-xl text-muted-foreground mb-6">
                        منصة BrainyDZ هي منصتك التعليمية الذكية للتحضير للبكالوريا في الجزائر.
                    </p>
                    <div className="grid md:grid-cols-2 gap-12 my-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">رؤيتنا</h2>
                            <p className="text-muted-foreground">
                                نسعى لتمكين كل طالب جزائري من الوصول إلى تعليم عالي الجودة، يجمع بين التكنولوجيا الحديثة والخبرة البيداغوجية العالية.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4">رسالتنا</h2>
                            <p className="text-muted-foreground">
                                توفير بيئة تعليمية متكاملة تساعد الطلاب على التفوق الدراسي وتقلل من عبء الدروس الخصوصية التقليدية.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
