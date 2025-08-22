
export interface Quote {
    id: string;
    quote: string;
    author: string;
    source?: string;
    categoryId: string;
}

export interface QuoteCategory {
    id: string;
    name: string;
    quotes?: Quote[];
}
