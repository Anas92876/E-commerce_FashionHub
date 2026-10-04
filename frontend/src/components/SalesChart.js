import React, { useMemo, useState } from 'react';

// Daily revenue bar chart (one series, so no legend - the card title names it).
// Plain SVG: hover/focus tooltip per bar, and an equivalent table for screen readers.
const WIDTH = 720;
const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 52 };
const BAR_COLOR = '#0284c7'; // primary-600 - validated against light & dark surfaces

const money = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortMoney = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${Math.round(v)}`);
const dayLabel = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Round the axis max up to a "nice" number so gridlines land on clean values
const niceMax = (value) => {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4) * magnitude;
  return Math.ceil(value / step) * step;
};

const SalesChart = ({ data = [] }) => {
  const [hover, setHover] = useState(null);

  const { bars, ticks, max } = useMemo(() => {
    const values = data.map((d) => Number(d.revenue));
    const top = niceMax(Math.max(0, ...values));
    const plotW = WIDTH - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const slot = plotW / Math.max(data.length, 1);
    const barW = Math.max(Math.min(slot - 2, 24), 2); // 2px gap between bars

    return {
      max: top,
      ticks: [0, 0.25, 0.5, 0.75, 1].map((f) => ({ value: top * f, y: PAD.top + plotH * (1 - f) })),
      bars: data.map((d, i) => {
        const h = (Number(d.revenue) / top) * plotH;
        return {
          ...d,
          slotX: PAD.left + i * slot,
          slot,
          x: PAD.left + i * slot + (slot - barW) / 2,
          w: barW,
          h,
          y: PAD.top + plotH - h,
        };
      }),
    };
  }, [data]);

  if (!data.length) return null;

  const total = data.reduce((sum, d) => sum + Number(d.revenue), 0);
  const labelEvery = Math.ceil(data.length / 6); // ~6 x-axis labels
  const baseline = HEIGHT - PAD.bottom;
  const active = hover !== null ? bars[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Daily revenue for the last ${data.length} days, total ${money(total)}`}
        onMouseLeave={() => setHover(null)}
      >
        {/* gridlines + y labels (recessive) */}
        {ticks.map((t) => (
          <g key={t.value}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={t.y} y2={t.y}
              className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end"
              className="fill-gray-500 dark:fill-gray-400" fontSize="11">
              {shortMoney(t.value)}
            </text>
          </g>
        ))}

        {/* bars: rounded 4px top, square at the baseline */}
        {bars.map((b, i) =>
          b.h > 0 ? (
            <path
              key={b.date}
              d={`M${b.x},${baseline} V${b.y + Math.min(4, b.h)} Q${b.x},${b.y} ${b.x + Math.min(4, b.w / 2)},${b.y}
                  H${b.x + b.w - Math.min(4, b.w / 2)} Q${b.x + b.w},${b.y} ${b.x + b.w},${b.y + Math.min(4, b.h)} V${baseline} Z`}
              fill={BAR_COLOR}
              opacity={hover === null || hover === i ? 1 : 0.45}
            />
          ) : null
        )}

        {/* x labels */}
        {bars.map((b, i) =>
          i % labelEvery === 0 || i === bars.length - 1 ? (
            <text key={`l-${b.date}`} x={b.slotX + b.slot / 2} y={HEIGHT - 8} textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400" fontSize="11">
              {dayLabel(b.date)}
            </text>
          ) : null
        )}

        {/* hit targets: full-height columns, bigger than the bars */}
        {bars.map((b, i) => (
          <rect
            key={`h-${b.date}`}
            x={b.slotX}
            y={PAD.top}
            width={b.slot}
            height={baseline - PAD.top}
            fill="transparent"
            tabIndex={0}
            aria-label={`${dayLabel(b.date)}: ${money(b.revenue)}, ${b.orders} orders`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="outline-none focus:stroke-primary-500"
          />
        ))}

        {max > 0 && <line x1={PAD.left} x2={WIDTH - PAD.right} y1={baseline} y2={baseline} className="stroke-gray-300 dark:stroke-gray-600" />}
      </svg>

      {/* tooltip */}
      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
          style={{
            left: `${((active.slotX + active.slot / 2) / WIDTH) * 100}%`,
            top: `${(Math.min(active.y, baseline - 8) / HEIGHT) * 100}%`,
          }}
        >
          <p className="font-semibold">{dayLabel(active.date)}</p>
          <p>{money(active.revenue)}</p>
          <p className="text-gray-300">{active.orders} {active.orders === 1 ? 'order' : 'orders'}</p>
        </div>
      )}

      {/* table view for assistive tech */}
      <table className="sr-only">
        <caption>Daily revenue</caption>
        <thead>
          <tr><th>Date</th><th>Revenue</th><th>Orders</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}><td>{dayLabel(d.date)}</td><td>{money(d.revenue)}</td><td>{d.orders}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesChart;
