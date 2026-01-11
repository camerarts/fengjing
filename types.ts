export enum ProjectStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface KeyItem {
  id: string;
  name: string;
  key: string; // Stored locally
  isDefault: boolean;
  createdAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  description: string;
  moduleKey?: string;
}

export interface Inspiration {
  id: string;
  category: string;
  viralTitle: string;
  rating?: string;
  trafficLogic?: string;
  content: string;
  createdAt: number;
  marked?: boolean;
}

export interface TitleItem {
    title: string;
    keywords?: string;
    type?: string;
    score: number;
}

export interface StoryboardFrame {
    id: string;
    sceneNumber: number;
    originalText: string;
    description: string;
    imagePrompt?: string;
    imageUrl?: string;
    imageModel?: string;
    skipGeneration?: boolean;
}

export interface CoverOption {
    visual: string;
    copy: string;
    score: number;
    leftPrompt?: string;
    rightPrompt?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  status: ProjectStatus;
  
  // New Core Fields
  creativePlan: string; // 创意方案
  
  // Generated Results
  storyboardZh?: string; // 9条中文分镜描述
  storyboardEn?: string; // 9条英文分镜描述
  
  grid3x3Zh?: string; // 3x3 中文描述
  grid3x3En?: string; // 3x3 英文描述

  // Legacy fields (optional/deprecated for compatibility)
  inputs?: any;
  script?: string;
  storyboard?: StoryboardFrame[];
  titles?: TitleItem[];
  summary?: string;
  coverOptions?: CoverOption[];
  coverOptionsB?: CoverOption[];
  coverBgOptions?: any[];
  coverBgImageDescription?: string;
  
  coverImage?: { imageUrl: string };
  moduleTimestamps?: Record<string, number>;
}

export const DEFAULT_PROMPTS: Record<string, PromptTemplate> = {
  STORYBOARD_GEN: {
    id: 'storyboard_gen',
    name: '生成视频分镜 (9镜头)',
    description: '生成9个分镜画面的中英文描述',
    template: `你是一位专业的分镜师。请根据用户的【创意方案】，设计 9 个核心分镜画面。

要求：
1. 必须生成 9 个画面。
2. 画面描述要具体（包含景别、动作、环境、光影）。
3. 输出两部分：
   第一部分：中文画面描述，按 1-9 编号。
   第二部分：英文画面描述 (Midjourney/Stable Diffusion 风格提示词)，按 1-9 编号。

用户创意方案：
{{creativePlan}}

请严格按照以下 JSON 格式返回：
{
  "chinese": "1. [描述1]\\n2. [描述2]...",
  "english": "1. [Prompt1]\\n2. [Prompt2]..."
}`
  },
  GRID_GEN: {
    id: 'grid_gen',
    name: '生成 3x3 分镜图描述',
    description: '将9个分镜整合为3x3九宫格描述',
    template: `请基于以下 9 个分镜画面，生成一个 3x3 九宫格的组合画面描述。

要求：
1. 将 9 个画面的内容整合。
2. 保持 3x3 的布局逻辑（左上、中上、右上...）。
3. 分别输出中文和英文版本。
4. 不需要添加前缀，只输出核心的画面组合描述。

分镜内容：
{{storyboardContent}}

请严格按照以下 JSON 格式返回：
{
  "chinese": "[3x3 中文详细描述...]",
  "english": "[3x3 English Detailed Prompt...]"
}`
  },
  INSPIRATION_EXTRACT: {
    id: 'inspiration_extract',
    name: '灵感提取',
    description: '从文本中提取分类和标题',
    template: `请分析以下内容，提取出【分类】、【爆款标题】和【流量逻辑】（如果有）。
    
    内容：
    {{content}}
    
    请返回 JSON 格式：
    {
      "category": "...",
      "viralTitle": "...",
      "trafficLogic": "..."
    }`
  },
  AI_TITLES_GENERATOR: {
      id: 'ai_titles_generator',
      name: 'AI 标题生成',
      description: '生成多个爆款标题和封面方案',
      template: `请为以下主题生成 5 个爆款视频标题，以及一个高点击率的封面设计方案。
      
      主题：{{TITLE_DIRECTION}}
      
      要求：
      1. 标题要吸引人，符合短视频平台调性。
      2. 封面方案包含【画面描述】和【封面文字】。
      
      返回 JSON 格式：
      {
          "titles": [
              { "title": "...", "score": 95 },
              ...
          ],
          "coverVisual": "...",
          "coverText": "..."
      }`
  }
};