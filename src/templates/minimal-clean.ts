import { gsap } from "gsap";

import type {
  TemplateDefinition,
  TemplateMountContext,
  TemplateTimelineContext,
} from "./types";

function createTextElement(
  className: string,
  text: string,
  tagName: "p" | "h1",
): HTMLElement | null {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return null;
  }

  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = normalizedText;
  return element;
}

function mount(context: TemplateMountContext): HTMLElement {
  const root = document.createElement("article");
  root.className = "poster template-minimal-clean";
  root.dataset.template = "minimal-clean";

  const glowPrimary = document.createElement("div");
  glowPrimary.className = "template-minimal-clean__glow template-minimal-clean__glow--primary";
  glowPrimary.setAttribute("aria-hidden", "true");

  const glowSecondary = document.createElement("div");
  glowSecondary.className = "template-minimal-clean__glow template-minimal-clean__glow--secondary";
  glowSecondary.setAttribute("aria-hidden", "true");

  const panel = document.createElement("section");
  panel.className = "template-minimal-clean__panel";

  const content = document.createElement("div");
  content.className = "template-minimal-clean__content";

  const eyebrow = createTextElement(
    "template-minimal-clean__eyebrow",
    context.job.content.eyebrow,
    "p",
  );

  const headline = createTextElement(
    "template-minimal-clean__headline",
    context.job.content.headline,
    "h1",
  );

  const subtitle = createTextElement(
    "template-minimal-clean__subtitle",
    context.job.content.subtitle,
    "p",
  );

  if (eyebrow) {
    content.append(eyebrow);
  }

  if (headline) {
    content.append(headline);
  }

  if (subtitle) {
    content.append(subtitle);
  }

  panel.append(content);
  root.append(glowPrimary, glowSecondary, panel);

  return root;
}

function createTimeline(context: TemplateTimelineContext): gsap.core.Timeline {
  const { root } = context;
  const select = gsap.utils.selector(root);
  const timeline = gsap.timeline({ paused: true });

  const panel = select(".template-minimal-clean__panel");
  const glows = select(".template-minimal-clean__glow");
  const eyebrow = select(".template-minimal-clean__eyebrow");
  const headline = select(".template-minimal-clean__headline");
  const subtitle = select(".template-minimal-clean__subtitle");

  timeline
    .set(root, { autoAlpha: 1 })
    .from(panel, {
      autoAlpha: 0,
      scale: 0.96,
      y: 28,
      duration: 0.9,
      ease: "power3.out",
    })
    .from(
      glows,
      {
        autoAlpha: 0,
        scale: 0.65,
        duration: 1.3,
        stagger: 0.16,
        ease: "power2.out",
      },
      0.05,
    )
    .from(
      eyebrow,
      {
        autoAlpha: 0,
        y: 18,
        duration: 0.5,
        ease: "power2.out",
      },
      0.25,
    )
    .from(
      headline,
      {
        autoAlpha: 0,
        y: 42,
        duration: 0.9,
        ease: "power3.out",
      },
      0.48,
    )
    .from(
      subtitle,
      {
        autoAlpha: 0,
        y: 24,
        duration: 0.65,
        ease: "power2.out",
      },
      0.95,
    )
    .to(
      glows,
      {
        xPercent: 4,
        yPercent: -3,
        duration: Math.max(2.5, context.job.duration - 1.1),
        ease: "sine.inOut",
      },
      0.8,
    );

  const remainingDuration = context.job.duration - timeline.duration();

  if (remainingDuration > 0) {
    timeline.to({}, { duration: remainingDuration });
  }

  return timeline;
}

export const minimalCleanTemplate: TemplateDefinition = {
  id: "minimal-clean",
  mount,
  createTimeline,
};