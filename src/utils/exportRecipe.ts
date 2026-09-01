/**
 * Lets anyone (including guests) keep a recipe on their own device after an
 * AI extraction, without needing an account. Saving to the account stays a
 * separate action for people building a long-term recipe book.
 */

export interface ExportableRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  cuisine?: string;
  sourceUrl?: string;
}

function cleanLines(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter(Boolean);
}

export function recipeToMarkdown(recipe: ExportableRecipe): string {
  const title = recipe.title.trim() || 'Untitled Recipe';
  const ingredients = cleanLines(recipe.ingredients);
  const steps = cleanLines(recipe.steps);

  const sections = [`# ${title}`];

  if (recipe.cuisine) sections.push(`_Cuisine: ${recipe.cuisine}_`);

  sections.push(
    '## Ingredients',
    ingredients.length ? ingredients.map((item) => `- ${item}`).join('\n') : '_No ingredients_'
  );

  sections.push(
    '## Instructions',
    steps.length
      ? steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
      : '_No instructions_'
  );

  if (recipe.sourceUrl) sections.push(`## Source\n${recipe.sourceUrl}`);

  return `${sections.join('\n\n')}\n`;
}

/**
 * Builds a file name that is safe on Windows, macOS and Android. Reserved
 * characters would otherwise make the download silently fail on some devices.
 */
export function toSafeFileName(title: string, extension = 'md'): string {
  const base = title
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return `${base || 'recipe'}.${extension}`;
}

export function downloadRecipeAsMarkdown(recipe: ExportableRecipe): void {
  const blob = new Blob([recipeToMarkdown(recipe)], {
    type: 'text/markdown;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = toSafeFileName(recipe.title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Give the browser a moment to start the download before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Wraps text to a pixel width. The measuring function is injected so the
 * layout logic stays testable without a real canvas.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (text: string) => number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let current = '';

  const pushCurrent = () => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (measure(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }

    // The word does not fit alongside what we already have.
    pushCurrent();

    if (measure(word) <= maxWidth) {
      current = word;
      continue;
    }

    // A single word wider than the line: CJK text has no spaces to break on,
    // so fall back to splitting per character to avoid overflowing the canvas.
    for (const char of word) {
      const next = current + char;
      if (current && measure(next) > maxWidth) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }
  }

  pushCurrent();
  return lines;
}

interface CardLine {
  text: string;
  font: string;
  color: string;
  spacingBefore: number;
  lineHeight: number;
}

const CARD_WIDTH = 1080;
const CARD_PADDING = 72;
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif';

/**
 * Lays the recipe out as a shareable card. Returns the lines plus the total
 * height so the canvas can be sized to the content instead of being cropped.
 */
function buildCardLines(
  recipe: ExportableRecipe,
  measure: (text: string, font: string) => number
): { lines: CardLine[]; height: number } {
  const maxWidth = CARD_WIDTH - CARD_PADDING * 2;
  const lines: CardLine[] = [];

  const push = (
    text: string,
    font: string,
    color: string,
    lineHeight: number,
    spacingBefore: number
  ) => {
    const wrapped = wrapText(text, maxWidth, (value) => measure(value, font));
    wrapped.forEach((line, index) => {
      lines.push({
        text: line,
        font,
        color,
        lineHeight,
        spacingBefore: index === 0 ? spacingBefore : 0,
      });
    });
  };

  const titleFont = `bold 56px ${FONT_STACK}`;
  const headingFont = `bold 34px ${FONT_STACK}`;
  const bodyFont = `28px ${FONT_STACK}`;
  const metaFont = `24px ${FONT_STACK}`;

  push(recipe.title.trim() || 'Untitled Recipe', titleFont, '#111111', 68, 0);

  if (recipe.cuisine) push(recipe.cuisine, metaFont, '#6b7280', 34, 12);

  const ingredients = recipe.ingredients.map((i) => i.trim()).filter(Boolean);
  const steps = recipe.steps.map((s) => s.trim()).filter(Boolean);

  if (ingredients.length) {
    push('Ingredients', headingFont, '#111111', 44, 48);
    ingredients.forEach((item) => push(`•  ${item}`, bodyFont, '#374151', 40, 10));
  }

  if (steps.length) {
    push('Instructions', headingFont, '#111111', 44, 48);
    steps.forEach((step, index) => push(`${index + 1}.  ${step}`, bodyFont, '#374151', 40, 14));
  }

  if (recipe.sourceUrl) push(recipe.sourceUrl, metaFont, '#9ca3af', 34, 44);

  const contentHeight = lines.reduce(
    (total, line) => total + line.spacingBefore + line.lineHeight,
    0
  );

  return { lines, height: contentHeight + CARD_PADDING * 2 };
}

function renderRecipeCard(recipe: ExportableRecipe): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser');

  const measure = (text: string, font: string) => {
    context.font = font;
    return context.measureText(text).width;
  };

  const { lines, height } = buildCardLines(recipe, measure);

  // Render at device resolution so the image stays sharp on phone screens.
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CARD_WIDTH * scale;
  canvas.height = height * scale;
  context.scale(scale, scale);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, CARD_WIDTH, height);

  let y = CARD_PADDING;
  for (const line of lines) {
    y += line.spacingBefore + line.lineHeight;
    context.font = line.font;
    context.fillStyle = line.color;
    context.fillText(line.text, CARD_PADDING, y);
  }

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not generate the recipe image'));
    }, 'image/png');
  });
}

/**
 * Saves the recipe as a PNG. On phones this offers the native share sheet
 * (which includes "Save Image" to the camera roll); elsewhere it downloads.
 */
export async function saveRecipeAsImage(recipe: ExportableRecipe): Promise<void> {
  const blob = await canvasToBlob(renderRecipeCard(recipe));
  const fileName = toSafeFileName(recipe.title, 'png');
  const file = new File([blob], fileName, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: recipe.title });
      return;
    } catch (error) {
      // The user dismissing the share sheet is not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      // Otherwise fall through to a normal download.
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function recipeToPrintableHtml(recipe: ExportableRecipe): string {
  const title = escapeHtml(recipe.title.trim() || 'Untitled Recipe');
  const ingredients = cleanLines(recipe.ingredients)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  const steps = cleanLines(recipe.steps)
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join('');
  const cuisine = recipe.cuisine
    ? `<p class="meta">Cuisine: ${escapeHtml(recipe.cuisine)}</p>`
    : '';
  const source = recipe.sourceUrl
    ? `<p class="meta">Source: ${escapeHtml(recipe.sourceUrl)}</p>`
    : '';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; color: #111; line-height: 1.6; }
      h1 { font-size: 1.8rem; margin-bottom: 0.25rem; }
      h2 { font-size: 1.15rem; margin-top: 1.5rem; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem; }
      .meta { color: #555; font-size: 0.9rem; margin: 0.15rem 0; }
      ul, ol { padding-left: 1.25rem; }
      li { margin-bottom: 0.35rem; }
      @page { margin: 16mm; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${cuisine}
    ${source}
    <h2>Ingredients</h2>
    <ul>${ingredients}</ul>
    <h2>Instructions</h2>
    <ol>${steps}</ol>
  </body>
</html>`;
}

/**
 * Opens the browser print dialog, which is how both iOS and desktop users
 * "Save as PDF". Uses a hidden iframe because popup blockers frequently kill
 * `window.open` when it is not treated as a direct user gesture.
 */
export function printRecipe(recipe: ExportableRecipe): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) return;

    frameWindow.focus();
    frameWindow.print();

    // Keep the frame alive until the print dialog has been dismissed.
    window.setTimeout(() => iframe.remove(), 1000);
  };

  document.body.appendChild(iframe);
  iframe.srcdoc = recipeToPrintableHtml(recipe);
}
