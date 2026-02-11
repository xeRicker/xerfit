"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const TABS = [
  "/dashboard",
  "/meals",
  "/measurements",
  "/diary",
  "/profile"
];

export function GestureNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const touchEndRef = useRef<{ x: number, y: number } | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  // Maximum vertical distance to consider it a horizontal swipe
  const maxVerticalDistance = 30;

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchEndRef.current = null;
      touchStartRef.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      touchEndRef.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      };
    };

    const onTouchEnd = () => {
      if (!touchStartRef.current || !touchEndRef.current) return;

      const distanceX = touchStartRef.current.x - touchEndRef.current.x;
      const distanceY = touchStartRef.current.y - touchEndRef.current.y;

      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;
      const isVerticalScroll = Math.abs(distanceY) > maxVerticalDistance;

      if (!isVerticalScroll && (isLeftSwipe || isRightSwipe)) {
        const currentIndex = TABS.indexOf(pathname);
        if (currentIndex === -1) return;

        if (isLeftSwipe) {
          // Next Tab
          if (currentIndex < TABS.length - 1) {
            router.push(TABS[currentIndex + 1]);
          }
        } else {
          // Previous Tab
          if (currentIndex > 0) {
            router.push(TABS[currentIndex - 1]);
          }
        }
      }
    };

    const element = document.body;
    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [pathname, router]);

  return null;
}
