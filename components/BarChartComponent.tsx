
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartComponentProps {
  data: ChartData[];
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl h-96 border-2 border-brand-primary">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Step Code wise Pending</h3>
      <AnimatePresence mode="wait">
        {data.length > 0 ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[90%]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" style={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            key="no-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center h-full text-gray-500"
          >
            No data available for this chart.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
