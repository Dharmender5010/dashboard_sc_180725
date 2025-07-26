import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TodaysTaskData } from '../types';
import { XMarkIcon, ArrowUpDownIcon, SearchIcon } from './icons';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, LabelList } from 'recharts';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: TodaysTaskData[];
    userRole: 'Admin' | 'User';
}

type SortKey = keyof TodaysTaskData;
type SortDirection = 'asc' | 'desc';

// This is the single source of truth for default column widths for the report.
const getColumnWidths = (): Record<string, number> => ({
    leadId: 140,
    personName: 190,
    mobile: 150,
    stepCode: 140,
    planned: 210,
    actual: 210,
    status: 150,
    remark: 350,
    doer: 130,
});

const headers: { key: SortKey; label: string }[] = [
    { key: 'leadId', label: 'Lead Id' },
    { key: 'personName', label: 'Person Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'stepCode', label: 'Step Code' },
    { key: 'planned', label: 'Planned' },
    { key: 'actual', label: 'Actual' },
    { key: 'status', label: 'Status' },
    { key: 'remark', label: 'Remark' },
    { key: 'doer', label: 'Doer' },
];

const COLUMNS_WITH_ASTERISKS = ['planned', 'actual', 'status', 'remark'];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


const backdrop: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modal: Variants = {
    hidden: { y: "30px", opacity: 0, scale: 0.95 },
    visible: {
        y: "0",
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 40 }
    },
    exit: {
        y: "30px",
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 }
    }
};

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, title, data, userRole }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        try {
            const savedWidths = sessionStorage.getItem('report-modal-column-widths');
            return savedWidths ? JSON.parse(savedWidths) : getColumnWidths();
        } catch (error) {
            console.error("Could not parse saved report column widths:", error);
            return getColumnWidths();
        }
    });

    const resizingColumnRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
    
    const isAdmin = userRole === 'Admin';
    
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    useEffect(() => {
        sessionStorage.setItem('report-modal-column-widths', JSON.stringify(columnWidths));
    }, [columnWidths]);
    
    const chartData = useMemo(() => {
        if (!isAdmin || data.length === 0) return [];
    
        const doerCounts = data.reduce((acc, task) => {
            const doer = task.doer || 'Unassigned';
            acc[doer] = (acc[doer] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    
        return Object.entries(doerCounts)
            .map(([name, tasks]) => ({ name, tasks }))
            .sort((a, b) => b.tasks - a.tasks);
    }, [data, isAdmin]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!resizingColumnRef.current) return;
        const { key, startX, startWidth } = resizingColumnRef.current;
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth > 60) {
            setColumnWidths(prev => ({ ...prev, [key]: newWidth }));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        resizingColumnRef.current = null;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, key: string) => {
        e.preventDefault();
        resizingColumnRef.current = {
            key,
            startX: e.clientX,
            startWidth: columnWidths[key] || 100,
        };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    
    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return data.filter(item => 
            String(item.leadId).toLowerCase().includes(lowercasedSearchTerm) ||
            String(item.mobile).toLowerCase().includes(lowercasedSearchTerm) ||
            String(item.stepCode).toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [data, searchTerm]);

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const processCell = (value: any, key: string) => {
        if (COLUMNS_WITH_ASTERISKS.includes(key) && typeof value === 'string') {
            const processedValue = value.replace(/\s*\*\s*/g, '\n').trim();
            return <div title={processedValue} className="whitespace-pre-line">{processedValue || '-'}</div>;
        }
        return <div title={String(value ?? '')} className="whitespace-nowrap overflow-hidden text-ellipsis">{value ?? '-'}</div>;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
                    variants={backdrop}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        variants={modal}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white/90">{title}</h2>
                                <p className="text-sm text-slate-400">
                                    {searchTerm
                                        ? `Showing ${sortedData.length} of ${data.length} records`
                                        : `${data.length} records found`
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="search"
                                        placeholder="Search by Lead ID, Mobile, Step Code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoComplete="off"
                                        className="block w-72 pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors duration-300"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-primary transition-colors"
                                    aria-label="Close"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </header>

                        {isAdmin && chartData.length > 0 && (
                            <div className="p-4 border-b border-slate-700">
                                <h3 className="text-lg font-semibold text-white/90 mb-4">Doer Performance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-48">
                                    {/* Horizontal Bar Chart */}
                                    <div className="w-full h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <XAxis type="number" stroke="#94a3b8" domain={[0, 'dataMax + 2']} allowDecimals={false} />
                                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} interval={0} tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#e2e8f0' }}
                                                />
                                                <Bar dataKey="tasks" name="Tasks" fill="#8884d8" barSize={20}>
                                                   <LabelList dataKey="tasks" position="right" style={{ fill: '#e2e8f0', fontSize: 12 }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* Pie Chart */}
                                    <div className="w-full h-full">
                                         <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={70}
                                                    fill="#8884d8"
                                                    dataKey="tasks"
                                                    nameKey="name"
                                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                                                />
                                                <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: '12px', paddingTop: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-grow overflow-auto">
                            <table className="w-full text-sm text-left text-slate-300" style={{ tableLayout: 'fixed' }}>
                                <colgroup>
                                    {headers.map(header => <col key={header.key} style={{ width: `${columnWidths[header.key] || 100}px` }} />)}
                                </colgroup>
                                <thead className="text-xs text-slate-300 uppercase bg-slate-700/50 sticky top-0 z-10">
                                    <tr>
                                        {headers.map((header) => (
                                            <th key={header.key} scope="col" className="px-6 py-3 relative group select-none">
                                                <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort(header.key)}>
                                                    {header.label}
                                                    <ArrowUpDownIcon className="h-4 w-4" />
                                                </div>
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, header.key)}
                                                    className="absolute top-0 right-0 h-full w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-brand-primary transition-opacity"
                                                    aria-hidden="true"
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.length > 0 ? sortedData.map((item, index) => (
                                        <tr key={item.leadId + '-' + index} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                            {headers.map(header => (
                                                <td key={header.key} className="px-6 py-3 align-top">
                                                    {processCell(item[header.key], header.key)}
                                                </td>
                                            ))}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={headers.length} className="text-center py-16 text-slate-400">
                                                {searchTerm ? 'No records match your search.' : 'No records found for this category.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
