
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface LineChartComponentProps {
  data: ChartData[];
}

export const LineChartComponent: React.FC<LineChartComponentProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl h-96 border-2 border-brand-primary">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Date wise Pending</h3>
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
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" height={60} interval={0}/>
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                  }}
                />
                <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
                <Line type="monotone" dataKey="value" name="Pending Follow-ups" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} dot={{r: 4}}>
                  <LabelList dataKey="value" position="top" style={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }} />
                </Line>
              </LineChart>
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
           No pending follow-ups to display.
         </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
