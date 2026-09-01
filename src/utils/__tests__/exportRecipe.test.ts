import { describe, it, expect } from 'vitest';
import {
  recipeToMarkdown,
  recipeToPrintableHtml,
  toSafeFileName,
  wrapText,
} from '../exportRecipe';

const recipe = {
  title: 'Mapo Tofu',
  ingredients: ['tofu', '  ', 'doubanjiang'],
  steps: ['Cube the tofu', '', 'Simmer'],
  cuisine: 'Chinese',
  sourceUrl: 'https://example.com/mapo',
};

describe('recipeToMarkdown', () => {
  it('formats ingredients and numbered steps, dropping blank lines', () => {
    const markdown = recipeToMarkdown(recipe);

    expect(markdown).toContain('# Mapo Tofu');
    expect(markdown).toContain('- tofu');
    expect(markdown).toContain('- doubanjiang');
    expect(markdown).toContain('1. Cube the tofu');
    expect(markdown).toContain('2. Simmer');
    expect(markdown).toContain('https://example.com/mapo');
  });

  it('stays valid when the recipe is empty', () => {
    const markdown = recipeToMarkdown({ title: '', ingredients: [], steps: [] });

    expect(markdown).toContain('# Untitled Recipe');
    expect(markdown).toContain('_No ingredients_');
    expect(markdown).toContain('_No instructions_');
  });
});

describe('wrapText', () => {
  // 10px per character keeps the expected line breaks easy to reason about.
  const measure = (text: string) => text.length * 10;

  it('breaks a long line at word boundaries', () => {
    expect(wrapText('one two three four', 100, measure)).toEqual([
      'one two',
      'three four',
    ]);
  });

  it('splits a word that is longer than the line instead of overflowing', () => {
    expect(wrapText('supercalifragilistic', 50, measure)).toEqual([
      'super',
      'calif',
      'ragil',
      'istic',
    ]);
  });

  it('wraps CJK text that has no spaces to break on', () => {
    const sentence = '将洋葱切丁然后放入锅中翻炒';
    const lines = wrapText(sentence, 50, measure);

    expect(lines).toEqual(['将洋葱切丁', '然后放入锅', '中翻炒']);
    // No characters may be lost while wrapping.
    expect(lines.join('')).toBe(sentence);
  });

  it('returns nothing for blank input', () => {
    expect(wrapText('   ', 100, measure)).toEqual([]);
  });
});

describe('toSafeFileName', () => {
  it('strips characters that break downloads on Windows/macOS', () => {
    expect(toSafeFileName('Mom\'s "Best" Pasta: 1/2 batch')).toBe(
      "Mom's-Best-Pasta-12-batch.md"
    );
  });

  it('falls back to a default name when nothing usable remains', () => {
    expect(toSafeFileName('///')).toBe('recipe.md');
  });
});

describe('recipeToPrintableHtml', () => {
  it('escapes scraped content so it cannot inject markup', () => {
    const html = recipeToPrintableHtml({
      title: '<img src=x onerror=alert(1)>',
      ingredients: ['<script>alert("xss")</script>'],
      steps: ['a & b'],
    });

    // The payloads must survive only as inert text, never as real tags.
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('a &amp; b');
  });
});
