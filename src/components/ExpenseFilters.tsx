import type { ExpenseCategory } from '../types/expense'
import { expenseCategories } from '../types/expense'
import type { ExpenseQuery, MonthOption, SortOption } from '../utils/expenseQuery'
import {
  ALL_CATEGORIES,
  ALL_MONTHS,
  sortOptionLabels,
  sortOptions,
} from '../utils/expenseQuery'
import './ExpenseFilters.css'

interface ExpenseFiltersProps {
  query: ExpenseQuery
  months: MonthOption[]
  onQueryChange: (query: ExpenseQuery) => void
  onClear: () => void
  showClear: boolean
}

function ExpenseFilters({
  query,
  months,
  onQueryChange,
  onClear,
  showClear,
}: ExpenseFiltersProps) {
  function update(patch: Partial<ExpenseQuery>) {
    onQueryChange({ ...query, ...patch })
  }

  const selectedMonthMissing =
    query.month !== ALL_MONTHS && !months.some((month) => month.value === query.month)

  return (
    <div className="filters">
      <div className="filters__controls">
        <div className="filters__search">
          <label className="sr-only" htmlFor="expense-search">
            Search expenses
          </label>
          <span className="filters__search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" focusable="false">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
          </span>
          <input
            id="expense-search"
            className="field__control filters__control filters__control--search"
            type="search"
            value={query.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Search expenses..."
            autoComplete="off"
          />
        </div>

        <div className="filters__select">
          <label className="sr-only" htmlFor="expense-filter-category">
            Filter by category
          </label>
          <select
            id="expense-filter-category"
            className="field__control filters__control"
            value={query.category}
            onChange={(event) =>
              update({ category: event.target.value as ExpenseCategory | typeof ALL_CATEGORIES })
            }
          >
            <option value={ALL_CATEGORIES}>All Categories</option>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filters__select">
          <label className="sr-only" htmlFor="expense-filter-month">
            Filter by month
          </label>
          <select
            id="expense-filter-month"
            className="field__control filters__control"
            value={query.month}
            onChange={(event) => update({ month: event.target.value })}
          >
            <option value={ALL_MONTHS}>All Months</option>
            {selectedMonthMissing ? (
              <option value={query.month}>{query.month}</option>
            ) : null}
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filters__select">
          <label className="sr-only" htmlFor="expense-sort">
            Sort expenses
          </label>
          <select
            id="expense-sort"
            className="field__control filters__control"
            value={query.sort}
            onChange={(event) => update({ sort: event.target.value as SortOption })}
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {sortOptionLabels[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showClear ? (
        <button type="button" className="button button--quiet filters__clear" onClick={onClear}>
          Clear Filters
        </button>
      ) : null}
    </div>
  )
}

export default ExpenseFilters