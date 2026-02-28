// Algerian Wilayas List
export const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Baji Mokhtar",
    "Béni Abbès", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
];

/**
 * Maps a Wilaya code (1-58) to its name with the code prefix.
 * Example: 34 -> "34 - Bordj Bou Arreridj"
 * @param code The wilaya code (string or number)
 * @returns Formatted string "Code - Name" or just the name if code is invalid but name known, or fallback.
 */
export function getWilayaName(code: string | number | null | undefined): string {
    if (!code) return "غير محدد"; // Not specified

    const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;

    if (isNaN(codeNum) || codeNum < 1 || codeNum > WILAYAS.length) {
        // Fallback: If it's a string name we recognize, return it? 
        // Or just return the code if it doesn't match?
        // Let's assume input is strictly the ID (1-58).
        return `${code}`;
    }

    const name = WILAYAS[codeNum - 1];
    // Pad code with 0 if single digit? Usually codes are 01, 02.. but user example said "34". "16".
    // Let's keep it simple: "34 - Name"
    return `${codeNum} - ${name}`;
}
