import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IFactory } from '@climadex/types';
import './index.css';
import { TemperatureChart } from './TemperatureChart';
import { FactoryMap } from './FactoryMap';
import Tooltip from '../../common/Tooltip';

export function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [factory, setFactory] = useState<IFactory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFactory() {
      try {
        const response = await fetch(`http://localhost:3000/factories/${reportId}`);
        if (!response.ok) throw new Error('Factory not found');

        const data = await response.json();
        console.log(data);
        setFactory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFactory();
  }, [reportId]);

  if (loading) return <p>Loading factory details...</p>;
  if (error) return <p>Error: {error}</p>;

  const getRiskClass = (risk) => {
    if (risk === "High") return "high-risk";
    if (risk === "Low") return "low-risk";
    return "";
  };

  return factory ? (
    <div className="report-page">
      <div className="navigation-links">
        <Link to="/" className="nav-link back-link">←</Link>

        <h2 className="nav-link">{factory.factoryName}</h2>
      </div>


      <div className='content'>
        <div className='factory-info'>
          <h3>Factory's Information</h3>
          <FactoryMap factory={factory} />

          <p>Address: {factory.address}</p>
          <p>Country: {factory.country}</p>
          <p>Latitude: {factory.latitude}</p>
          <p>Longitude: {factory.longitude}</p>
          <p>Yearly Revenue: ${factory.yearlyRevenue.toLocaleString()}</p>
          <p>Température Risk 
            <Tooltip text="Temperature risk is high if the increase exceeds 1.8°C from 2030 or if the average surpasses 35°C. Hot climates (desert/tropical) are also at risk above 30°C. Otherwise, the risk is low." />:  
            <span className={getRiskClass(factory.temperatureRisk)}> 
              {factory.temperatureRisk}
            </span>
            </p>
        </div>


        <div className='factory-temp'>
          <TemperatureChart reportId={reportId} /> 
        </div>
      </div>  

    </div>
    
  ) : (
    <p>Factory not found.</p>
  );
}
