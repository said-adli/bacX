
/**
 * Validates a file for type (Magic Bytes) and size.
 * Allowed: JPEG, PNG, PDF.
 * Max Size: 1MB.
 */
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    const MAX_SIZE = 1024 * 1024; // 1MB
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];

    // 1. Size Check
    if (file.size > MAX_SIZE) {
        return { valid: false, error: 'File size exceeds 1MB limit.' };
    }

    // 2. MIME Check (Basic) - Fail fast
    if (!ALLOWED_MIMES.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Only JPEG, PNG, or PDF allowed.' };
    }

    // 3. Magic Byte Check (Content Sniffing)
    // Prevents renaming .exe to .png
    try {
        const arrayBuffer = await file.slice(0, 4).arrayBuffer();
        const header = new Uint8Array(arrayBuffer);
        let validHeader = false;
        const headerHex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

        // JPEG: FF D8 FF
        if (headerHex.startsWith('FFD8FF')) {
            validHeader = true;
        }
        // PNG: 89 50 4E 47
        else if (headerHex === '89504E47') {
            validHeader = true;
        }
        // PDF: 25 50 44 46 (%PDF)
        else if (headerHex.startsWith('25504446')) {
            validHeader = true;
        }

        if (!validHeader) {
            // Fail silently or handle error
            return { valid: false, error: 'File integrity check failed. Invalid format.' };
        }

        return { valid: true };

    } catch (e) {
        console.error("Validation error:", e);
        return { valid: false, error: 'Failed to validate file.' };
    }
}
