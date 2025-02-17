import { getMeanTemperatureWarmestQuarter } from './indicators';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const BATCH_SIZE = 1000; // Process in chunks of 1000 factories
// const temperatureCache = new Map(); // Cache temperatures by (lat, long)
export const tempAvgRiskTreshold = 1.8;

const dbClientPromise = open({
  filename: '../../db.sqlite3',
  driver: sqlite3.Database,
});

async function makeSureTempRiskColumnExists(client: any) {
  // Check if the column exists
  const columns = await client.all(`PRAGMA table_info(factories)`);
  const columnExists = columns.some((col: any) => col.name === "temperature_risk");

  if (!columnExists) {
    console.log("Adding missing column 'temperature_risk'...");
    await client.run(`ALTER TABLE factories ADD COLUMN temperature_risk TEXT`);
    console.log("Column 'temperature_risk' added successfully.");
  }
}

// Climate approximations based on latitude location
export function getClimateApproximation(latitude: number) {
    if (Math.abs(latitude) < 10) {
        return { humidity: 80, windSpeed: 2, solarRadiation: 700, climate: "Tropical" };
    } else if (latitude > 15 && latitude < 35) {
        return { humidity: 20, windSpeed: 7, solarRadiation: 900, climate: "Desert" };
    } else if (latitude > 35 && latitude < 55) {
        return { humidity: 50, windSpeed: 5, solarRadiation: 500, climate: "Temperate" };
    } else if (latitude >= 55) {
        return { humidity: 60, windSpeed: 12, solarRadiation: 250, climate: "Cold" };
    } else {
        return { humidity: 40, windSpeed: 10, solarRadiation: 400, climate: "Coastal" };
    }
}


export async function updateFactoriesTemperatureRiskBatch() {
  const client = await dbClientPromise;
  await makeSureTempRiskColumnExists(client);


  const factories = await client.all('SELECT * FROM factories');

  if (!factories.length) {
    console.log('No factories found.');
    return;
  }

  console.log(`Found ${factories.length} factories.`);

  for (let i = 0; i < factories.length; i += BATCH_SIZE) {
    let batch = factories.slice(i, i + BATCH_SIZE);
    let updates = [];

    for (const factory of batch) {
      const { id, latitude, longitude } = factory;
      let temperatures;

      temperatures = {
        "2030": getMeanTemperatureWarmestQuarter({ latitude, longitude, timeframe: "2030" }) ?? undefined,
        "2050": getMeanTemperatureWarmestQuarter({ latitude, longitude, timeframe: "2050" }) ?? undefined,
        "2070": getMeanTemperatureWarmestQuarter({ latitude, longitude, timeframe: "2070" }) ?? undefined,
        "2090": getMeanTemperatureWarmestQuarter({ latitude, longitude, timeframe: "2090" }) ?? undefined,
      };

      // Remove unvalid temps
      const validTemperatures = Object.values(temperatures)
        .filter((t): t is number => t !== undefined && t !== null);

      // Calculate avg temp
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

      // Add to batch update
      updates.push({ id, temperatureRisk });
    }

    console.log(updates);

    // Execute batch update with transaction to handle mass data
    try {
        await client.run('BEGIN TRANSACTION');
        const stmt = await client.prepare('UPDATE factories SET temperature_risk = ? WHERE id = ?');

        for (const update of updates) {
        await stmt.run(update.temperatureRisk, update.id);
        }

        await stmt.finalize();
        await client.run('COMMIT');
        console.log(`Batch update successful for ${updates.length} factories.`);
    } catch (error) {
        await client.run('ROLLBACK');
        console.error('Batch update failed:', error);
    }
  }
  
  console.log("All factories processed.");
  await client.close();
}

updateFactoriesTemperatureRiskBatch().catch(console.error); // executes when launching app
