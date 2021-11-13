import { SafeHtml } from '@angular/platform-browser';

export interface ArticleShort {
    id: number;
    name: string;
    articles: ArticleChildShort[];
}

export class ArticleChildShort {
    id: number;
    title: string;
}

export interface ArticleById {
    article: ArticleFull,
    articleLike: ArticleFull[];
}

export class ArticleFull {
    id: number;
    name: string;
    categoryId: number;
    category: ArticleCategory[];
    title: string;
    html: SafeHtml;
    path: string;
    tags: ArticleTag[];
    createdAt: string;
    updatedAt: string;
    user: any;
    shortDescription: string;
    status: 'new' | 'end'
}

export interface ArticleTag {
    parent: {
      tag: string
    }
}

export interface ArticleCategory {
    id?: number;
    name: string;
    count: string,
    categoryId: number,
    parent: any;

}

