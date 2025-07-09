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
  نوع_القضية: string;
  التكييف_القانوني: string[];
  النصوص_القانونية_ذات_الصلة: string[];
  الوقائع_الجوهرية: string[];
  العناصر_المادية_والمعنوية: string[];
  الدفاعات_الممكنة: string[];
  الإجراءات_المقترحة: string[];
  سوابق_قضائية_مغربية_محتملة: string[];
  raw?: string;
}
