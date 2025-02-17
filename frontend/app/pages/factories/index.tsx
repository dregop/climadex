import React, { useEffect, useState } from 'react';
import { FactoriesTable } from './FactoriesTable';
import { Link } from 'react-router-dom';
import './index.css';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function FactoriesPage() {
  const [filterString, setFilterString] = useState('');
  const debouncedFilter = useDebounce(filterString, 200);

  return (
    <div id="main">
      <div id="header">
        <h1>My factories</h1>
        <Link to={'/add'}>Add</Link>
      </div>
      <label>Search By Name <input
        type="text"
        onChange={(e) => setFilterString(e.target.value)}
      /></label>
      <FactoriesTable filterString={debouncedFilter} /> {/* Send debounced value */}
    </div>
  );
}
