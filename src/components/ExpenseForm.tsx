import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Expense, ExpenseCategory } from '../types/expense'
import { expenseCategories as categories } from '../types/expense'
import './ExpenseForm.css'

interface ExpenseFormProps {
  /** Expense being edited. When null the form runs in create mode. */
  expense: Expense | null
  onSubmitExpense: (expense: Expense) => void
  onCancel: () => void
}

type FieldErrors = Partial<Record<'title' | 'amount' | 'category' | 'date', string>>

function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `expense-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function ExpenseForm({ expense, onSubmitExpense, onCancel }: ExpenseFormProps) {
  const isEditMode = expense !== null

  const [title, setTitle] = useState(expense?.title ?? '')
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [category, setCategory] = useState<ExpenseCategory | ''>(expense?.category ?? '')
  const [date, setDate] = useState(expense?.date ?? today)
  const [errors, setErrors] = useState<FieldErrors>({})
  const titleRef = useRef<HTMLInputElement>(null)

  function resetForm(): void {
    setTitle('')
    setAmount('')
    setCategory('')
    setDate(today())
    setErrors({})
  }

  function handleCancel(): void {
    resetForm()
    onCancel()
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    const parsedAmount = Number(amount)

    if (!title.trim()) {
      next.title = 'Title is required.'
    }

    if (!amount.trim()) {
      next.amount = 'Amount is required.'
    } else if (!Number.isFinite(parsedAmount)) {
      next.amount = 'Amount must be a number.'
    } else if (parsedAmount <= 0) {
      next.amount = 'Amount must be greater than 0.'
    }

    if (!category) {
      next.category = 'Select a category.'
    }

    if (!date) {
      next.date = 'Date is required.'
    }

    return next
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      titleRef.current?.focus()
      return
    }

    onSubmitExpense({
      id: expense?.id ?? createId(),
      title: title.trim(),
      amount: Number(amount),
      category: category as ExpenseCategory,
      date,
    })

    resetForm()
  }

  return (
    <section
      className="card panel expense-form"
      aria-label={isEditMode ? 'Edit expense' : 'Add expense'}
    >
      <form className="expense-form__body" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="expense-title">
            Title
          </label>
          <input
            id="expense-title"
            ref={titleRef}
            className="field__control"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Lunch at work"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'expense-title-error' : undefined}
          />
          {errors.title ? (
            <p className="field__error" id="expense-title-error">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor="expense-amount">
              Amount
            </label>
            <div className="field__affix">
              <span className="field__affix-symbol" aria-hidden="true">
                &#8358;
              </span>
              <input
                id="expense-amount"
                className="field__control field__control--affixed"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                aria-invalid={errors.amount ? true : undefined}
                aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
              />
            </div>
            {errors.amount ? (
              <p className="field__error" id="expense-amount-error">
                {errors.amount}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="expense-date">
              Date
            </label>
            <input
              id="expense-date"
              className="field__control"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={errors.date ? 'expense-date-error' : undefined}
            />
            {errors.date ? (
              <p className="field__error" id="expense-date-error">
                {errors.date}
              </p>
            ) : null}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="expense-category">
            Category
          </label>
          <select
            id="expense-category"
            className="field__control"
            value={category}
            onChange={(event) => setCategory(event.target.value as ExpenseCategory | '')}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={errors.category ? 'expense-category-error' : undefined}
          >
            <option value="">Select a category</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.category ? (
            <p className="field__error" id="expense-category-error">
              {errors.category}
            </p>
          ) : null}
        </div>

        <div className="expense-form__actions">
          <button type="submit" className="button button--primary">
            {isEditMode ? 'Update Expense' : 'Add Expense'}
          </button>
          <button type="button" className="button button--secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default ExpenseForm