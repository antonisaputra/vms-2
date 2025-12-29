
import React from 'react';

const SkeletonRow = () => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
                <div className="ml-4 space-y-2">
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
    </tr>
);

const TableSkeleton: React.FC = () => {
    return (
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
            ))}
        </tbody>
    );
};

export default TableSkeleton;
