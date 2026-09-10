import { useMemo, useState } from 'react'
import { Alert } from '../components/common/Alert'
import { useI18n } from '../i18n/I18nContext'
import { calcDiscount, calcUnitPrice, splitBill } from '../utils/money'

type Mode = 'discount' | 'unit' | 'split'

function num(v: string): number {
  return Number(v.replace(',', '.'))
}

export function MoneyTool() {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('discount')
  const [price, setPrice] = useState('100')
  const [percentOff, setPercentOff] = useState('20')
  const [totalPrice, setTotalPrice] = useState('12.99')
  const [quantity, setQuantity] = useState('3')
  const [billTotal, setBillTotal] = useState('86')
  const [people, setPeople] = useState('4')
  const [tipPercent, setTipPercent] = useState('15')

  const computed = useMemo(() => {
    try {
      if (mode === 'discount') {
        return { ok: true as const, kind: 'discount' as const, ...calcDiscount(num(price), num(percentOff)) }
      }
      if (mode === 'unit') {
        return { ok: true as const, kind: 'unit' as const, unit: calcUnitPrice(num(totalPrice), num(quantity)) }
      }
      return { ok: true as const, kind: 'split' as const, ...splitBill(num(billTotal), num(people), num(tipPercent)) }
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : 'error' }
    }
  }, [mode, price, percentOff, totalPrice, quantity, billTotal, people, tipPercent])

  return (
    <div>
      <div className="howto">
        <p>{t.tools.money.howto}</p>
        <p className="muted">{t.tools.money.example}</p>
      </div>

      <div className="tabs">
        <button type="button" className={mode === 'discount' ? 'active' : ''} onClick={() => setMode('discount')}>
          {t.percentOff}
        </button>
        <button type="button" className={mode === 'unit' ? 'active' : ''} onClick={() => setMode('unit')}>
          {t.unitPrice}
        </button>
        <button type="button" className={mode === 'split' ? 'active' : ''} onClick={() => setMode('split')}>
          {t.perPerson}
        </button>
      </div>

      {mode === 'discount' ? (
        <div className="grid-2">
          <div className="field">
            <label htmlFor="price">{t.price}</label>
            <input id="price" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pct">{t.percentOff}</label>
            <input id="pct" type="number" min={0} max={100} step="0.1" value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
          </div>
        </div>
      ) : null}

      {mode === 'unit' ? (
        <div className="grid-2">
          <div className="field">
            <label htmlFor="tp">{t.totalPrice}</label>
            <input id="tp" type="number" min={0} step="0.01" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="qty">{t.quantity}</label>
            <input id="qty" type="number" min={0.0001} step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
        </div>
      ) : null}

      {mode === 'split' ? (
        <div className="grid-2">
          <div className="field">
            <label htmlFor="bt">{t.billTotal}</label>
            <input id="bt" type="number" min={0} step="0.01" value={billTotal} onChange={(e) => setBillTotal(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="people">{t.people}</label>
            <input id="people" type="number" min={1} step={1} value={people} onChange={(e) => setPeople(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tip">{t.tipPercent}</label>
            <input id="tip" type="number" min={0} step="0.1" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} />
          </div>
        </div>
      ) : null}

      {!computed.ok ? <Alert type="error">{computed.message}</Alert> : null}

      {computed.ok && computed.kind === 'discount' ? (
        <div className="stats">
          <div className="stat">
            <strong>{computed.discountAmount.toFixed(2)}</strong>
            <span>{t.discountAmount}</span>
          </div>
          <div className="stat">
            <strong>{computed.finalPrice.toFixed(2)}</strong>
            <span>{t.finalPrice}</span>
          </div>
        </div>
      ) : null}

      {computed.ok && computed.kind === 'unit' ? (
        <div className="stats">
          <div className="stat">
            <strong>{computed.unit.toFixed(2)}</strong>
            <span>{t.unitPrice}</span>
          </div>
        </div>
      ) : null}

      {computed.ok && computed.kind === 'split' ? (
        <div className="stats">
          <div className="stat">
            <strong>{computed.tipAmount.toFixed(2)}</strong>
            <span>{t.tipAmount}</span>
          </div>
          <div className="stat">
            <strong>{computed.grandTotal.toFixed(2)}</strong>
            <span>{t.grandTotal}</span>
          </div>
          <div className="stat">
            <strong>{computed.perPerson.toFixed(2)}</strong>
            <span>{t.perPerson}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
