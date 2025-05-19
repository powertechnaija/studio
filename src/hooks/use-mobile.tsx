
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to determine if the current viewport width is mobile-sized.
 * Defaults to `false` (desktop) on the server and during the initial client render,
 * then updates to the actual value after client-side hydration.
 * This helps prevent hydration mismatches.
 * @returns {boolean} True if the viewport is mobile-sized, false otherwise.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false); // Default to false (desktop-like)

  useEffect(() => {
    // This function will only run on the client after hydration
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkDevice(); // Check an initial time on the client
    window.addEventListener("resize", checkDevice);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", checkDevice);
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount

  return isMobile;
}
