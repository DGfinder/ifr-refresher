"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/types/section";

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryList({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryListProps) {
  return (
    <>
      {/* Mobile: Horizontal scrollable list */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedCategoryId === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategoryId === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* Desktop: Vertical sidebar */}
      <div className="hidden md:block">
        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
              selectedCategoryId === null
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left transition-colors",
                selectedCategoryId === category.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <div className="text-sm font-medium">{category.title}</div>
              <div
                className={cn(
                  "mt-0.5 text-xs",
                  selectedCategoryId === category.id
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {category.description}
              </div>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
