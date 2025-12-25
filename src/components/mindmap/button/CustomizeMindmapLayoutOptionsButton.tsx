import { LayoutButtonProps } from '@/app/[locale]/mindmap/types/layoutButton.types';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { Grip } from 'lucide-react';
import React, { useEffect } from 'react';
import HorizontalLayoutButton from './HorizontalLayoutButton';
import VerticalLayoutButton from './VerticalLayoutButton';
import RadialLayoutButton from './RadialLayoutButton';
import MindmapLayoutButton from './MindmapLayoutButton';
// Keep your existing imports...

const CustomizeMindmapLayoutOptionsButton = ({ ...props }: LayoutButtonProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex flex-col gap-2">
                <CollapsibleTrigger asChild>
                    <Button variant="outline" size="icon-sm">
                        <Grip />
                    </Button>
                </CollapsibleTrigger>

                {/* We forceMount the content so Framer can handle the exit animation */}
                <CollapsibleContent forceMount>
                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col gap-2 pt-2">
                                    {/* pt-2 adds padding only when open so it doesn't break collapse height */}
                                    <HorizontalLayoutButton {...props} />
                                    <VerticalLayoutButton {...props} />
                                    <RadialLayoutButton {...props} />
                                    <MindmapLayoutButton {...props} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

export default CustomizeMindmapLayoutOptionsButton;
