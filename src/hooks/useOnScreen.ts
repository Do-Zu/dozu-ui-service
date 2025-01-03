import { useEffect, useState } from 'react';

/**
 * Custom hook to determine if a DOM element is visible on the screen using the Intersection Observer API.
 * @param {React.RefObject<Element>} ref - A React ref pointing to the element to observe.
 * @param {string} rootMargin - The margin around the root for Intersection Observer (default is "0px").
 * @returns {boolean} - A boolean indicating whether the element is visible on the screen.
 */
export default function useOnScreen(
  ref: React.RefObject<Element>,
  rootMargin: string = '0px',
): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin },
    );
    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, rootMargin]);

  return isVisible;
}
