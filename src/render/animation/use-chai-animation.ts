import { useEffect } from "react";
import { applyAnimationStyles, convertToAnimationObject } from "./animation-utils";

const ATTR = "data-animation";

export const useChaiAnimation = () => {
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const initializedElements = new WeakSet<Element>();

    const initializeAnimations = () => {
      const nodes = document.querySelectorAll(`[${ATTR}]`);

      nodes.forEach((node) => {
        if (initializedElements.has(node)) return;

        const animationString = node.getAttribute(ATTR);
        if (!animationString) return;

        initializedElements.add(node);
        const animation = convertToAnimationObject(animationString);
        applyAnimationStyles(node, animation);

        // Small delay to ensure hidden state is painted before observing
        setTimeout(() => {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.setAttribute("data-visible", "true");
                  if (animation.triggerOnce) {
                    observer.unobserve(entry.target);
                  }
                } else if (!animation.triggerOnce) {
                  entry.target.setAttribute("data-visible", "false");
                }
              });
            },
            {
              threshold: 0.1,
              rootMargin: "0px 0px -50px 0px",
            },
          );

          observer.observe(node as Element);
          observers.push(observer);
        }, 50);
      });
    };

    // Small delay to ensure DOM is ready after React render
    const timeoutId = requestAnimationFrame(() => {
      initializeAnimations();
    });

    // Watch for new elements with data-animation attribute
    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewAnimationElements = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.hasAttribute(ATTR) || node.querySelector(`[${ATTR}]`)) {
              hasNewAnimationElements = true;
            }
          }
        });
      });
      if (hasNewAnimationElements) initializeAnimations();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(timeoutId);
      observers.forEach((observer) => observer.disconnect());
      mutationObserver.disconnect();
    };
  }, []);
};
