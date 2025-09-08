export interface Feature {
  featureName: string;
  productOneValue: string;
  productTwoValue: string;
  learnMoreUrl?: string;
}

export interface ComparisonCategory {
  category: string;
  features: Feature[];
}

export interface CategoryMismatchInfo {
    isMismatch: boolean;
    productOneCategory: string;
    productTwoCategory: string;
    wittyRemark: string;
}

export interface ComparisonData {
  productOneName: string;
  productTwoName: string;
  productOneImageUrl?: string;
  productTwoImageUrl?: string;
  comparison: ComparisonCategory[];
  analysis: string;
  categoryMismatch?: CategoryMismatchInfo;
}

export class WittyCategoryMismatchError extends Error {
    constructor(public wittyMessage: string) {
        super(wittyMessage);
        this.name = 'WittyCategoryMismatchError';
    }
}