import { useEffect, useMemo, useState } from 'react'
import Dashboard from './components/Dashboard'
import ExpenseFormView from './components/ExpenseFormView'
import type { Expense } from './types/expense'
import { loadExpenses, saveExpenses } from './utils/storage'
import './App.css'

/**
 * The dashboard is the primary view. Add and Edit are dedicated views that
 * reuse the single ExpenseForm, so the form is never rendered twice.
 */
type View = 'dashboard' | 'add' | 'edit'

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses)
  const [view, setView] = useState<View>('dashboard')
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

  useEffect(() => {
    saveExpenses(expenses)
  }, [expenses])

  // Derived from the expense list so the edit target is never a stale snapshot.
  const editingExpense = useMemo(
    () =>
      editingExpenseId === null
        ? null
        : expenses.find((expense) => expense.id === editingExpenseId) ?? null,
    [expenses, editingExpenseId],
  )

  function goToDashboard() {
    setView('dashboard')
    setEditingExpenseId(null)
  }

  function openAddView() {
    setEditingExpenseId(null)
    setView('add')
  }

  function openEditView(expense: Expense) {
    setEditingExpenseId(expense.id)
    setView('edit')
  }

  function handleSubmitExpense(expense: Expense) {
    const isEditing = editingExpense !== null

    setExpenses((previous) =>
      isEditing
        ? previous.map((item) => (item.id === expense.id ? expense : item))
        : [...previous, expense],
    )
    goToDashboard()
  }

  function handleDeleteExpense(id: string) {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id))
  }

  if (view !== 'dashboard') {
    return (
      <ExpenseFormView
        key={editingExpense?.id ?? 'create'}
        expense={editingExpense}
        onSubmitExpense={handleSubmitExpense}
        onBack={goToDashboard}
      />
    )
  }

  return (
    <Dashboard
      expenses={expenses}
      onAddExpense={openAddView}
      onEditExpense={openEditView}
      onDeleteExpense={handleDeleteExpense}
    />
  )
}

export default App
