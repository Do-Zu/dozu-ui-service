import { useEffect, useRef } from 'react';

function useClickOutSide(handler: () => void) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutSide = (e: MouseEvent) => {
      if (ref?.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };
    document.addEventListener('click', handleClickOutSide);
    return () => document.removeEventListener('click', handleClickOutSide);
  }, [handler]);

  return ref;
}
export default useClickOutSide;
/**
Great for closing modals or dropdowns when clicking outside.

Example:
const ref = useClickOutside(() => setDropdownOpen(false));

return (
  <div ref={ref}>
    {dropdownOpen && <p>Dropdown Content</p>}
  </div>
);

 */
