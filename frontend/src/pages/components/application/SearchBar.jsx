// SearchBar.jsx
import React from 'react';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ value = '', onChange = () => {} }) {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="w-5 h-5 text-gray-400" />
      </span>
      <input
        type="text"
        id="application-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by Ref No or Owner"
        className="p-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
