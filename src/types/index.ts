export interface LegalArticle {
  title: string;
  code: string;
  section: string;
  summary: string;
  relevance: string;
}

export interface Classification {
  category: string;
  description: string;
  confidence: number;
  relevantArticles: LegalArticle[];
}

export interface LegalAnalysis {
  classifications: Classification[];
  keyFactors: string[];
  recommendedActions: string[];
  precedentCases?: string[];
}
