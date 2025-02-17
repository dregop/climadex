import { serve } from '@hono/node-server';
import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import { IFactory } from '@climadex/types';
import { IDbFactory } from './types';

import { getMeanTemperatureWarmestQuarter, TIMEFRAMES } from './indicators';
import { getClimateApproximation, tempAvgRiskTreshold, updateFactoriesTemperatureRiskBatch } from './updateTemperatureRisk';

const app = new Hono();

const dbClientPromise = open({
  filename: '../../db.sqlite3',
  driver: sqlite3.Database,
});

app.use('/*', cors());

app.get('/', (c) => {
  // Here is an example of how to read temperatures previsions from the dataset

  const values = [];

  for (const timeframe of TIMEFRAMES) {
    values.push({
      [timeframe]: `${getMeanTemperatureWarmestQuarter({
        latitude: 48.8711312,
        longitude: 2.3462203,
        timeframe: timeframe,
      })}°C`,
    });
  }

  return c.text(
    `Example evolution of temperatures over timeframes : ${JSON.stringify(
      values
    )}`
  );
});

app.get('/factories/:id/temperature', async (c) => {
  const factoryId = c.req.param('id');

  // Fetch factory details (optional if needed)
  const client = await dbClientPromise;
  const factory = await client.get('SELECT * FROM factories WHERE id = ?', [factoryId]);

  if (!factory) {
    return c.json({ error: "Factory not found" }, 404);
  }

  console.log(factory);

  const temperatures: Record<"2030" | "2050" | "2070" | "2090", number | undefined> = {
    "2030": 0,
    "2050": 0,
    "2070": 0,
    "2090": 0,
  };

  for (const timeframe of TIMEFRAMES) {
    temperatures[timeframe] = getMeanTemperatureWarmestQuarter({
      latitude: factory.latitude,
      longitude: factory.longitude,
      timeframe: timeframe,
    }) ?? undefined; // Remplace `null` par `undefined`
  }

  console.log(temperatures);

  return c.json(temperatures);
});


app.get('/factories', async (c: Context) => {
  const client = await dbClientPromise;

  const query = c.req.query('q');

  const factories = query
    ? await client.all(
        `SELECT * FROM factories WHERE LOWER( factory_name ) LIKE ?;`,
        [`%${query.toLowerCase()}%`]
      )
    : await client.all('SELECT * FROM factories');

  return c.json(
    factories.map(
      (factory: IDbFactory): IFactory => ({
        id: factory.id,
        factoryName: factory.factory_name,
        address: factory.address,
        country: factory.country,
        latitude: factory.latitude,
        longitude: factory.longitude,
        yearlyRevenue: factory.yearly_revenue,
        temperatureRisk: factory.temperature_risk
      })
    )
  );
});

app.get('/factories/:id', async (c: Context) => {
  const client = await dbClientPromise;
  const { id } = c.req.param(); // Get the ID from the URL

  const factory = await client.get('SELECT * FROM factories WHERE id = ?;', [id]);

  if (!factory) {
    return c.json({ error: 'Factory not found' }, 404);
  }

  return c.json({
    id: factory.id,
    factoryName: factory.factory_name,
    address: factory.address,
    country: factory.country,
    latitude: factory.latitude,
    longitude: factory.longitude,
    yearlyRevenue: factory.yearly_revenue,
    temperatureRisk: factory.temperature_risk
  });
});


app.post('/factories', async (c: Context) => {
  const client = await dbClientPromise;

  const { factoryName, country, address, latitude, longitude, yearlyRevenue } =
    await c.req.json();
  if (!factoryName || !country || !address || !yearlyRevenue) {
    return c.text('Invalid body.', 400);
  }

  const temperatures: Record<"2030" | "2050" | "2070" | "2090", number | undefined> = {
    "2030": 0,
    "2050": 0,
    "2070": 0,
    "2090": 0,
  };

  

  for (const timeframe of TIMEFRAMES) {
    temperatures[timeframe] = getMeanTemperatureWarmestQuarter({
      latitude: parseInt(latitude),
      longitude: parseInt(longitude),
      timeframe: timeframe,
    }) ?? undefined;
  }

  console.log(temperatures);

  // Filtrer les valeurs définies et calculer la moyenne
  const validTemperatures = Object.values(temperatures).filter(
    (temp): temp is number => temp !== undefined
  );

  const avgTemp = validTemperatures.length > 0
    ? validTemperatures.reduce((sum, t) => sum + (t ?? 0), 0) / validTemperatures.length
    : undefined;

  let temperatureRisk = "Unknown";

  const climateData = getClimateApproximation(latitude);

  // Risk Algorithme
  if (avgTemp !== undefined && temperatures["2030"] !== undefined) {
    if (((avgTemp - temperatures["2030"]) > tempAvgRiskTreshold || avgTemp > 35)) {
      temperatureRisk = "High";
    } else if (avgTemp > 30 && (climateData.climate === 'Desert' || climateData.climate === 'Tropical')) {
      temperatureRisk = "High";
    } else {
      temperatureRisk = "Low";
    }
  }


  const factory: IFactory = {
    factoryName,
    country,
    address,
    latitude: +latitude,
    longitude: +longitude,
    yearlyRevenue: +yearlyRevenue,
    temperatureRisk
  };

  console.log(factory);

  await client.run(
    `INSERT INTO factories (factory_name, address, country, latitude, longitude, yearly_revenue, temperature_risk)
VALUES (?, ?, ?, ?, ?, ?, ?);`,
    factory.factoryName,
    factory.address,
    factory.country,
    factory.latitude,
    factory.longitude,
    factory.yearlyRevenue,
    factory.temperatureRisk
  );

  return c.json({ result: 'OK' });
});

app.post("/update-temperature-risk", async (c: Context) => {
  try {
    await updateFactoriesTemperatureRiskBatch();
    return c.json({ result: 'Temperature risk updated for all factories' });
  } catch (error) {
    return c.json({ result: 'Error updating temperature risk.' });
  }
});

serve(app);
