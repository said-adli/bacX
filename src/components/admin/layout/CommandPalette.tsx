"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Loader2, User, Ticket, BookOpen, X } from "lucide-react";
import { globalSearch, GroupedResults } from "@/actions/admin-search";

// Simple inline debounce hook if file doesn't exist
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounceValue(query, 500);
    const [results, setResults] = useState<GroupedResults | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Toggle on CMD+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Perform Search
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            startTransition(() => {
                setResults(null);
            });
            return;
        }

        startTransition(async () => {
            const data = await globalSearch(debouncedQuery);
            setResults(data);
        });
    }, [debouncedQuery]);

    const handleSelect = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[20%] max-h-[85vh] w-[90vw] max-w-[640px] translate-x-[-50%] translate-y-[-20%] rounded-xl bg-[#09090b] border border-white/10 shadow-2xl p-0 focus:outline-none z-[10000] overflow-hidden">

                    {/* Search Input */}
                    <div className="flex items-center border-b border-white/10 px-4 py-4">
                        <Search className="w-5 h-5 text-zinc-500 mr-3" />
                        <input
                            className="flex-1 bg-transparent text-lg text-white placeholder:text-zinc-500 focus:outline-none font-sans"
                            placeholder="Search students, coupons, subjects..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {isPending && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                        {!isPending && query && (
                            <button onClick={() => setQuery("")} className="text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Results List */}
                    <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
                        {!results && !query && (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                Press <kbd className="px-2 py-1 bg-white/10 rounded-md text-white font-mono text-xs mx-1">ESC</kbd> to close
                            </div>
                        )}

                        {results && (
                            <>
                                {/* Students Group */}
                                {results.students.length > 0 && (
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-semibold text-zinc-500 px-3 py-2 uppercase tracking-wider">Students</h3>
                                        {results.students.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item.href)}
                                                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</span>
                                                    <span className="text-xs text-zinc-500">{item.subtitle}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Coupons Group */}
                                {results.coupons.length > 0 && (
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-semibold text-zinc-500 px-3 py-2 uppercase tracking-wider">Coupons</h3>
                                        {results.coupons.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item.href)}
                                                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <Ticket className="w-4 h-4 text-green-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{item.title}</span>
                                                    <span className="text-xs text-zinc-500">{item.subtitle}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Subjects Group */}
                                {results.subjects.length > 0 && (
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-semibold text-zinc-500 px-3 py-2 uppercase tracking-wider">Subjects</h3>
                                        {results.subjects.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item.href)}
                                                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-purple-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{item.title}</span>
                                                    <span className="text-xs text-zinc-500">{item.subtitle}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {query.length > 1 &&
                                    results.students.length === 0 &&
                                    results.coupons.length === 0 &&
                                    results.subjects.length === 0 && (
                                        <div className="py-12 text-center text-zinc-500">
                                            {`No results found for "${query}"`}
                                        </div>
                                    )}
                            </>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
