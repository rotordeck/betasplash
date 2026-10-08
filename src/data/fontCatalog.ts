import snapshot from './fontCatalog.json';

export interface CatalogFont {
  name: string;
  category: string;
  tags: string[];
  weight: string;
  url: string;
}

export const FONT_CATALOG: CatalogFont[] = snapshot;
