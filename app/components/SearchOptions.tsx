import React from 'react';

interface SearchOptionsProps {
  options: {
    searchDepth: 'basic' | 'advanced';
    maxResults: number;
    topic: 'general' | 'news';
    timeRange?: 'day' | 'week' | 'month' | 'year';
  };
  onChange: (options: any) => void;
}

export default function SearchOptions({ options, onChange }: SearchOptionsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <h3 className="font-medium text-gray-700">Search Options</h3>
      
      <div className="space-y-3">
        {/* Search Depth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Depth
          </label>
          <select
            value={options.searchDepth}
            onChange={(e) => onChange({ ...options, searchDepth: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Max Results */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Results
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={options.maxResults}
            onChange={(e) => onChange({ ...options, maxResults: Number(e.target.value) })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <select
            value={options.topic}
            onChange={(e) => onChange({ ...options, topic: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="general">General</option>
            <option value="news">News</option>
          </select>
        </div>

        {/* Time Range (only for news topic) */}
        {options.topic === 'news' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              value={options.timeRange}
              onChange={(e) => onChange({ ...options, timeRange: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>Tips:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Use Advanced depth for more comprehensive results</li>
          <li>News topic includes recent articles only</li>
          <li>Higher max results may increase response time</li>
        </ul>
      </div>
    </div>
  );
} 