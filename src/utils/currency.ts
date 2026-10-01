const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats a number as Nigerian Naira, e.g. 15300 -> "₦15,300.00". */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return nairaFormatter.format(0)
  }

  return nairaFormatter.format(amount)
}