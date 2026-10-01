import {
  STORAGE_KEY,
  loadExpenses,
  saveExpenses,
  isValidExpense,
  isValidIsoDate,
  isValidCategory,
} from './src/utils/storage'
import type { Expense } from './src/types/expense'

let store: Record<string, string> = {}
let throwOnRead = false
let throwOnWrite = false

const mock = {
  getItem(k: string) {
    if (throwOnRead) throw new Error('SecurityError: storage blocked')
    return k in store ? store[k] : null
  },
  setItem(k: string, v: string) {
    if (throwOnWrite) throw new Error('QuotaExceededError')
    store[k] = v
  },
  removeItem(k: string) { delete store[k] },
  clear() { store = {} },
  key: () => null,
  length: 0,
}
;(globalThis as unknown as { window: unknown }).window = { localStorage: mock }

const good: Expense = {
  id: 'a1', title: 'Lunch', amount: 2500, category: 'Food', date: '2026-10-01',
}
const second: Expense = {
  id: 'b2', title: 'Taxi', amount: 900, category: 'Transport', date: '2025-12-31',
}

const write = (v: unknown) => { store[STORAGE_KEY] = typeof v === 'string' ? v : JSON.stringify(v) }
const ids = () => loadExpenses().map((e) => e.id).join(',') || '(none)'

console.log('key                 ', STORAGE_KEY)

console.log('\n--- loadExpenses defensive cases ---')
store = {}
console.log('missing key         ', ids())
write(null);            console.log('JSON null           ', ids())
write('not json{{{');   console.log('invalid JSON        ', ids())
write(undefined);       console.log('JSON undefined      ', ids())
write({ a: 1 });        console.log('object not array    ', ids())
write('"a string"');     console.log('string not array    ', ids())
write('42');             console.log('number not array    ', ids())
write([good, second]);  console.log('valid array         ', ids())
write([]);              console.log('empty array         ', ids())

console.log('\n--- malformed entries are dropped ---')
write([
  good,
  null, 'nope', 42, true, [], {},
  { ...good, id: '' },
  { ...good, id: 123 },
  { ...good, title: '' },
  { ...good, title: '   ' },
  { ...good, title: 99 },
  { ...good, category: 'Yachting' },
  { ...good, category: undefined },
  { ...good, date: '2026-13-01' },
  { ...good, date: '2026-02-30' },
  { ...good, date: 'abc' },
  { ...good, date: '2026-10-1' },
  { ...good, amount: '100' },
  { ...good, amount: 0 },
  { ...good, amount: -5 },
  { ...good, amount: null },
  second,
])
console.log('mixed junk          ', ids())

console.log('\n--- amount rejection ---')
for (const a of [NaN, Infinity, -Infinity, 0, -1, 0.01, '100', null]) {
  console.log(`  amount=${String(a).padEnd(9)} valid=${isValidExpense({ ...good, amount: a })}`)
}

console.log('\n--- date validation (real calendar dates) ---')
const dates: [string, boolean][] = [
  ['2026-10-01', true], ['2026-10-31', true], ['2026-02-28', true],
  ['2024-02-29', true], ['2026-02-29', false], ['2025-02-29', false],
  ['2000-02-29', true], ['1900-02-29', false],
  ['2026-02-30', false], ['2026-04-31', false], ['2026-13-01', false],
  ['2026-00-10', false], ['2026-10-00', false], ['2026-10-32', false],
  ['abc', false], ['2026-10-1', false], ['2026/10/01', false],
  ['', false], ['20261001', false], ['2026-10-01T00:00:00Z', false],
]
for (const [d, expected] of dates) {
  const actual = isValidIsoDate(d)
  console.log(`  ${d.padEnd(22)} ${String(actual).padEnd(5)} ${actual === expected ? 'ok' : 'MISMATCH'}`)
}
console.log('  non-string 12345    ', isValidIsoDate(12345), '| null:', isValidIsoDate(null))

console.log('\n--- category validation uses shared source ---')
for (const c of ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Other', 'Yachting', '', 1]) {
  console.log(`  ${String(c).padEnd(14)} ${isValidCategory(c)}`)
}

console.log('\n--- save + round trip ---')
store = {}
console.log('save ok             ', saveExpenses([good, second]))
console.log('round trip          ', ids(), '| payload keys:', Object.keys(JSON.parse(store[STORAGE_KEY])[0]).join(','))
saveExpenses([])
console.log('save empty          ', store[STORAGE_KEY], '| load:', ids())

console.log('\n--- storage failure handling ---')
throwOnRead = true;  store = { [STORAGE_KEY]: JSON.stringify([good]) }
console.log('getItem throws      ', ids(), '(no crash)')
throwOnRead = false
throwOnWrite = true
console.log('setItem throws      ', saveExpenses([good]), '| app keeps running, prior value intact:', ids())
throwOnWrite = false

;(globalThis as unknown as { window: unknown }).window = undefined
console.log('no window           ', ids(), '| save:', saveExpenses([good]))