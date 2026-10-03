import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface Category {
  slug: string;
  label: string;
  description: string;
}

const CATEGORIES_PATH = fileURLToPath(new URL("../../categories.json", import.meta.url));

export function readCategories(): Category[] {
  return JSON.parse(readFileSync(CATEGORIES_PATH, "utf8")) as Category[];
}

export function categorySlugs(categories: Category[]): Set<string> {
  return new Set(categories.map((category) => category.slug));
}
