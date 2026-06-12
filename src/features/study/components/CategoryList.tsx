"use client";

import { cn } from "@/shared/lib/cn";
import type { Category } from "@/content/model/section";

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  /** Used by the mobile accordion to show progress + module counts per
   * category. Returns the matching modules for the section so the caller
   * can compute counts. Optional for back-compat. */
  getCategoryStats?: (categoryId: string) => { completed: number; total: number };
}

/**
 * Vertical category list — designed for both the desktop sidebar and the
 * mobile module-list page. Use within the existing structure on desktop
 * (sidebar with `<aside>`); on mobile, wrap in a `<CategoryAccordion>` so
 * each category collapses by default.
 */
export function CategoryList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  getCategoryStats,
}: CategoryListProps) {
  return (
    <nav className="space-y-1" aria-label="Study categories">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          selectedCategoryId === null
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-secondary",
        )}
      >
        All Categories
      </button>
      {categories.map((category) => {
        const stats = getCategoryStats?.(category.id);
        const isSelected = selectedCategoryId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">{category.title}</span>
              {stats && (
                <span
                  className={cn(
                    "shrink-0 text-[11px] font-medium",
                    isSelected
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {stats.completed}/{stats.total}
                </span>
              )}
            </div>
            <div
              className={cn(
                "mt-0.5 line-clamp-1 text-xs",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {category.description}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
