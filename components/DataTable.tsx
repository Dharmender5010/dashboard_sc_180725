
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FollowUpData } from '../types';
import { ArrowUpDownIcon, CheckCircleIcon } from './icons';

interface DataTableProps {
  data: FollowUpData[];
  onOpenFormModal: (url: string) => void;
}

type SortKey = keyof FollowUpData;
type SortDirection = 'asc' | 'desc';

const ROWS_PER_PAGE = 100;
const COLUMNS_WITH_ASTERISKS = ['planned', 'actual', 'lastStatus', 'remark'];

// This is the single source of truth for default column widths.
const getColumnWidths = (): Record<string, number> => ({
    leadId: 170,
    personName: 200,
    mobile: 220,
    state: 170,
    requirement: 240,
    salesPerson: 240,
    stepName: 220,
    stepCode: 170,
    daysOfFollowUp: 180,
    numberOfFollowUps: 180,
    planned: 250,
    actual: 250,
    lastStatus: 170,
    remark: 300,
    link: 180,
    doer: 150,
});


export const DataTable: React.FC<DataTableProps> = ({ data, onOpenFormModal }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'daysOfFollowUp', direction: 'desc'});
    const [currentPage, setCurrentPage] = useState(1);
    
    // State for managing column widths.
    // It initializes from sessionStorage to persist widths through reloads,
    // and falls back to defaults if no saved widths are found.
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        try {
            const savedWidths = sessionStorage.getItem('datatable-column-widths');
            return savedWidths ? JSON.parse(savedWidths) : getColumnWidths();
        } catch (error) {
            console.error("Could not parse saved column widths:", error);
            return getColumnWidths();
        }
    });

    const resizingColumnRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

    // Save column widths to sessionStorage whenever they change.
    useEffect(() => {
        sessionStorage.setItem('datatable-column-widths', JSON.stringify(columnWidths));
    }, [columnWidths]);


    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!resizingColumnRef.current) return;

        const { key, startX, startWidth } = resizingColumnRef.current;
        const newWidth = startWidth + (e.clientX - startX);
        
        // Enforce a minimum width of 60px
        if (newWidth > 60) {
            setColumnWidths(prev => ({
                ...prev,
                [key]: newWidth,
            }));
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

    const headers: { key: SortKey; label: string }[] = [
        { key: 'leadId', label: 'Lead Id' },
        { key: 'personName', label: 'Person Name' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'state', label: 'State' },
        { key: 'requirement', label: 'Requirement' },
        { key: 'salesPerson', label: 'Sales Person' },
        { key: 'stepName', label: 'Step Name' },
        { key: 'stepCode', label: 'Step Code' },
        { key: 'daysOfFollowUp', label: 'Days of Follow-Up' },
        { key: 'numberOfFollowUps', label: 'Number of Follow-Ups' },
        { key: 'planned', label: 'Planned' },
        { key: 'actual', label: 'Actual' },
        { key: 'lastStatus', label: 'Status' },
        { key: 'remark', label: 'Remark' },
        { key: 'link', label: 'Link' },
        { key: 'doer', label: 'Doer' },
    ];

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage]);
    
    const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-auto max-h-[65vh]">
                <table className="w-full text-sm text-left text-gray-500" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        {headers.map(header => (
                            <col key={header.key} style={{ width: `${columnWidths[header.key] || 100}px` }} />
                        ))}
                    </colgroup>
                    <thead className="text-xs text-white uppercase bg-brand-primary sticky top-0 z-10">
                        <tr>
                            {headers.map((header) => (
                                <th key={header.key} scope="col" className="px-6 py-4 relative group select-none">
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort(header.key)}>
                                      {header.label}
                                      <ArrowUpDownIcon className="h-4 w-4"/>
                                    </div>
                                    <div
                                        onMouseDown={(e) => handleMouseDown(e, header.key)}
                                        className="absolute top-0 right-0 h-full w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-brand-secondary transition-opacity"
                                        aria-hidden="true"
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr key={item.leadId + '-' + index} className="bg-white border-b hover:bg-brand-light">
                                {headers.map(header => (
                                    <td key={header.key} className="px-6 py-4 align-top">
                                        {header.key === 'link' ? (
                                             item.link ? (
                                                <button
                                                    onClick={() => onOpenFormModal(item.link)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-brand-primary font-semibold rounded-full hover:bg-blue-200 transition-colors duration-200 text-sm"
                                                    aria-label={`Mark done for lead ${item.leadId}`}
                                                >
                                                    <span>Mark Done</span>
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                '-'
                                            )
                                        ) : (() => {
                                            const cellValue = item[header.key];
                                            if (COLUMNS_WITH_ASTERISKS.includes(header.key) && typeof cellValue === 'string') {
                                                const processedValue = cellValue.replace(/\s*\*\s*/g, '\n').trim();
                                                return (
                                                    <div title={processedValue} className="whitespace-pre-line">
                                                        {processedValue || '-'}
                                                    </div>
                                                );
                                            }
                    
                                            return (
                                                <div
                                                    title={String(cellValue ?? '')}
                                                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                                                >
                                                    {cellValue ?? '-'}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                ))}
                            </tr>
                        ))}
                         {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={headers.length} className="text-center py-8 text-gray-500">
                                    No records found for the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                 <div className="flex justify-between items-center p-4 bg-white border-t">
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, sortedData.length)}</span> to <span className="font-semibold">{Math.min(currentPage * ROWS_PER_PAGE, sortedData.length)}</span> of <span className="font-semibold">{sortedData.length}</span> results
                    </span>
                    <div className="inline-flex items-center -space-x-px">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                         <span className="px-4 py-2 leading-tight text-gray-700 bg-gray-50 border-t border-b border-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
