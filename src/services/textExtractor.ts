/**
 * Direct text extraction for recipe content
 * Useful when user pastes content directly or when we have the page content
 */

import { ExtractedRecipe } from '@/types/Recipe';
import { parseCuisine } from '@/utils/parseCuisine';

/**
 * Extracts recipe from plain text content
 * This is used when we have the actual page content (e.g., from backend scraping)
 */
export function extractRecipeFromText(content: string, imageUrl?: string): ExtractedRecipe {
  // Clean content
  const cleanContent = content
    .replace(/\s+/g, ' ')
    .trim();

  // Extract title
  const title = extractTitleFromText(cleanContent);
  
  // Extract ingredients
  const ingredients = extractIngredientsFromText(cleanContent);
  
  // Extract steps
  const steps = extractStepsFromText(cleanContent);
  
  return {
    title: title || '食谱',
    image: imageUrl || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    ingredients: ingredients.length > 0 ? ingredients : ['请手动输入食材'],
    steps: steps.length > 0 ? steps : ['请手动输入步骤'],
    cuisine: parseCuisine(cleanContent),
  };
}

function extractTitleFromText(content: string): string {
  // Look for title patterns - improved to handle "30分钟快手晚餐 —— 家常版酸汤肥牛🍽️"
  const patterns = [
    /^(.+?)\s*——\s*(.+?)(?:\s*🍽️|$)/,  // "30分钟快手晚餐 —— 家常版酸汤肥牛🍽️"
    /^(.+?)\s*30分钟\s*(.+?)(?:\s*🍽️|$)/,
    /家常版(.+?)(?:\s*🍽️|[\s\n])/,
    /(.+?)\s*🍽️/,
    /^(.+?)[——\-]/,
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      let title = match[2] || match[1];
      if (match[1] && match[2]) {
        title = match[2].trim() || match[1].trim();
      }
      title = title.trim();
      if (title.length > 3 && title.length < 50) {
        return title;
      }
    }
  }
  
  // Look for first line that looks like a title
  const lines = content.split('\n').filter(line => line.trim());
  for (const line of lines.slice(0, 3)) {
    const trimmed = line.trim();
    if (trimmed.length > 5 && trimmed.length < 80 && 
        !/^\d+[\.、]/.test(trimmed) && 
        !trimmed.startsWith('【') &&
        (trimmed.includes('——') || /肥牛|酸汤|家常|快手|晚餐/.test(trimmed))) {
      if (trimmed.includes('——')) {
        const parts = trimmed.split('——');
        return parts[parts.length - 1].trim().replace(/🍽️/g, '').trim();
      }
      return trimmed.replace(/🍽️/g, '').trim();
    }
  }
  
  return '';
}

function extractIngredientsFromText(content: string): string[] {
  const ingredients: string[] = [];
  
  // Find where the method section starts
  const methodStartPattern = /(?:做法|步骤|🥣)/;
  const methodStartIndex = content.search(methodStartPattern);
  const contentBeforeMethod = methodStartIndex > 0 
    ? content.substring(0, methodStartIndex) 
    : content;
  
  // Look for ingredient sections - ONLY before method section
  const sectionPatterns = [
    /【材料】([\s\S]*?)(?=【|$)/,
    /【配菜】([\s\S]*?)(?=【|$)/,
    /【调味】([\s\S]*?)(?=【|$)/,
    /材料[：:]\s*([\s\S]*?)(?=配菜|做法|步骤|🥣|$)/,
    /配菜[：:]\s*([\s\S]*?)(?=做法|步骤|🥣|$)/,
    /调味[：:]\s*([\s\S]*?)(?=做法|步骤|🥣|$)/,
  ];
  
  for (const pattern of sectionPatterns) {
    const match = contentBeforeMethod.match(pattern);
    if (match && match[1]) {
      const section = match[1];
      const items = section
        .split(/[，,、\n]/)
        .map(item => {
          // Remove parenthetical notes
          item = item.replace(/（[^）]*）/g, '').trim();
          return item.trim();
        })
        .filter(item => {
          const actionVerbs = ['准备', '焯', '炒', '煮', '加', '放', '倒入'];
          const isStep = actionVerbs.some(verb => item.includes(verb));
          return item.length > 0 && item.length < 50 && !isStep;
        });
      ingredients.push(...items);
    }
  }
  
  // Clean and deduplicate
  const cleaned = ingredients
    .map(ing => ing.replace(/^(我|根据|自己|准备|爱吃的菜|即可|今天|准备了|和)/, '').trim())
    .filter(ing => ing.length > 0 && ing.length < 50);
  
  return Array.from(new Set(cleaned))
    .filter(ing => ing.length > 0)
    .slice(0, 30);
}

function extractStepsFromText(content: string): string[] {
  const steps: string[] = [];
  
  // Find the method section
  const methodPatterns = [
    /🥣\s*做法[：:]\s*([\s\S]*?)(?=📝|$)/,
    /【做法】([\s\S]*?)(?=【|📝|$)/,
    /做法[：:]\s*([\s\S]*?)(?=【|📝|$)/,
    /步骤[：:]\s*([\s\S]*?)(?=【|📝|$)/,
  ];
  
  let methodSection = '';
  for (const pattern of methodPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      methodSection = match[1];
      break;
    }
  }
  
  if (!methodSection) {
    methodSection = content;
  }
  
  // Extract numbered steps with improved regex
  const numberedStepPattern = /(?:^|\n)\s*(\d+)[\.、]\s*([^\n]+(?:\n(?!\s*\d+[\.、])(?!\s*[-•])\s*[^\n]+)*)/g;
  let stepMatch;
  const stepMap = new Map<number, string>();
  
  while ((stepMatch = numberedStepPattern.exec(methodSection)) !== null) {
    const stepNum = parseInt(stepMatch[1]);
    let stepText = stepMatch[2].trim();
    
    // Clean up step text
    stepText = stepText
      .replace(/\n\s*[-•]\s*/g, '；')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (stepText.length > 5 && stepText.length < 300) {
      stepMap.set(stepNum, stepText);
    }
  }
  
  // Convert map to array in order
  const sortedSteps = Array.from(stepMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([_, text]) => text);
  
  steps.push(...sortedSteps);
  
  // If no numbered steps, try line-based extraction
  if (steps.length === 0) {
    const methodLines = methodSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        const isTooShort = line.length < 10;
        const isTooLong = line.length > 300;
        const looksLikeIngredient = /^(肥牛|酸菜|豆腐|白菜|金针菇|粉丝|姜|葱|蒜|花椒|辣椒|盐|胡椒|鸡精)/.test(line);
        return !isTooShort && !isTooLong && !looksLikeIngredient;
      });
    
    let currentStep = '';
    for (const line of methodLines) {
      if (/^[1-9一二三四五六七八九十][\.、]/.test(line) || 
          /^(焯|炒|煮|烤|蒸|加|放|倒入|加入|放入|准备|切|锅|把|撒|泼)/.test(line)) {
        if (currentStep) {
          steps.push(currentStep.trim());
          currentStep = '';
        }
        currentStep = line;
      } else if (currentStep) {
        currentStep += ' ' + line;
      } else {
        currentStep = line;
      }
    }
    if (currentStep) {
      steps.push(currentStep.trim());
    }
  }
  
  return Array.from(new Set(steps))
    .filter(step => step.length > 5 && step.length < 400)
    .slice(0, 20);
}

