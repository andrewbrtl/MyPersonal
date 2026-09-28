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
      const heroImage = root.querySelector<HTMLElement>("[data-motion-hero-image]");
      const titleLines = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-title-line]"));
      const heroIntro = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-hero-copy] [data-motion-intro]"));
      const heroSpecs = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-specs] > *"));

      if (heroImage) {
        gsap.fromTo(
          heroImage,
          { scale: 1.035, autoAlpha: 0.8 },
          { scale: 1, autoAlpha: 1, duration: 0.9, ease: "power3.out", clearProps: "opacity,visibility,transform" },
        );
      }

      if (titleLines.length) {
        gsap.fromTo(
          titleLines,
          { yPercent: 103, rotate: 0 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power4.out",
            clearProps: "transform",
          },
        );
      }

      if (heroIntro.length) {
        gsap.fromTo(
          heroIntro,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            delay: titleLines.length ? 0.18 : 0,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
          },
        );
      }

      if (heroSpecs.length) {
        gsap.fromTo(
          heroSpecs,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            delay: 0.72,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "opacity,visibility,transform",
          },
        );
      }

      root.querySelectorAll<HTMLElement>("[data-motion-rule]").forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.9, delay: 0.18, ease: "power3.out", clearProps: "transform,transformOrigin" },
        );
      });

      const title = Array.from(root.querySelectorAll<HTMLElement>("h1, h2.font-display"))
        .find((element) => element.getClientRects().length > 0);

      if (title && !titleLines.length && !heroIntro.length) {
        const introItems = [title.previousElementSibling, title, title.nextElementSibling]
          .filter((element): element is HTMLElement => element instanceof HTMLElement);

        gsap.fromTo(
          introItems,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.82,
            stagger: 0.09,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
          },
        );
      }

      root.querySelectorAll<HTMLElement>("[data-motion-heading], [data-motion-form-intro]").forEach((group) => {
        const items = Array.from(group.children).filter(
          (element): element is HTMLElement => element instanceof HTMLElement,
        );

        if (!items.length) return;

        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.78,
            stagger: 0.075,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: group,
              start: "top 86%",
              once: true,
            },
          },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-motion-image-frame]").forEach((frame) => {
        const image = frame.querySelector<HTMLElement>("[data-motion-parallax]");

        gsap.fromTo(
          frame,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 1.15,
            ease: "power3.inOut",
            clearProps: "clipPath",
            scrollTrigger: {
              trigger: frame,
              start: "top 82%",
              once: true,
            },
          },
        );

        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.07, yPercent: -1.6 },
            {
              scale: 1.07,
              yPercent: 1.6,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        }
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
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-motion-marquee]").forEach((track) => {
        gsap.to(track, {
          xPercent: -50,
          duration: 26,
          repeat: -1,
          ease: "none",
        });
      });
    }, root);

    return () => context.revert();
  }, [pathname]);

  return null;
}
