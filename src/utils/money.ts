function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function calcDiscount(price: number, percentOff: number): {
  discountAmount: number
  finalPrice: number
} {
  if (!Number.isFinite(price) || !Number.isFinite(percentOff)) {
    throw new Error('Invalid numbers')
  }
  if (price < 0 || percentOff < 0 || percentOff > 100) {
    throw new Error('Price must be >= 0 and percent between 0 and 100')
  }
  const discountAmount = roundMoney((price * percentOff) / 100)
  const finalPrice = roundMoney(price - discountAmount)
  return { discountAmount, finalPrice }
}

export function calcUnitPrice(totalPrice: number, quantity: number): number {
  if (!Number.isFinite(totalPrice) || !Number.isFinite(quantity)) {
    throw new Error('Invalid numbers')
  }
  if (totalPrice < 0 || quantity <= 0) {
    throw new Error('Total must be >= 0 and quantity > 0')
  }
  return roundMoney(totalPrice / quantity)
}

export function splitBill(
  total: number,
  people: number,
  tipPercent = 0,
): {
  tipAmount: number
  grandTotal: number
  perPerson: number
} {
  if (!Number.isFinite(total) || !Number.isFinite(people) || !Number.isFinite(tipPercent)) {
    throw new Error('Invalid numbers')
  }
  if (total < 0 || people < 1 || tipPercent < 0) {
    throw new Error('Total >= 0, people >= 1, tip >= 0 required')
  }
  const tipAmount = roundMoney((total * tipPercent) / 100)
  const grandTotal = roundMoney(total + tipAmount)
  const perPerson = roundMoney(grandTotal / people)
  return { tipAmount, grandTotal, perPerson }
}
