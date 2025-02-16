import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IFactory } from '@climadex/types';
import './index.css';
import { TemperatureChart } from './TemperatureChart';
import { FactoryMap } from './FactoryMap';

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

  return factory ? (
    <div className="report-page">
      <div className="navigation-links">
        <Link to="/" className="nav-link back-link">←</Link>

        {reportId && parseInt(reportId) > 1 && (
          <Link to={`/reports/${parseInt(reportId) - 1}`} className="nav-link prev-link">
            Prev
          </Link>
        )}

        {reportId && parseInt(reportId) <= 30 && (
          <Link to={`/reports/${parseInt(reportId) + 1}`} className="nav-link next-link">
            Next
          </Link>
        )}

        <h2 className="nav-link">{factory.factoryName}</h2>
      </div>


      <div className='content'>
        <div className='company-info'>
          <h3>Company's Information</h3>
          <FactoryMap factory={factory} />

          <p>Address: {factory.address}</p>
          <p>Country: {factory.country}</p>
          <p>Latitude: {factory.latitude}</p>
          <p>Longitude: {factory.longitude}</p>
          <p>Yearly Revenue: ${factory.yearlyRevenue.toLocaleString()}</p>
        </div>


        <div style={{ width: "50%", height: '400px', textAlign: 'center', marginLeft: 20}}>
          <TemperatureChart reportId={reportId} /> 
        </div>
      </div>  

    </div>
    
  ) : (
    <p>Factory not found.</p>
  );
}
