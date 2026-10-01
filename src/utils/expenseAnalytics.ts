import type { Expense, ExpenseCategory } from '../types/expense'
import { expenseCategories } from '../types/expense'

export interface CategoryTotal {
  category: ExpenseCategory
  /** Sum of every expense amount in this category. */
  total: number
  /** Share of overall spending, as a percentage rounded to one decimal place. */
  percentage: number
  /** Bar width relative to the largest category total, 0-100. */
  barPercentage: number
}

/**
 * Aggregates spending per category from the full expense list.
 * Categories without expenses are omitted, results are sorted by total
 * descending, and every share is measured against the largest category total
 * so the bars can be drawn without any extra state.
 */
export function getCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<ExpenseCategory, number>(expenseCategories.map((category) => [category, 0]))

  let totalSpent = 0

  for (const expense of expenses) {
    const current = totals.get(expense.category) ?? 0
    const next = current + expense.amount

    totals.set(expense.category, next)
    totalSpent += expense.amount
  }

  const present = expenseCategories
    .map((category) => ({ category, total: totals.get(category) ?? 0 }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total)

  const largest = present[0]?.total ?? 0

  return present.map((entry) => ({
    category: entry.category,
    total: entry.total,
    percentage: totalSpent > 0 ? roundToOneDecimal((entry.total / totalSpent) * 100) : 0,
    barPercentage: largest > 0 ? roundToOneDecimal((entry.total / largest) * 100) : 0,
  }))
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}
