"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ExportButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/export-students');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to download");
            }

            // Create Blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Extract filename from header or default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = "students_export.csv";
            if (contentDisposition) {
                const parts = contentDisposition.split('filename=');
                if (parts.length === 2) {
                    filename = parts[1].replace(/"/g, '');
                }
            }
            a.download = filename;

            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("تم تصدير ملف الطلاب بنجاح");
        } catch (error) {
            // Fail silently or toast
            toast.error("فشل في تصدير الملف");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-white text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التصدير...</span>
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                </>
            )}
        </button>
    );
}
