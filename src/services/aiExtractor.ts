import { ExtractedRecipe } from '@/types/Recipe';
import { parseCuisine } from '@/utils/parseCuisine';

/**
 * Extracts recipe information from a URL using AI
 * Supports web pages and direct text content
 */
export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  try {
    // Handle text:// protocol for direct text content
    if (url.startsWith('text://')) {
      const textContent = url.replace('text://', '');
      return await extractRecipeWithAI(textContent, '', '');
    }
    
    // Handle regular web pages
    return await extractFromWebPage(url);
  } catch (error) {
    console.error('Error extracting recipe:', error);
    throw error;
  }
}

/**
 * Extracts recipe from regular web pages
 */
async function extractFromWebPage(url: string): Promise<ExtractedRecipe> {
  // In production, fetch page content via backend proxy
  // For now, use mock data
  const mockExtraction: ExtractedRecipe = {
    title: extractTitleFromUrl(url),
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    ingredients: [
      'Ingredient 1',
      'Ingredient 2',
      'Ingredient 3',
    ],
    steps: [
      'Step 1: Prepare ingredients',
      'Step 2: Cook according to instructions',
      'Step 3: Serve and enjoy',
    ],
    cuisine: parseCuisine(url),
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return mockExtraction;
}

/**
 * Uses AI (OpenAI/Claude) to extract recipe from text content
 */
async function extractRecipeWithAI(
  content: string,
  imageUrl: string,
  sourceUrl: string
): Promise<ExtractedRecipe> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  // If OpenAI is configured, use it
  if (OPENAI_API_KEY) {
    return await extractWithOpenAI(content, imageUrl);
  }
  
  // Otherwise, use simple text parsing (fallback)
  return parseRecipeFromText(content, imageUrl, sourceUrl);
}

/**
 * Extracts recipe using OpenAI API
 */
async function extractWithOpenAI(
  content: string,
  imageUrl: string
): Promise<ExtractedRecipe> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use cheaper model for video analysis
        messages: [
          {
            role: 'system',
            content: `你是一个专业的食谱提取助手。请从提供的内容中提取食谱信息。

返回一个 JSON 对象，格式如下：
{
  "title": "食谱名称",
  "ingredients": ["食材1", "食材2", ...],
  "steps": ["步骤1", "步骤2", ...],
  "cuisine": "Chinese/Western/Italian/Japanese/Korean"
}

提取规则：
1. **标题**：提取完整的食谱名称
   - 如果标题包含"——"，提取后面的部分（如"30分钟快手晚餐 —— 家常版酸汤肥牛"应提取为"家常版酸汤肥牛"）
   - 去除表情符号和多余文字

2. **食材**：只从【材料】、【配菜】、【调味】等标记的区域内提取
   - 主料：如"肥牛"、"酸菜"
   - 配菜：如"豆腐"、"大白菜"、"金针菇"、"粉丝"
   - 调料：如"姜片"、"葱段"、"蒜末"、"花椒"、"干辣椒"、"盐"、"白胡椒"、"鸡精"
   - **重要**：不要从做法步骤中提取食材，只从标记的食材区域提取
   - 去除括号内的说明文字（如"（我用的芥菜酸菜，用东北的大白菜酸菜也行）"）
   - 每个食材单独列出，去除"我准备了"、"根据自己的口味"等描述性文字

3. **步骤**：只从【做法】或"做法："标记的区域内提取
   - 如果步骤有编号（1. 2. 3.），按编号顺序提取
   - 每个编号步骤单独列出，不要合并
   - 如果步骤包含子步骤（用"-"或"•"标记），将子步骤合并到主步骤中，用分号分隔
   - 确保每个步骤完整清晰，不要截断

4. **菜系**：根据食材和做法判断菜系类型

**关键要求**：
- 严格区分食材区域和步骤区域，不要混淆
- 食材只从【材料】、【配菜】、【调味】区域提取
- 步骤只从【做法】或"做法："区域提取
- 确保步骤按顺序正确分割，不要全部合并成一个步骤`,
          },
          {
            role: 'user',
            content: `请从以下内容中提取食谱信息：\n\n${content.substring(0, 8000)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const extracted = JSON.parse(data.choices[0].message.content);
    
    return {
      title: extracted.title || 'Untitled Recipe',
      image: imageUrl,
      ingredients: Array.isArray(extracted.ingredients) 
        ? extracted.ingredients.filter(Boolean)
        : [],
      steps: Array.isArray(extracted.steps)
        ? extracted.steps.filter(Boolean)
        : [],
      cuisine: parseCuisine(extracted.cuisine || ''),
    };
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    // Fallback to text parsing
    return parseRecipeFromText(content, imageUrl, '');
  }
}

/**
 * Simple text parsing fallback (when AI is not available)
 * Improved to better handle Chinese recipe formats
 */
function parseRecipeFromText(
  content: string,
  imageUrl: string,
  sourceUrl: string
): ExtractedRecipe {
  // Clean and normalize content
  const normalizedContent = content
    .replace(/\s+/g, ' ')
    .replace(/[。，、]/g, '\n')
    .replace(/\n+/g, '\n');
  
  const lines = normalizedContent.split('\n').filter(line => line.trim());
  
  // Extract title - look for common patterns
  let title = extractRecipeTitle(content, sourceUrl);
  
  // Extract ingredients - look for 【材料】, 【配菜】, 【调味】, etc.
  const ingredients = extractIngredients(content, lines);
  
  // Extract steps - look for 【做法】, numbered steps, etc.
  const steps = extractSteps(content, lines);
  
  return {
    title: title || '食谱',
    image: imageUrl,
    ingredients: ingredients.length > 0 ? ingredients : ['请手动输入食材'],
    steps: steps.length > 0 ? steps : ['请手动输入步骤'],
    cuisine: parseCuisine(content),
  };
}

/**
 * Extracts recipe title from content
 */
function extractRecipeTitle(content: string, sourceUrl: string): string {
  // Look for common title patterns - improved to handle "30分钟快手晚餐 —— 家常版酸汤肥牛🍽️"
  const titlePatterns = [
    /^(.+?)\s*——\s*(.+?)(?:\s*🍽️|$)/,  // "30分钟快手晚餐 —— 家常版酸汤肥牛🍽️"
    /^(.+?)\s*30分钟\s*(.+?)(?:\s*🍽️|$)/,  // Alternative format
    /家常版(.+?)(?:\s*🍽️|[\s\n])/,  // "家常版酸汤肥牛"
    /^(.+?)\s*🍽️/,  // Title with emoji
    /^(.+?)[——\-]/,  // Title with dash
  ];
  
  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match) {
      // If pattern has 2 groups, combine them; otherwise use first group
      let title = match[2] || match[1];
      if (match[1] && match[2]) {
        // Combine both parts, prefer the second part (actual dish name)
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
    // Check if it's a title (contains dish name, not too long, doesn't start with number or special char)
    if (trimmed.length > 5 && trimmed.length < 80 && 
        !/^\d+[\.、]/.test(trimmed) && 
        !trimmed.startsWith('【') &&
        (/肥牛|酸汤|家常|快手|晚餐|食谱|分钟/.test(trimmed) || trimmed.includes('——'))) {
      // Extract the dish name part if it contains "——"
      if (trimmed.includes('——')) {
        const parts = trimmed.split('——');
        return parts[parts.length - 1].trim().replace(/🍽️/g, '').trim();
      }
      return trimmed.replace(/🍽️/g, '').trim();
    }
  }
  
  return extractTitleFromUrl(sourceUrl);
}

/**
 * Extracts ingredients from content
 * Only extracts from marked sections to avoid mixing with steps
 */
function extractIngredients(content: string, _lines: string[]): string[] {
  const ingredients: string[] = [];
  
  // Find where the method section starts to avoid extracting from steps
  const methodStartPattern = /(?:做法|步骤|🥣)/;
  const methodStartIndex = content.search(methodStartPattern);
  const contentBeforeMethod = methodStartIndex > 0 
    ? content.substring(0, methodStartIndex) 
    : content;
  
  // Look for 【材料】, 【配菜】, 【调味】 sections - ONLY before method section
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
      // Split by common separators and clean up
      const items = section
        .split(/[，,、\n]/)
        .map(item => {
          // Remove parenthetical notes like "（我用的芥菜酸菜，用东北的大白菜酸菜也行）"
          item = item.replace(/（[^）]*）/g, '').trim();
          // Remove extra spaces
          return item.trim();
        })
        .filter(item => {
          // Filter out items that are too long (likely descriptions, not ingredients)
          // Filter out items that look like steps (contain action verbs)
          const actionVerbs = ['准备', '焯', '炒', '煮', '加', '放', '倒入'];
          const isStep = actionVerbs.some(verb => item.includes(verb));
          return item.length > 0 && item.length < 50 && !isStep;
        });
      
      ingredients.push(...items);
    }
  }
  
  // Clean and deduplicate
  const cleaned = ingredients
    .map(ing => {
      // Remove common prefixes like "我准备了"、"根据自己的口味"
      return ing.replace(/^(我|根据|自己|准备|爱吃的菜|即可|今天|准备了|和)/, '').trim();
    })
    .filter(ing => ing.length > 0 && ing.length < 50);
  
  return Array.from(new Set(cleaned))
    .filter(ing => ing.length > 0)
    .slice(0, 30);
}

/**
 * Extracts cooking steps from content
 * Improved to properly split numbered steps and handle sub-steps
 */
function extractSteps(content: string, _lines: string[]): string[] {
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
    // If no method section found, look for numbered steps in entire content
    methodSection = content;
  }
  
  // Extract numbered steps (1. 2. 3. etc.)
  // Improved regex to handle multi-line steps and sub-steps
  const numberedStepPattern = /(?:^|\n)\s*(\d+)[\.、]\s*([^\n]+(?:\n(?!\s*\d+[\.、])(?!\s*[-•])\s*[^\n]+)*)/g;
  let stepMatch;
  const stepMap = new Map<number, string>();
  
  while ((stepMatch = numberedStepPattern.exec(methodSection)) !== null) {
    const stepNum = parseInt(stepMatch[1]);
    let stepText = stepMatch[2].trim();
    
    // Clean up step text - remove extra whitespace, handle sub-bullets
    stepText = stepText
      .replace(/\n\s*[-•]\s*/g, '；')  // Convert sub-bullets to semicolons
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
  
  // If no numbered steps found, try to split by lines that look like steps
  if (steps.length === 0) {
    const methodLines = methodSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Filter out lines that are too short, too long, or look like ingredients
        const isTooShort = line.length < 10;
        const isTooLong = line.length > 300;
        const looksLikeIngredient = /^(肥牛|酸菜|豆腐|白菜|金针菇|粉丝|姜|葱|蒜|花椒|辣椒|盐|胡椒|鸡精)/.test(line);
        const isNumberOnly = /^\d+$/.test(line);
        return !isTooShort && !isTooLong && !looksLikeIngredient && !isNumberOnly;
      });
    
    // Group consecutive lines that form a complete step
    let currentStep = '';
    for (const line of methodLines) {
      // If line starts with action verb or number, it's likely a new step
      if (/^[1-9一二三四五六七八九十][\.、]/.test(line) || 
          /^(焯|炒|煮|烤|蒸|加|放|倒入|加入|放入|准备|切|锅|把|撒|泼)/.test(line)) {
        if (currentStep) {
          steps.push(currentStep.trim());
          currentStep = '';
        }
        currentStep = line;
      } else if (currentStep) {
        // Continue current step
        currentStep += ' ' + line;
      } else {
        // New step
        currentStep = line;
      }
    }
    if (currentStep) {
      steps.push(currentStep.trim());
    }
  }
  
  // Clean and deduplicate
  return Array.from(new Set(steps))
    .filter(step => step.length > 5 && step.length < 400)
    .slice(0, 20);
}

/**
 * Example implementation with OpenAI (uncomment and configure when ready)
 */
/*
export async function extractRecipeFromUrlWithOpenAI(url: string): Promise<ExtractedRecipe> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Fetch page content (you'll need a backend proxy for this due to CORS)
  const pageContent = await fetchPageContent(url);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a recipe extraction assistant. Extract recipe information from the provided content and return it as JSON with the following structure: {title: string, ingredients: string[], steps: string[], cuisine: string, image: string}',
        },
        {
          role: 'user',
          content: `Extract recipe information from this content:\n\n${pageContent}`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const data = await response.json();
  const extracted = JSON.parse(data.choices[0].message.content);
  
  return {
    title: extracted.title,
    image: extracted.image || '',
    ingredients: Array.isArray(extracted.ingredients) ? extracted.ingredients : [],
    steps: Array.isArray(extracted.steps) ? extracted.steps : [],
    cuisine: parseCuisine(extracted.cuisine || ''),
  };
}
*/

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const title = pathParts[pathParts.length - 1] || 'Untitled Recipe';
    // Decode URL-encoded characters
    return decodeURIComponent(title).replace(/[-_]/g, ' ');
  } catch {
    return 'Untitled Recipe';
  }
}

