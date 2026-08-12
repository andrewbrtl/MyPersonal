"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PageMotion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("main");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!root || reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const title = Array.from(root.querySelectorAll<HTMLElement>("h1, h2.font-display"))
        .find((element) => element.getClientRects().length > 0);

      if (title) {
        const introItems = [title.previousElementSibling, title, title.nextElementSibling]
          .filter((element): element is HTMLElement => element instanceof HTMLElement);

        gsap.fromTo(
          introItems,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.68,
            stagger: 0.07,
            ease: "power2.out",
            clearProps: "opacity,visibility,transform",
          },
        );
      }

      const introSection = title?.closest("section");
      const allSections = Array.from(root.querySelectorAll<HTMLElement>("section"));
      const topLevelSections = allSections.filter(
        (section) => !allSections.some((candidate) => candidate !== section && candidate.contains(section)),
      );

      topLevelSections
        .filter((section) => section !== introSection && !section.hasAttribute("data-motion-static"))
        .forEach((section) => {
          gsap.fromTo(
            section,
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.62,
              ease: "power2.out",
              clearProps: "opacity,visibility,transform",
              scrollTrigger: {
                trigger: section,
                start: "top 88%",
                once: true,
              },
            },
          );
        });

      root.querySelectorAll<HTMLElement>("[data-motion-list]").forEach((list) => {
        const items = Array.from(list.children).filter(
          (element): element is HTMLElement => element instanceof HTMLElement,
        );

        if (!items.length) return;

        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.055,
            ease: "power2.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: list,
              start: "top 90%",
              once: true,
            },
          },
        );
      });
    }, root);

    return () => context.revert();
  }, [pathname]);

  return null;
}
