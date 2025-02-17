import React from 'react';
import { Link } from 'react-router-dom';
import { IFactory } from '@climadex/types';

export function FactoryRow(factory: IFactory) {
  const formatter = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const getRiskClass = (risk) => {
    if (risk === "High") return "high-risk";
    if (risk === "Low") return "low-risk";
    return ""; // Default color
  };

  return (
    <tr key={factory.id}>
      <td>
        <Link to={`/reports/${factory.id}`}>{factory.factoryName}</Link>
      </td>
      <td>{factory.address}</td>
      <td>{factory.country}</td>
      <td>{factory.latitude}</td>
      <td>{factory.longitude}</td>
      <td>{formatter.format(+factory.yearlyRevenue)}</td>
      <td className={getRiskClass(factory.temperatureRisk)}>{factory.temperatureRisk}</td>
    </tr>
  );
}
