"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type HeroSlide = {
    id: string;
    image_url: string;
    title: string | null;
    cta_link: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
};

// ==========================================
// PUBLIC CACHED FETCH (Zero Latency ISR)
// ==========================================
export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch hero slides:", error);
        return [];
    }

    return data || [];
}

// ==========================================
// ADMIN ACTIONS
// ==========================================
export async function getAllHeroSlides() {
    const supabase = await createClient();

    // Check admin role here based on your app's security model
    // Assuming backend verifyAdmin logic or similar is handled

    const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function createHeroSlide(data: Partial<HeroSlide>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('hero_slides')
        .insert([{
            ...data,
            display_order: data.display_order || 0
        }]);

    if (error) throw new Error(error.message);

    // Purge edge cache to make immediate update visible across platform
    revalidatePath('/', 'page');
}

export async function updateHeroSlide(id: string, data: Partial<HeroSlide>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('hero_slides')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/', 'page');
}

export async function deleteHeroSlide(id: string, imageUrl: string) {
    const supabase = await createClient();

    // 1. Extract file path from full URL
    // URL Format: .../storage/v1/object/public/hero-images/filename.webp
    const urlParts = imageUrl.split('/hero-images/');
    if (urlParts.length > 1) {
        const filePath = urlParts[1];
        // 2. Delete from Storage
        await supabase.storage.from('hero-images').remove([filePath]);
    }

    // 3. Delete Database Row
    const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/', 'page');
}

export async function reorderHeroSlides(slides: { id: string; display_order: number }[]) {
    const supabase = await createClient();

    // Upsert or iterative update depending on Supabase version capabilities.
    // Simplifying with iterative update for robustness
    for (const slide of slides) {
        await supabase
            .from('hero_slides')
            .update({ display_order: slide.display_order })
            .eq('id', slide.id);
    }

    revalidatePath('/', 'page');
}
