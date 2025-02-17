import React, { useEffect, useState } from 'react';

import './FactoriesTable.css';

import { IFactory } from '@climadex/types';
import { FactoryRow } from './FactoryRow';

async function fetchFactories({filterString}: 
  {filterString: string;}): Promise<IFactory[]> {
  const url =
    filterString === ''
      ? 'http://localhost:3000/factories'
      : `http://localhost:3000/factories?q=${filterString}`;

  const response = await fetch(url);
  const json = await response.json();

  console.log(json);
  return json;
}

export function FactoriesTable({ filterString }: { filterString: string }) {
  const [factories, setFactories] = useState<IFactory[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof IFactory | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    fetchFactories({ filterString }).then((json) => setFactories(json));
  }, [filterString]);

  const sortedFactories = [...factories].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
    }
    return sortConfig.direction === "asc"
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  });

  const handleSort = (key: keyof IFactory) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <table>
      <thead>
        <tr>
          {[
            { key: "factoryName", label: "Factory name" },
            { key: "address", label: "Address" },
            { key: "country", label: "Country" },
            { key: "latitude", label: "Latitude" },
            { key: "longitude", label: "Longitude" },
            { key: "yearlyRevenue", label: "Yearly Revenue" },
            { key: "temperatureRisk", label: "Temperature Risk" },
          ].map(({ key, label }) => (
            <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
              {label} {sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{sortedFactories?.map(FactoryRow)}</tbody>
    </table>
  );
}
