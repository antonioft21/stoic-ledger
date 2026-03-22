export type CalculationInput = {
  currentBalance: number
  expectedIncome: number
  fixedExpenses: number
  upcomingPayments: number
  taxRate: number
  safetyBuffer: number
}

export type CalculationResult = {
  taxReserve: number
  availableToSpend: number
  riskLevel: 'safe' | 'tight' | 'risky'
}

export type StoredCalculation = {
  input: CalculationInput
  result: CalculationResult
  timestamp: number
}

export function calculate(input: CalculationInput): CalculationResult {
  const taxReserve = input.expectedIncome * (input.taxRate / 100)
  const availableToSpend =
    input.currentBalance +
    input.expectedIncome -
    taxReserve -
    input.fixedExpenses -
    input.upcomingPayments -
    input.safetyBuffer

  const riskLevel =
    availableToSpend > 1000 ? 'safe' : availableToSpend >= 0 ? 'tight' : 'risky'

  return { taxReserve, availableToSpend, riskLevel }
}

export const STORAGE_KEY = 'stoic_ledger_calculation'
