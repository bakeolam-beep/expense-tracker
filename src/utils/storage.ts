import type { Expense, ExpenseCategory } from '../types/expense'
import { expenseCategories } from '../types/expense'

export const STORAGE_KEY = 'expense-tracker-expenses'

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

/**
 * Validates a `YYYY-MM-DD` string as a real calendar date using integer
 * arithmetic only, so no timezone or locale parsing can influence the result.
 */
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (month < 1 || month > 12) {
    return false
  }

  const maxDay = month === 2 && isLeapYear(year) ? 29 : daysInMonth[month - 1]

  return day >= 1 && day <= maxDay
}

export function isValidCategory(value: unknown): value is ExpenseCategory {
  return (
    typeof value === 'string' &&
    (expenseCategories as readonly string[]).includes(value)
  )
}

/** Accepts a value only when it matches the full Expense shape. */
export function isValidExpense(value: unknown): value is Expense {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    candidate.amount > 0 &&
    isValidCategory(candidate.category) &&
    isValidIsoDate(candidate.date)
  )
}

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    return window.localStorage
  } catch {
    // Access can throw when storage is blocked by the browser.
    return null
  }
}

/**
 * Reads persisted expenses, discarding malformed entries.
 * Returns an empty array for missing, unreadable or invalid data.
 */
export function loadExpenses(): Expense[] {
  const storage = getStorage()
  if (!storage) {
    return []
  }

  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return []
  }

  if (raw === null) {
    return []
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed.filter(isValidExpense)
}

/**
 * Persists expenses, swallowing quota and availability errors so the running
 * app keeps working when storage is unavailable.
 */
export function saveExpenses(expenses: Expense[]): boolean {
  const storage = getStorage()
  if (!storage) {
    return false
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(expenses))
    return true
  } catch {
    return false
  }
}