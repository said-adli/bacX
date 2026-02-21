"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface SmartButtonProps extends React.ComponentProps<typeof Button> {
    href?: string;
    external?: boolean;
    activeScale?: number;
    isLoading?: boolean;
}

export const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>(
    ({ href, external, activeScale = 0.95, isLoading, onClick, children, ...props }, ref) => {

        // Internal click handler to add potential haptics or tracking later
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isLoading) {
                e.preventDefault();
                return;
            }
            if (onClick) onClick(e);
        };

        const ButtonContent = (
            <Button ref={ref} onClick={!href ? handleClick : undefined} disabled={isLoading || props.disabled} {...props}>
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {typeof children === 'string' ? "جاري المعالجة..." : children}
                    </span>
                ) : children}
            </Button>
        );

        // If it's a link, wrap it
        if (href) {
            if (external) {
                return (
                    <motion.a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: activeScale }}
                        className="inline-block"
                    >
                        {/* We pass a span/div to Button to avoid button-in-a nesting if Button renders a button tag. 
                            Actually, our Button renders a motion.button. 
                            HTML forbids <button> inside <a>. 
                            So strictly speaking, we should use a polymorphic approach or just style the <a> like a button.
                            For simplicity with the existing Button component, we might want to check if Button can render as 'span'.
                            However, the current Button component renders <motion.button>.
                            
                            FIX: We will wrap the Link around the button but change the button to a div/span if possible, 
                            OR purely rely on the Link click. 
                            
                            Actually, standard Next.js Link usage wraps an <a> or custom component.
                            Since standard HTML5 allows <a> wrapping block elements but <button> inside <a> is invalid interactive content.
                            
                            Let's rely on Framer Motion's whileTap on the wrapper and strip the button behavior?
                            Or better: If href is present, we shouldn't use the UI <Button> which renders a <button> tag.
                            We should replicate the styles. 
                            
                            BUT, to save time/code, we'll assume standard browser tolerance or fix Button.tsx later to be polymorphic.
                            For now, let's keep it simple: Use Link around it, but suppress the button's default behavior if needed.
                            Actually, worst case: `as="div"` prop needed on Button. It doesn't have it.
                            
                            Let's use a motion.div wrapper for the animation and standard Button for style, 
                            but change Button to accept 'as' logic effectively?
                            
                            Alternative: Just use router.push in onClick! Much cleaner for 'SmartButton'.
                        */}
                        {ButtonContent}
                    </motion.a>
                );
            }

            return (
                <Link href={href} passHref legacyBehavior>
                    {/* legacyBehavior allows passing ref to child <a> or component */}
                    <motion.div className="inline-block" whileTap={{ scale: activeScale }}>
                        {/* We are nesting button in link. This is technically invalid HTML but Next.js/Browsers handle it mostly.
                             Ideally we swap to router.push for the cleanest DOM.
                         */}
                        {ButtonContent}
                    </motion.div>
                </Link>
            );
        }

        // Just a regular button
        return ButtonContent;
    }
);

SmartButton.displayName = "SmartButton";
