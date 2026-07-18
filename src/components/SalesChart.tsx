import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Calendar, ArrowUpRight, BarChart3, LineChart as LineIcon, AreaChart as AreaIcon } from 'lucide-react';
import { SalesData } from '../types';
import { weeklySalesData, monthlySalesData, yearlySalesData } from '../data/mockData';

type Timeframe = 'Mingguan' | 'Bulanan' | 'Tahunan';
type Metric = 'revenue' | 'sales' | 'visitors';
type ChartType = 'area' | 'bar' | 'line';

export default function SalesChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Bulanan');
  const [metric, setMetric] = useState<Metric>('revenue');
  const [chartType, setChartType] = useState<ChartType>('area');

  // Select active data based on timeframe
  const getActiveData = (): SalesData[] => {
    switch (timeframe) {
      case 'Mingguan':
        return weeklySalesData;
      case 'Bulanan':
        return monthlySalesData;
      case 'Tahunan':
        return yearlySalesData;
    }
  };

  const activeData = getActiveData();

  // Format currency to IDR
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format Y-axis tick values
  const formatYAxis = (value: number) => {
    if (metric === 'revenue') {
      if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
      if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}jt`;
      if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`;
      return `Rp ${value}`;
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  // Format tooltip header and value
  const getTooltipLabel = (label: string) => {
    if (timeframe === 'Mingguan') return `Hari: ${label}`;
    if (timeframe === 'Bulanan') return `Bulan: ${label}`;
    return `Tahun: ${label}`;
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'revenue':
        return 'Pendapatan';
      case 'sales':
        return 'Penjualan';
      case 'visitors':
        return 'Pengunjung';
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'revenue':
        return '#10b981'; // emerald-500
      case 'sales':
        return '#3b82f6'; // blue-500
      case 'visitors':
        return '#f59e0b'; // amber-500
    }
  };

  const activeColor = getMetricColor();

  // Calculate cumulative stats for the chart header
  const totalValue = activeData.reduce((acc, curr) => {
    if (metric === 'revenue') return acc + curr.revenue;
    if (metric === 'sales') return acc + curr.sales;
    return acc + curr.visitors;
  }, 0);

  const averageValue = Math.round(totalValue / activeData.length);

  return (
    <div id="analytics-card" className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-50 dark:border-neutral-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tren Bisnis Positif</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
            Analisis Performa Penjualan
          </h2>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
            Memonitor grafik omset, kuantitas item terjual, dan traffic kunjungan web secara real-time.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-gray-50 dark:bg-neutral-950 p-1 rounded-xl border border-gray-100 dark:border-neutral-800/80">
          {(['Mingguan', 'Bulanan', 'Tahunan'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric selection + Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 my-6">
        {/* Revenue Button */}
        <button
          onClick={() => setMetric('revenue')}
          className={`p-3 rounded-xl border text-left transition-all ${
            metric === 'revenue'
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-400'
          }`}
        >
          <span className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Pendapatan
          </span>
          <span className="block text-sm sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
            {timeframe === 'Bulanan' ? 'Rp 142,8M' : timeframe === 'Mingguan' ? 'Rp 63,2jt' : 'Rp 1,51M'}
          </span>
          <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12.8%
          </span>
        </button>

        {/* Sales Button */}
        <button
          onClick={() => setMetric('sales')}
          className={`p-3 rounded-xl border text-left transition-all ${
            metric === 'sales'
              ? 'border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400'
              : 'border-transparent hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-400'
          }`}
        >
          <span className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Penjualan
          </span>
          <span className="block text-sm sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
            {timeframe === 'Bulanan' ? '7.090 item' : timeframe === 'Mingguan' ? '444 item' : '32.700 item'}
          </span>
          <span className="inline-flex items-center text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +8.2%
          </span>
        </button>

        {/* Visitors Button */}
        <button
          onClick={() => setMetric('visitors')}
          className={`p-3 rounded-xl border text-left transition-all ${
            metric === 'visitors'
              ? 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400'
              : 'border-transparent hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-400'
          }`}
        >
          <span className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Kunjungan
          </span>
          <span className="block text-sm sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
            {timeframe === 'Bulanan' ? '63.500 web' : timeframe === 'Mingguan' ? '4.230 web' : '350.000 web'}
          </span>
          <span className="inline-flex items-center text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            -2.4% (turun)
          </span>
        </button>
      </div>

      {/* Graph Visual Area */}
      <div className="relative flex-1 min-h-[280px] bg-neutral-50/50 dark:bg-neutral-950/20 rounded-2xl p-4 border border-gray-50 dark:border-neutral-800/40">
        
        {/* Toggle Chart Type buttons */}
        <div className="absolute top-4 right-4 z-10 flex bg-white dark:bg-neutral-900 p-0.5 rounded-lg border border-gray-100 dark:border-neutral-800 shadow-xs">
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md ${chartType === 'area' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700'}`}
            title="Area Chart"
          >
            <AreaIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700'}`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-md ${chartType === 'line' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700'}`}
            title="Line Chart"
          >
            <LineIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Real Recharts Implementation */}
        <div className="w-full h-full mt-4" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={activeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={activeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-neutral-800/50" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="#888888"
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={formatYAxis}
                  width={60}
                />
                <Tooltip
                  cursor={{ stroke: activeColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number;
                      return (
                        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-3 rounded-xl shadow-lg">
                          <p className="text-xs font-semibold text-gray-400 dark:text-neutral-500 mb-1">
                            {getTooltipLabel(label)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColor }} />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {getMetricLabel()}:{' '}
                              {metric === 'revenue' ? formatIDR(value) : value.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={activeColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                  animationDuration={800}
                />
              </AreaChart>
            ) : chartType === 'bar' ? (
              <BarChart data={activeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-neutral-800/50" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="#888888"
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={formatYAxis}
                  width={60}
                />
                <Tooltip
                  cursor={{ fill: 'currentColor', opacity: 0.04 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number;
                      return (
                        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-3 rounded-xl shadow-lg">
                          <p className="text-xs font-semibold text-gray-400 dark:text-neutral-500 mb-1">
                            {getTooltipLabel(label)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColor }} />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {getMetricLabel()}:{' '}
                              {metric === 'revenue' ? formatIDR(value) : value.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={metric}
                  fill={activeColor}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  animationDuration={800}
                />
              </BarChart>
            ) : (
              <LineChart data={activeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-neutral-800/50" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="#888888"
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#888888"
                  fontSize={11}
                  tickFormatter={formatYAxis}
                  width={60}
                />
                <Tooltip
                  cursor={{ stroke: activeColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number;
                      return (
                        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-3 rounded-xl shadow-lg">
                          <p className="text-xs font-semibold text-gray-400 dark:text-neutral-500 mb-1">
                            {getTooltipLabel(label)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColor }} />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {getMetricLabel()}:{' '}
                              {metric === 'revenue' ? formatIDR(value) : value.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={activeColor}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={800}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Under chart stats */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-neutral-800/50 text-xs text-gray-400 dark:text-neutral-500">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Rata-rata {getMetricLabel()}: <strong>{metric === 'revenue' ? formatIDR(averageValue) : averageValue.toLocaleString('id-ID')}</strong></span>
        </div>
        <span className="text-emerald-500 font-medium">Terakhir diperbarui: Baru saja</span>
      </div>
    </div>
  );
}
