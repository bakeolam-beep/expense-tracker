import type { Expense } from '../types/expense'
import ExpenseForm from './ExpenseForm'

interface ExpenseFormViewProps {
  /** Expense being edited. When null the view runs in create mode. */
  expense: Expense | null
  onSubmitExpense: (expense: Expense) => void
  /** Closes the view and returns to the dashboard without changing data. */
  onBack: () => void
}

function ExpenseFormView({ expense, onSubmitExpense, onBack }: ExpenseFormViewProps) {
  const isEditMode = expense !== null

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <nav className="app-nav" aria-label="Primary">
            <button type="button" className="button button--quiet" onClick={onBack}>
              <span className="button__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" focusable="false">
                  <path d="M14.5 5.5 8 12l6.5 6.5" />
                </svg>
              </span>
              Back
            </button>
          </nav>

          <h1 className="dashboard__title">{isEditMode ? 'Edit Expense' : 'Add Expense'}</h1>
        </div>
      </header>

      <ExpenseForm
        expense={expense}
        onSubmitExpense={onSubmitExpense}
        onCancel={onBack}
      />
    </div>
  )
}

export default ExpenseFormView
