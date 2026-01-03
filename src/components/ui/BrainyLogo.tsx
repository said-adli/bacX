import { StonePyramidIcon } from "./StonePyramidIcon";

export function BrainyLogo({ variant = "full", className, imageSrc }: BrainyLogoProps & { imageSrc?: string }) {
    const isWatermark = variant === "watermark";

    if (variant === "icon") {
        return (
            <div className={cn("relative select-none", className)}>
                <StonePyramidIcon />
            </div>
        );
    }

    return (
        <div className={cn("relative select-none", className)}>
            <div className="relative w-full h-full">
                <Image
                    src={imageSrc || "/logo.png"}
                    alt="Brainy Logo"
                    width={512}
                    height={512}
                    className={cn(
                        "object-contain w-full h-full",
                        className?.includes("drop-shadow") ? "" : (isWatermark ? "opacity-30" : "drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]")
                    )}
                    priority
                />
            </div>
        </div>
    );
}
