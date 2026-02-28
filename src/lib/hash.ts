
/**
 * Simple hash function for privacy-preserving UID display.
 * Not cryptographically secure, but sufficient for visual obfuscation/uniqueness.
 */
export async function hashUID(uid: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(uid);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Return first 8 chars of hex string
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12).toUpperCase();
}
