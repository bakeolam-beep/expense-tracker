# Expense Tracker

A single-page expense tracker built with React, TypeScript and Vite. Add, edit and
delete expenses, review summary totals, narrow the list with search and filters,
and see where the money actually goes. All data is stored in the browser, so there
is no backend, no account and no network traffic.

## Features

- **Add, edit and delete expenses** with title, amount, category and date.
- **Summary cards** for total spent, this month's spending and transaction count.
- **Spending by category** — a proportional bar per category, ordered by spend.
- **Search, category filter, month filter and sorting** for the expense list.
- **Clear filters** to return the list to its unfiltered state.
- **localStorage persistence** with defensive validation of anything read back.
- **Light and dark colour schemes**, following the system preference.
- **Responsive layout** from narrow phones up to wide desktops.

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a local URL, usually `http://localhost:5173`.

## Scripts

| Script              | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the dev server with hot reloading. |
| `npm run build`     | Type-check and build for production.     |
| `npm run preview`   | Serve the production build locally.      |
| `npm run lint`      | Run ESLint over the project.             |

## Project structure

```
index.html                  Document shell
src/
  main.tsx                  Entry point
  App.tsx                   Owns the expense state and persistence
  App.css                   Layout shell, header, buttons, cards, panels
  index.css                 Design tokens, resets, dark scheme
  components/
    Dashboard.tsx           Composes the page and derives summary and category data
    ExpenseForm.tsx         Add and edit form with inline validation
    ExpenseFilters.tsx      Search, category, month and sort controls
    CategoryBreakdown.tsx   Proportional category spending bars
  utils/
    currency.ts             Centralised Naira formatting
    storage.ts              Validated localStorage read and write
    expenseQuery.ts         Search, filter, sort and month helpers
    expenseSummary.ts       Summary card totals
    expenseAnalytics.ts     Per-category totals and percentages
  types/expense.ts          Expense shape and the single category list
```

## Design notes

- `expenseCategories` in `src/types/expense.ts` is the only place categories are
  defined. The form, the filter, the analytics and the storage validator all read
  from it.
- Every monetary value is rendered through `formatCurrency` in
  `src/utils/currency.ts`, so amounts are always shown as Naira.
- Dates are stored as `YYYY-MM-DD` strings and compared by reading the year and
  month out of the string. No `new Date('YYYY-MM-DD')` parsing is used for
  comparisons, which keeps month boundaries correct in every timezone.
- The summary cards and the category breakdown are derived from the full expense
  list. Search, filtering and sorting only affect which expenses the list shows,
  never the stored data or the overall totals.
- `loadExpenses` discards any stored entry that is not a valid expense, so
  hand-edited or corrupted localStorage data cannot break the app. Storage
  failures — blocked, unavailable or over quota — are swallowed and the app keeps
  working in memory.
