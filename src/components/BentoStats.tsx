import { motion } from 'motion/react';
import { DollarSign, ShoppingBag, Users, Activity, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { StatCard } from '../types';

interface BentoStatsProps {
  stats: StatCard[];
  onRefreshStat?: (id: string) => void;
}

export default function BentoStats({ stats, onRefreshStat }: BentoStatsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign':
        return <DollarSign className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {stats.map((stat) => {
        const isUp = stat.trend === 'up';
        return (
          <motion.div
            key={stat.id}
            id={`stat-card-${stat.id}`}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between group transition-colors duration-300`}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 rounded-full bg-radial from-current/5 via-current/0 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-500 text-gray-400 dark:text-neutral-700" />

            <div className="flex justify-between items-start z-10">
              <span className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                {stat.title}
              </span>
              <div className="flex items-center space-x-1">
                {onRefreshStat && (
                  <button
                    onClick={() => onRefreshStat(stat.id)}
                    className="p-1 rounded-md text-gray-300 hover:text-gray-500 dark:text-neutral-600 dark:hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Perbarui angka"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className={`p-2 rounded-xl border ${stat.color.split(' ')[0]} ${stat.color.split(' ')[2]}`}>
                  {getIcon(stat.icon)}
                </div>
              </div>
            </div>

            <div className="mt-4 z-10">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
                {stat.value}
              </h3>
              
              <div className="flex items-center mt-2 space-x-2">
                <span
                  className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isUp
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {isUp ? '+' : ''}
                  {stat.change}%
                </span>
                <span className="text-xs text-gray-400 dark:text-neutral-500">
                  {stat.timeframe}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
