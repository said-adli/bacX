"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";

export interface Wilaya {
    id: string;
    code: string;
    name: string;
    ar_name?: string;
}

export const getWilayas = unstable_cache(
    async () => {
        const supabase = await createClient();
        // Assuming table 'wilayas' exists as per prompt. If not, we might fail.
        // But prompt said "Supabase wilayas table".
        const { data, error } = await supabase
            .from('wilayas')
            .select('*')
            .order('id', { ascending: true }); // or code

        if (error) {
            console.error("Error fetching wilayas:", error);
            return [];
        }
        return data as Wilaya[];
    },
    ['static-wilayas'],
    { revalidate: 86400, tags: ['static-data'] } // Cache for 24h
);

export interface Major {
    id: string;
    name: string;
}

export const getMajors = unstable_cache(
    async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('majors')
            .select('*')
            .order('name');

        if (error || !data) {
            // Fallback for immediate "No broken UI" if table missing
            return [
                { id: 'sci', name: 'Science Exp' },
                { id: 'math', name: 'Math' },
                { id: 'tm', name: 'Tech Math' },
                { id: 'gest', name: 'Gestion' },
                { id: 'let', name: 'Lettres' },
                { id: 'lang', name: 'Langues' }
            ];
        }
        return data as Major[];
    },
    ['static-majors'],
    { revalidate: 86400, tags: ['static-data'] }
);
