import { useState, useMemo } from 'react';
import { ShoppingBag, TrendingUp, TrendingDown, Layers, Award, AlertTriangle } from 'lucide-react';
import { ProductPerformance } from '../types';
import { topProducts as initialProducts } from '../data/mockData';

export default function TopProducts() {
  const [products, setProducts] = useState<ProductPerformance[]>(initialProducts);
  const [sortBy, setSortBy] = useState<'sales' | 'revenue' | 'stock'>('sales');

  // Format currency to IDR
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Sort logic
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sortBy === 'sales') return b.salesCount - a.salesCount;
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      return a.stock - b.stock; // lowest stock first for alerts!
    });
  }, [products, sortBy]);

  // Max sales count for relative progress bar widths
  const maxSales = useMemo(() => {
    return Math.max(...products.map((p) => p.salesCount));
  }, [products]);

  return (
    <div id="products-card" className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      {/* Header Panel */}
      <div className="flex justify-between items-start pb-4 border-b border-gray-50 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center uppercase tracking-wider">
            <Award className="w-4 h-4 mr-1.5 text-amber-500" />
            Produk Terlaris & Stok
          </h2>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
            Daftar inventori dengan performa konversi penjualan tertinggi.
          </p>
        </div>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'sales' | 'revenue' | 'stock')}
          className="text-xs bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-gray-600 dark:text-neutral-300 focus:outline-hidden cursor-pointer"
        >
          <option value="sales">Urut: Volume Terlaris</option>
          <option value="revenue">Urut: Omset Tertinggi</option>
          <option value="stock">Urut: Stok Terendah</option>
        </select>
      </div>

      {/* Product List Stream */}
      <div className="flex-1 space-y-4 mt-5">
        {sortedProducts.map((product, idx) => {
          const isUp = product.trend > 0;
          const isLowStock = product.stock <= 15;
          const percentWidth = (product.salesCount / maxSales) * 100;

          return (
            <div key={product.id} className="group flex flex-col space-y-1.5 pb-3 border-b border-gray-50/60 dark:border-neutral-800/20 last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex space-x-2">
                  {/* Rank badge */}
                  <span className="text-xs font-bold text-gray-400 dark:text-neutral-600 w-5 mt-0.5">
                    #{idx + 1}
                  </span>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 dark:text-neutral-500 flex items-center mt-0.5">
                      <Layers className="w-3 h-3 mr-1" /> {product.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-gray-950 dark:text-white block">
                    {formatIDR(product.revenue)}
                  </span>
                  <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                    {/* Trend percent */}
                    <span
                      className={`inline-flex items-center text-[9px] font-bold ${
                        isUp ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                      )}
                      {isUp ? '+' : ''}
                      {product.trend}%
                    </span>

                    <span className="text-[10px] text-gray-300 dark:text-neutral-700">|</span>

                    {/* Stock status tag */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                        isLowStock
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 flex items-center'
                          : 'bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/10 dark:text-emerald-400'
                      }`}
                    >
                      {isLowStock && <AlertTriangle className="w-2.5 h-2.5 mr-0.5 shrink-0" />}
                      Stok: {product.stock}
                    </span>
                  </div>
                </div>
              </div>

              {/* Graphical distribution progress line */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentWidth}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 w-12 text-right">
                  {product.salesCount} unit
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
