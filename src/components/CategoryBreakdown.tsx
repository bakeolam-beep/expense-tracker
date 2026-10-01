import type { CategoryTotal } from '../utils/expenseAnalytics'
import { formatCurrency } from '../utils/currency'
import './CategoryBreakdown.css'

interface CategoryBreakdownProps {
  totals: CategoryTotal[]
}

function CategoryBreakdown({ totals }: CategoryBreakdownProps) {
  if (totals.length === 0) {
    return null
  }

  return (
    <section className="card panel breakdown" aria-labelledby="category-breakdown-heading">
      <div className="panel__header">
        <h2 id="category-breakdown-heading" className="panel__title">
          Spending by Category
        </h2>
      </div>

      <ul className="breakdown__list">
        {totals.map((entry) => (
          <li key={entry.category} className="breakdown__item">
            <div className="breakdown__meta">
              <span className="breakdown__name">{entry.category}</span>
              <span className="breakdown__value">
                <span className="breakdown__amount">{formatCurrency(entry.total)}</span>
                <span aria-hidden="true">·</span>
                <span>{entry.percentage.toFixed(1)}%</span>
              </span>
            </div>

            <div
              className="breakdown__track"
              role="img"
              aria-label={`${entry.category}: ${formatCurrency(entry.total)}, ${entry.percentage.toFixed(1)} percent of total spending`}
            >
              <div
                className="breakdown__bar"
                style={{ width: `${entry.barPercentage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CategoryBreakdown
