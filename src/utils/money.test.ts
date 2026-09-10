import { describe, expect, it } from 'vitest'
import { calcDiscount, calcUnitPrice, splitBill } from './money'

describe('calcDiscount', () => {
  it('computes 20% off 100', () => {
    expect(calcDiscount(100, 20)).toEqual({ discountAmount: 20, finalPrice: 80 })
  })

  it('rejects invalid percent', () => {
    expect(() => calcDiscount(10, 150)).toThrow()
  })
})

describe('calcUnitPrice', () => {
  it('divides total by quantity', () => {
    expect(calcUnitPrice(12.99, 3)).toBe(4.33)
  })

  it('rejects zero quantity', () => {
    expect(() => calcUnitPrice(10, 0)).toThrow()
  })
})

describe('splitBill', () => {
  it('splits with tip', () => {
    const r = splitBill(86, 4, 15)
    expect(r.tipAmount).toBe(12.9)
    expect(r.grandTotal).toBe(98.9)
    expect(r.perPerson).toBe(24.73)
  })
})
