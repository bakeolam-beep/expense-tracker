import type { Expense, ExpenseCategory } from '../types/expense'

export type SortOption = 'newest' | 'oldest' | 'highest-amount' | 'lowest-amount'

export const sortOptions: readonly SortOption[] = [
  'newest',
  'oldest',
  'highest-amount',
  'lowest-amount',
]

export const sortOptionLabels: Record<SortOption, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  'highest-amount': 'Highest Amount',
  'lowest-amount': 'Lowest Amount',
}

export const ALL_CATEGORIES = 'all'
export const ALL_MONTHS = 'all'

/** Normalised UI state for the search, filter and sort controls. */
export interface ExpenseQuery {
  search: string
  category: ExpenseCategory | typeof ALL_CATEGORIES
  month: string
  sort: SortOption
}

export const defaultExpenseQuery: ExpenseQuery = {
  search: '',
  category: ALL_CATEGORIES,
  month: ALL_MONTHS,
  sort: 'newest',
}

export interface MonthOption {
  /** `YYYY-MM` key derived from the expense date string. */
  value: string
  /** Human readable label, e.g. "October 2026". */
  label: string
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-\d{2}$/

/** `YYYY-MM` prefix of an ISO date, or null when the date is not a valid ISO string. */
function monthKeyOf(isoDate: string): string | null {
  if (!ISO_DATE_PATTERN.test(isoDate)) {
    return null
  }

  return isoDate.slice(0, 7)
}

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * Formats a `YYYY-MM` key as "October 2026". The key is built as a UTC date so
 * the label never shifts a month regardless of the viewer's timezone.
 */
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return monthLabelFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
}

/** Distinct months present in the expenses, newest first. */
export function getAvailableMonths(expenses: Expense[]): MonthOption[] {
  const keys = new Set<string>()

  for (const expense of expenses) {
    const key = monthKeyOf(expense.date)
    if (key) {
      keys.add(key)
    }
  }

  return [...keys]
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    .map((value) => ({ value, label: formatMonthLabel(value) }))
}

function matchesSearch(expense: Expense, needle: string): boolean {
  return (
    expense.title.toLowerCase().includes(needle) ||
    expense.category.toLowerCase().includes(needle)
  )
}

/**
 * Applies every active filter and then the sort order.
 * The source array is never mutated; a new sorted copy is returned.
 */
export function filterAndSortExpenses(
  expenses: Expense[],
  query: ExpenseQuery,
): Expense[] {
  const needle = query.search.trim().toLowerCase()

  const matches = expenses.filter((expense) => {
    if (needle && !matchesSearch(expense, needle)) {
      return false
    }

    if (query.category !== ALL_CATEGORIES && expense.category !== query.category) {
      return false
    }

    if (query.month !== ALL_MONTHS && monthKeyOf(expense.date) !== query.month) {
      return false
    }

    return true
  })

  const sorted = [...matches]

  switch (query.sort) {
    case 'oldest':
      sorted.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
      break
    case 'highest-amount':
      sorted.sort((a, b) => b.amount - a.amount)
      break
    case 'lowest-amount':
      sorted.sort((a, b) => a.amount - b.amount)
      break
    case 'newest':
    default:
      sorted.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      break
  }

  return sorted
}

/** True when any control differs from its default, i.e. the list is narrowed. */
export function isFiltered(query: ExpenseQuery): boolean {
  return (
    query.search.trim() !== '' ||
    query.category !== ALL_CATEGORIES ||
    query.month !== ALL_MONTHS
  )
}