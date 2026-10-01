import { useState } from 'react'
import Dashboard from './components/Dashboard'
import type { Expense } from './types/expense'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])

  function handleAddExpense(expense: Expense) {
    setExpenses((previous) => [...previous, expense])
  }

  return <Dashboard expenses={expenses} onAddExpense={handleAddExpense} />
}

export default App