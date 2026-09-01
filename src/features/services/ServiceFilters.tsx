import { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatCategory } from '../../lib/format';
import type { ServiceCategory } from '../../types/service';

type ServiceFiltersProps = {
  q: string;
  category: string;
  categories: ServiceCategory[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export function ServiceFilters({
  q,
  category,
  categories,
  onQueryChange,
  onCategoryChange,
}: ServiceFiltersProps) {
  const [draft, setDraft] = useState(q);
  const debounced = useDebouncedValue(draft, 350);

  useEffect(() => {
    setDraft(q);
  }, [q]);

  useEffect(() => {
    if (debounced !== q) {
      onQueryChange(debounced);
    }
  }, [debounced, onQueryChange, q]);

  return (
    <div className="filters">
      <input
        className="search"
        type="search"
        value={draft}
        placeholder="Search services, providers, or categories"
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Search services"
      />
      <div className="chips" role="group" aria-label="Category">
        <button
          type="button"
          className={`chip ${category === '' ? 'active' : ''}`}
          onClick={() => onCategoryChange('')}
        >
          All
        </button>
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={`chip ${category === item ? 'active' : ''}`}
            onClick={() => onCategoryChange(item)}
          >
            {formatCategory(item)}
          </button>
        ))}
      </div>
    </div>
  );
}
