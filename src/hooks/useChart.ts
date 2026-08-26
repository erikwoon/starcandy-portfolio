import { useEffect, useState } from 'react'
import type { UTCTimestamp } from 'lightweight-charts'

export type Timeframe = '1D' | '1W' | '1M' | '3M'

export interface CandleData {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

interface UseChartResult {
  data: CandleData[]
  isLoading: boolean
  error: Error | null
}

const BAR_COUNT: Record<Timeframe, number> = { '1D': 60, '1W': 90, '1M': 120, '3M': 180 }

/**
 * Stubbed OHLCV source (Phase 1). Generates a plausible-looking random walk
 * seeded from the ticker so the same ticker always renders the same series.
 * Swap the body of this hook for a real price-data API in Phase 2 — the
 * { data, isLoading, error } interface should not need to change.
 */
export function useChart(ticker: string, timeframe: Timeframe): UseChartResult {
  const [data, setData] = useState<CandleData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const bars = BAR_COUNT[timeframe]
    const seed = seedFromString(ticker || 'SPY')
    const rand = mulberry32(seed)

    let price = 50 + rand() * 400
    const now = Math.floor(Date.now() / 1000)
    const dayMs = 24 * 60 * 60
    const candles: CandleData[] = []
    for (let i = bars; i > 0; i--) {
      const open = price
      const drift = (rand() - 0.5) * open * 0.03
      const close = Math.max(1, open + drift)
      const high = Math.max(open, close) + rand() * open * 0.01
      const low = Math.min(open, close) - rand() * open * 0.01
      candles.push({
        time: (now - i * dayMs) as UTCTimestamp,
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(close),
      })
      price = close
    }

    const t = setTimeout(() => {
      setData(candles)
      setIsLoading(false)
    }, 150)
    return () => clearTimeout(t)
  }, [ticker, timeframe])

  return { data, isLoading, error: null }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function seedFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h >>> 0
}

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
