import { useState } from 'react'
import Dashboard from './components/Dashboard'
import type { Expense } from './types/expense'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  function handleSubmitExpense(expense: Expense) {
    if (editingExpense) {
      setExpenses((previous) =>
        previous.map((item) => (item.id === expense.id ? expense : item)),
      )
      setEditingExpense(null)
      return
    }

    setExpenses((previous) => [...previous, expense])
  }

  function handleDeleteExpense(id: string) {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id))
    setEditingExpense((current) => (current?.id === id ? null : current))
  }

  return (
    <Dashboard
      expenses={expenses}
      editingExpense={editingExpense}
      onEditingExpenseChange={setEditingExpense}
      onSubmitExpense={handleSubmitExpense}
      onDeleteExpense={handleDeleteExpense}
    />
  )
}

export default App