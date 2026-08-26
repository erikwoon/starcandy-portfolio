import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createChart, type IChartApi, type IPriceLine, type ISeriesApi } from 'lightweight-charts'
import { useChart, type Timeframe } from '../hooks/useChart'
import { useTrades } from '../hooks/useTrades'

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M']

export default function Chart() {
  const [params, setParams] = useSearchParams()
  const [ticker, setTicker] = useState(params.get('ticker') ?? '')
  const [tickerInput, setTickerInput] = useState(ticker)
  const [timeframe, setTimeframe] = useState<Timeframe>('1M')
  const [strike, setStrike] = useState(params.get('strike') ?? '')
  const [expiry, setExpiry] = useState(params.get('expiry') ?? '')

  const { data: trades = [] } = useTrades()
  const { data: candles, isLoading } = useChart(ticker, timeframe)

  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const priceLineRef = useRef<IPriceLine | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      height: 420,
      layout: {
        background: { color: 'transparent' },
        textColor: '#e9e9ed',
      },
      grid: {
        vertLines: { color: 'rgba(233,233,237,0.06)' },
        horzLines: { color: 'rgba(233,233,237,0.06)' },
      },
      timeScale: { borderColor: '#3f424d' },
      rightPriceScale: { borderColor: '#3f424d' },
    })
    const series = chart.addCandlestickSeries({
      upColor: '#968ae0',
      downColor: '#75798c',
      borderVisible: false,
      wickUpColor: '#968ae0',
      wickDownColor: '#75798c',
    })
    chartRef.current = chart
    seriesRef.current = series

    const onResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', onResize)
    onResize()

    return () => {
      window.removeEventListener('resize', onResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || !candles) return
    seriesRef.current.setData(candles)
    chartRef.current?.timeScale().fitContent()

    if (priceLineRef.current) {
      seriesRef.current.removePriceLine(priceLineRef.current)
      priceLineRef.current = null
    }
    if (strike) {
      const strikeNum = Number(strike)
      if (!Number.isNaN(strikeNum)) {
        priceLineRef.current = seriesRef.current.createPriceLine({
          price: strikeNum,
          color: '#9184d9',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'strike',
        })
      }
    }
  }, [candles, strike])

  function applyTicker() {
    const t = tickerInput.trim().toUpperCase()
    setTicker(t)
    const next = new URLSearchParams(params)
    if (t) next.set('ticker', t)
    else next.delete('ticker')
    setParams(next, { replace: true })
  }

  const tickerTrades = trades.filter((t) => t.ticker === ticker)

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 6 }}>Price action</h6>
        <h1>Chart</h1>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          style={{ maxWidth: 160 }}
          placeholder="Ticker"
          value={tickerInput}
          onChange={(e) => setTickerInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyTicker()
          }}
          onBlur={applyTicker}
        />
        <div className="seg">
          {TIMEFRAMES.map((tf) => (
            <label key={tf} className="seg-opt">
              <input type="radio" name="timeframe" checked={timeframe === tf} onChange={() => setTimeframe(tf)} />
              {tf}
            </label>
          ))}
        </div>
      </div>

      {tickerTrades.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <span className="text-muted" style={{ fontSize: 12, alignSelf: 'center' }}>
            Your positions:
          </span>
          {tickerTrades.map((t) => (
            <button
              key={t.id}
              className="tag tag-outline"
              style={{ cursor: 'pointer', border: '1px solid var(--color-accent)', background: 'transparent' }}
              onClick={() => {
                setStrike(t.strike)
                setExpiry(t.expiry)
              }}
            >
              {t.type} ${t.strike} · {t.expiry}
            </button>
          ))}
        </div>
      )}

      <div className="card elev-sm" style={{ padding: 'var(--space-4)', position: 'relative' }}>
        {isLoading && (
          <p className="text-muted" style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)' }}>
            Loading…
          </p>
        )}
        <div ref={containerRef} style={{ width: '100%' }} />
      </div>
      {expiry && (
        <p className="text-muted" style={{ fontSize: 12, marginTop: 'var(--space-2)' }}>
          Expiry: {expiry}
        </p>
      )}
    </div>
  )
}
