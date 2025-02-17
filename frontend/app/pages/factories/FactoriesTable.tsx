import React, { useEffect, useState } from 'react';
import { IFactory } from '@climadex/types';
import { FactoryRow } from './FactoryRow';
import './FactoriesTable.css';

async function fetchFactories({ filterString, sortBy, sortOrder, limit, page }: { filterString: string, sortBy: string, sortOrder: string, limit: number, page: number }): Promise<IFactory[]> {
  const url = `http://localhost:3000/factories?q=${filterString}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${limit}&page=${page}`;

  const response = await fetch(url);
  const json = await response.json();
  return json;
}

export function FactoriesTable({ filterString }: { filterString: string }) {
  const [factories, setFactories] = useState<IFactory[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof IFactory | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // numbers of elements by page

  useEffect(() => {
    // Reset to page 1 when filterString changes
    setPage(1);
  }, [filterString]);

  useEffect(() => {
    // Retreive data
    fetchFactories({
      filterString,
      sortBy: sortConfig.key as string || 'factoryName',
      sortOrder: sortConfig.direction,
      limit,
      page
    }).then((json) => {
      setFactories(json);
    });
  }, [filterString, sortConfig, page]);

  const handleSort = (key: keyof IFactory) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div>
      <p>{factories.length} factories displayed</p>
      <table>
        <thead>
          <tr>
            {[
              { key: 'factoryName', label: 'Factory name' },
              { key: 'address', label: 'Address' },
              { key: 'country', label: 'Country' },
              { key: 'latitude', label: 'Latitude' },
              { key: 'longitude', label: 'Longitude' },
              { key: 'yearlyRevenue', label: 'Yearly Revenue' },
              { key: 'temperatureRisk', label: 'Temperature Risk' },
            ].map(({ key, label }) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                {label} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{factories?.map(FactoryRow)}</tbody>
      </table>
      { factories.length ? 
      <div className='pagination'>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
        <span> Page {page} </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={factories.length < limit}>Next</button>
      </div> : <></>}
    </div>
  );
}
