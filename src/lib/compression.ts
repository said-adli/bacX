/**
 * Compresses an image file to a target size/quality using HTML5 Canvas.
 * logic: Resize to max 1280px width, then reduce quality until under 500KB.
 */
export async function compressImage(file: File, maxSizeMB: number = 0.5, maxWidth: number = 1280): Promise<File> {
    if (file.type === "image/svg+xml") return file; // Cannot compress SVG

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // 1. Resize if too large
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Canvas context failed"));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // 2. Compress Logic
                let quality = 0.9;
                const compress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error("Compression failed"));
                                return;
                            }
                            if (blob.size / 1024 / 1024 > maxSizeMB && quality > 0.3) {
                                quality -= 0.1;
                                compress();
                            } else {
                                // Convert Blob back to File
                                const compressedFile = new File([blob], file.name, {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            }
                        },
                        "image/jpeg",
                        quality
                    );
                };
                compress();
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
