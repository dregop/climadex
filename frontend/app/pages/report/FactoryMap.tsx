import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { IFactory } from '@climadex/types';

interface FactoryMapProps {
  factory: IFactory;
}

export const FactoryMap: React.FC<FactoryMapProps> = ({ factory }) => {
  return (
    <div style={{ height: '350px', width: '100%'}}>
      <MapContainer
        key={factory.factoryName}
        center={[factory.latitude, factory.longitude]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[factory.latitude, factory.longitude]}>
          <Popup>
            {factory.factoryName}<br />
            {'Yearly Revenue : $ ' + factory.yearlyRevenue.toLocaleString()}<br /><br />
            {factory.address}<br />
            {factory.country}
          </Popup>
        </Marker>
      </MapContainer>

    </div>
  );
};
