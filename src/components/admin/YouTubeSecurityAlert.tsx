import { AlertTriangle, CheckCircle2, Globe, Lock } from "lucide-react";
import Link from "next/link";

export default function YouTubeSecurityAlert() {
    return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 my-4 space-y-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-amber-500 mb-1">Security Checklist</h4>
                    <p className="text-xs text-zinc-400 mb-3">
                        Before saving, verify these settings in YouTube Studio to prevent content leaks.
                    </p>

                    <ul className="space-y-2 text-xs text-zinc-300">
                        <li className="flex items-center gap-2">
                            <Lock size={12} className="text-blue-400" />
                            Visibility is set to <strong className="text-white">Unlisted</strong>?
                        </li>
                        <li className="flex items-center gap-2">
                            <Globe size={12} className="text-emerald-400" />
                            Embedding limited to <strong className="text-white">bac-x.vercel.app</strong>?
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-zinc-500" />
                            "Allow embedding" is <strong className="text-white">Checked</strong>?
                        </li>
                    </ul>

                    <Link
                        href="https://studio.youtube.com/"
                        target="_blank"
                        className="inline-block mt-4 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded border border-white/10 transition-colors"
                    >
                        Open YouTube Studio ↗
                    </Link>
                </div>
            </div>
        </div>
    );
}
