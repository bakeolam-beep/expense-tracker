import type { Expense } from '../types/expense'

export interface ExpenseSummary {
  /** Sum of every expense amount. */
  totalSpent: number
  /** Sum of amounts dated within the current calendar month and year. */
  thisMonth: number
  /** Number of expenses. */
  transactions: number
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Reads the year and month from an ISO `YYYY-MM-DD` string without creating a
 * Date, so no timezone conversion can shift the value across a month boundary.
 */
function readYearMonth(
  isoDate: string,
): { year: number; month: number } | null {
  const match = ISO_DATE_PATTERN.exec(isoDate)
  if (!match) {
    return null
  }

  return { year: Number(match[1]), month: Number(match[2]) }
}

/** True when the expense's ISO date falls in the current calendar month and year. */
export function isInCurrentMonth(isoDate: string, reference: Date = new Date()): boolean {
  const parsed = readYearMonth(isoDate)
  if (!parsed) {
    return false
  }

  return parsed.year === reference.getFullYear() && parsed.month === reference.getMonth() + 1
}

function sumAmounts(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

/** Derives the dashboard summary values from the single source of truth expense list. */
export function summariseExpenses(expenses: Expense[]): ExpenseSummary {
  const thisMonthExpenses = expenses.filter((expense) => isInCurrentMonth(expense.date))

  return {
    totalSpent: sumAmounts(expenses),
    thisMonth: sumAmounts(thisMonthExpenses),
    transactions: expenses.length,
  }
}