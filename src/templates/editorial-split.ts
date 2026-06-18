import { gsap } from "gsap";

import type {
  TemplateDefinition,
  TemplateMountContext,
  TemplateTimelineContext,
} from "./types";

type EditorialContent =
  TemplateMountContext["job"]["content"] & {
    secondaryHeadline?: string;
  };

function normalizeText(text: string): string {
  return text.trim();
}

function createWordRow(
  className: string,
  wordClassName: string,
  text: string,
): HTMLDivElement | null {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return null;
  }

  const row = document.createElement("div");
  row.className = className;

  const words = normalizedText.split(/\s+/);

  for (const wordText of words) {
    const word = document.createElement("span");

    word.className = wordClassName;
    word.textContent = wordText;

    row.append(word);
  }

  return row;
}

function createAccentStack(
  text: string,
): HTMLDivElement | null {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return null;
  }

  const stack = document.createElement("div");
  stack.className =
    "template-editorial-split__accent-stack";

  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const lineText of lines) {
    const line = document.createElement("div");

    line.className =
      "template-editorial-split__accent-line";

    line.textContent = lineText;

    stack.append(line);
  }

  return stack;
}

function createSecondaryReveal(
  text: string,
): HTMLDivElement | null {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return null;
  }

  const reveal = document.createElement("div");
  reveal.className =
    "template-editorial-split__reveal";

  const headline = document.createElement("h2");
  headline.className =
    "template-editorial-split__secondary-headline";
  headline.textContent = normalizedText;

  const wipe = document.createElement("span");
  wipe.className =
    "template-editorial-split__wipe";
  wipe.setAttribute("aria-hidden", "true");

  reveal.append(headline, wipe);

  return reveal;
}

function mount(
  context: TemplateMountContext,
): HTMLElement {
  const content =
    context.job.content as EditorialContent;

  const root = document.createElement("article");

  root.className =
    "poster template-editorial-split";

  root.dataset.template = "editorial-split";

  const layout = document.createElement("div");
  layout.className =
    "template-editorial-split__layout";

  /*
   * Bloque superior
   */

  const topSection =
    document.createElement("section");

  topSection.className =
    "template-editorial-split__top";

  const eyebrowRow = createWordRow(
    "template-editorial-split__eyebrow",
    "template-editorial-split__eyebrow-word",
    content.eyebrow,
  );

  const accentStack = createAccentStack(
    content.headline,
  );

  if (eyebrowRow) {
    topSection.append(eyebrowRow);
  }

  if (accentStack) {
    topSection.append(accentStack);
  }

  /*
   * Línea divisoria
   */

  const divider = document.createElement("div");

  divider.className =
    "template-editorial-split__divider";

  divider.setAttribute("aria-hidden", "true");

  /*
   * Bloque inferior
   */

  const bottomSection =
    document.createElement("section");

  bottomSection.className =
    "template-editorial-split__bottom";

  const supportRow = createWordRow(
    "template-editorial-split__support",
    "template-editorial-split__support-word",
    content.subtitle,
  );

  const secondaryReveal =
    createSecondaryReveal(
      content.secondaryHeadline ?? "",
    );

  if (supportRow) {
    bottomSection.append(supportRow);
  }

  if (secondaryReveal) {
    bottomSection.append(secondaryReveal);
  }

  /*
   * Si el bloque inferior no tiene contenido,
   * también se oculta la línea divisoria.
   */

  if (!supportRow && !secondaryReveal) {
    bottomSection.hidden = true;
    divider.hidden = true;
  }

  layout.append(
    topSection,
    divider,
    bottomSection,
  );

  root.append(layout);

  return root;
}

function createTimeline(
  context: TemplateTimelineContext,
): gsap.core.Timeline {
  const { root } = context;

  const select = gsap.utils.selector(root);

  const timeline = gsap.timeline({
    paused: true,
  });

  const divider = select(
    ".template-editorial-split__divider",
  ) as HTMLElement[];

  const eyebrowWords = select(
    ".template-editorial-split__eyebrow-word",
  ) as HTMLElement[];

  const accentLines = select(
    ".template-editorial-split__accent-line",
  ) as HTMLElement[];

  const supportWords = select(
    ".template-editorial-split__support-word",
  ) as HTMLElement[];

  const secondaryHeadline = select(
    ".template-editorial-split__secondary-headline",
  ) as HTMLElement[];

  const wipe = select(
    ".template-editorial-split__wipe",
  ) as HTMLElement[];

  /*
   * Estado inicial general.
   */

  timeline.set(root, {
    autoAlpha: 1,
  });

  /*
   * Estado inicial de la línea divisoria.
   */

  if (divider.length > 0) {
    timeline.set(divider, {
      scaleX: 0,
      clipPath: "inset(0 0 0 0)",
      transformOrigin: "left center",
    });
  }

  /*
   * Estado inicial de los textos.
   */

  if (eyebrowWords.length > 0) {
    timeline.set(eyebrowWords, {
      autoAlpha: 0,
    });
  }

  if (accentLines.length > 0) {
    timeline.set(accentLines, {
      autoAlpha: 0,
    });
  }

  if (supportWords.length > 0) {
    timeline.set(supportWords, {
      autoAlpha: 0,
    });
  }

  /*
   * El texto “sistema.” comienza oculto.
   */

  if (secondaryHeadline.length > 0) {
    timeline.set(secondaryHeadline, {
      autoAlpha: 0,
    });
  }

  /*
   * El bloque violeta ocupa todo el contenedor,
   * pero comienza recortado como una barra vertical.
   */

  if (wipe.length > 0) {
    timeline.set(wipe, {
      autoAlpha: 0,
      clipPath: "inset(0 98% 0 0)",
    });
  }

  /*
   * 0.10–2.20
   * Dibujo de la línea divisoria.
   */

  if (divider.length > 0) {
    timeline.to(
      divider,
      {
        scaleX: 1,
        duration: 2.1,
        ease: "power2.out",
      },
      0.1,
    );
  }

  /*
   * 0.13–0.35
   * Entrada de “Los”.
   */

  if (eyebrowWords.length > 0) {
    timeline.fromTo(
      eyebrowWords[0],
      {
        autoAlpha: 0,
        y: 24,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.22,
        ease: "power2.out",
      },
      0.13,
    );
  }

  /*
   * 0.30–0.50
   * Entrada de “referidos”.
   */

  if (eyebrowWords.length > 1) {
    timeline.fromTo(
      eyebrowWords[1],
      {
        autoAlpha: 0,
        y: 24,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      },
      0.3,
    );
  }

  /*
   * 0.35–0.65
   * Entrada de “son”.
   */

  if (accentLines.length > 0) {
    timeline.fromTo(
      accentLines[0],
      {
        autoAlpha: 0,
        x: 26,
      },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.3,
        ease: "power2.out",
      },
      0.35,
    );
  }

  /*
   * 0.55–0.80
   * Entrada de “buenos.”.
   */

  if (accentLines.length > 1) {
    timeline.fromTo(
      accentLines[1],
      {
        autoAlpha: 0,
        x: -26,
      },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.25,
        ease: "power2.out",
      },
      0.55,
    );
  }

  /*
   * 1.40–2.05
   * Entrada palabra por palabra de:
   * “Pero no son un”.
   */

  supportWords.forEach((word, index) => {
    timeline.fromTo(
      word,
      {
        autoAlpha: 0,
        y: 35,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        ease: "power2.out",
      },
      1.4 + index * 0.15,
    );
  });

  /*
   * 1.90–2.30
   * Revelado limpio de “sistema.”.
   *
   * El rectángulo se controla exclusivamente
   * mediante clip-path. Esto evita residuos,
   * líneas extra y errores de redondeo causados
   * por combinar scaleX, x y transformOrigin.
   */

  if (
    secondaryHeadline.length > 0 &&
    wipe.length > 0
  ) {
    timeline
      /*
       * Aparece como una barra vertical.
       */
      .set(
        wipe,
        {
          autoAlpha: 1,
          clipPath: "inset(0 98% 0 0)",
        },
        1.9,
      )

      /*
       * Se expande hasta cubrir el texto.
       */
      .to(
        wipe,
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.16,
          ease: "power2.out",
        },
        1.9,
      )

      /*
       * El texto aparece detrás del bloque.
       */
      .set(
        secondaryHeadline,
        {
          autoAlpha: 1,
        },
        2.06,
      )

      /*
       * El bloque se retira hacia la derecha,
       * revelando progresivamente el texto.
       */
      .to(
        wipe,
        {
          clipPath: "inset(0 0 0 98%)",
          duration: 0.2,
          ease: "power2.inOut",
        },
        2.06,
      )

      /*
       * La barra final sobrepasa el borde
       * para evitar una línea residual.
       */
      .to(
        wipe,
        {
          clipPath: "inset(0 0 0 101%)",
          duration: 0.04,
          ease: "none",
        },
        2.26,
      )

      .set(
        wipe,
        {
          autoAlpha: 0,
        },
        2.3,
      );
  }

  /*
   * 8.67–8.80
   * Eliminación rápida de la línea divisoria.
   */

  if (divider.length > 0) {
    timeline.to(
      divider,
      {
        clipPath: "inset(0 0 0 101%)",
        duration: 0.13,
        ease: "power2.inOut",
      },
      8.67,
    );
  }

  /*
   * La plantilla dura como mínimo 9.1 segundos.
   * Si job.json solicita una duración mayor,
   * se respeta esa duración.
   */

  const targetDuration = Math.max(
    9.1,
    context.job.duration,
  );

  const remainingDuration =
    targetDuration - timeline.duration();

  if (remainingDuration > 0) {
    timeline.to(
      {},
      {
        duration: remainingDuration,
      },
    );
  }

  return timeline;
}

export const editorialSplitTemplate: TemplateDefinition = {
  id: "editorial-split",
  mount,
  createTimeline,
};