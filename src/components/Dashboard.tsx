import { useMemo, useState } from 'react'
import ExpenseForm from './ExpenseForm'
import type { Expense } from '../types/expense'
import { formatCurrency } from '../utils/currency'
import { summariseExpenses } from '../utils/expenseSummary'

type SummaryCardId = 'total-spent' | 'this-month' | 'transactions'

const summaryCardLabels: Record<SummaryCardId, string> = {
  'total-spent': 'Total Spent',
  'this-month': 'This Month',
  transactions: 'Transactions',
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

interface DashboardProps {
  expenses: Expense[]
  editingExpense: Expense | null
  onEditingExpenseChange: (expense: Expense | null) => void
  onSubmitExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
}

function SummaryIcon({ name }: { name: SummaryCardId }) {
  if (name === 'transactions') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M3 6.5h18M3 12h18M3 17.5h18" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 3.5v17M16.5 7.25c-.6-.85-2.1-1.5-4.1-1.5-2.35 0-4.25 1.2-4.25 3.15 0 4.4 8.85 2.1 8.85 6.6 0 2-1.95 3.25-4.6 3.25-2.3 0-3.95-.75-4.6-1.85" />
    </svg>
  )
}

function Dashboard({
  expenses,
  editingExpense,
  onEditingExpenseChange,
  onSubmitExpense,
  onDeleteExpense,
}: DashboardProps) {
  const [isCreating, setIsCreating] = useState(false)

  const isFormOpen = isCreating || editingExpense !== null

  function closeForm() {
    setIsCreating(false)
    onEditingExpenseChange(null)
  }

  const summary = useMemo(() => summariseExpenses(expenses), [expenses])

  const summaryCards: { id: SummaryCardId; value: string }[] = [
    { id: 'total-spent', value: formatCurrency(summary.totalSpent) },
    { id: 'this-month', value: formatCurrency(summary.thisMonth) },
    { id: 'transactions', value: String(summary.transactions) },
  ]

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Expense Tracker</h1>
          <p className="dashboard__subtitle">Track and manage your spending</p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            className="button button--primary"
            onClick={() => setIsCreating(true)}
          >
            <span className="button__icon" aria-hidden="true">
              +
            </span>
            Add Expense
          </button>
        )}
      </header>

      {isFormOpen && (
        <ExpenseForm
          key={editingExpense?.id ?? 'create'}
          expense={editingExpense}
          onSubmitExpense={onSubmitExpense}
          onCancel={closeForm}
        />
      )}

      <section className="summary" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Spending summary
        </h2>

        {summaryCards.map((card) => (
          <article key={card.id} className="card summary__card">
            <span className="summary__icon">
              <SummaryIcon name={card.id} />
            </span>
            <p className="summary__label">{summaryCardLabels[card.id]}</p>
            <p className="summary__value">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="card panel" aria-labelledby="recent-expenses-heading">
        <div className="panel__header">
          <h2 id="recent-expenses-heading" className="panel__title">
            Recent Expenses
          </h2>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false">
                <path d="M3.5 8.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-8Z" />
                <path d="M3.5 10.5h17M16 14.5h1.5" />
              </svg>
            </span>
            <h3 className="empty-state__title">No expenses yet</h3>
            <p className="empty-state__text">
              Add your first expense to start tracking your spending.
            </p>
          </div>
        ) : (
          <ul className="expense-list">
            {expenses.map((expense) => (
              <li key={expense.id} className="expense-list__item">
                <div className="expense-list__main">
                  <p className="expense-list__title">{expense.title}</p>
                  <p className="expense-list__meta">
                    <span className="expense-list__category">{expense.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={expense.date}>
                      {dateFormatter.format(new Date(`${expense.date}T00:00:00`))}
                    </time>
                  </p>
                </div>

                <p className="expense-list__amount">
                  {formatCurrency(expense.amount)}
                </p>

                <div className="expense-list__actions">
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => {
                      setIsCreating(false)
                      onEditingExpenseChange(expense)
                    }}
                    aria-label={`Edit ${expense.title}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--quiet button--danger"
                    onClick={() => onDeleteExpense(expense.id)}
                    aria-label={`Delete ${expense.title}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Dashboard