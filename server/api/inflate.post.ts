import { getCPI, getDateRange } from 'cpi-us';
import fs from 'node:fs/promises';
import path from 'node:path';
import { defineEventHandler, readBody, createError } from 'h3';
import exchangeData from './exchange_rates.json'

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { amountEtb, month, year } = body;

  if (amountEtb === undefined || month === undefined || year === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing parameters: amountEtb, month, and year are required.',
    });
  }

  const targetKey = `${year}-${String(month).padStart(2, '0')}`;
  let historicalRate = exchangeData[targetKey];

  if (!historicalRate) {
    // Find the closest previous month
    const keys = Object.keys(exchangeData).filter(k => k !== 'current').sort();
    const previousKeys = keys.filter(k => k < targetKey);
    if (previousKeys.length > 0) {
      const closestKey = previousKeys[previousKeys.length - 1];
      historicalRate = exchangeData[closestKey];
    } else {
      // If no previous key, maybe try the earliest available
      if (keys.length > 0) {
        historicalRate = exchangeData[keys[0]];
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: 'No exchange rate data found.',
        });
      }
    }
  }

  // Convert to USD
  const historicalUsd = amountEtb / historicalRate;

  // Calculate Inflation
  const pastCpi = getCPI(year, month);
  if (pastCpi === undefined) {
    const range = getDateRange();
    throw createError({
      statusCode: 400,
      statusMessage: `Inflation data not available for ${targetKey}. Available range: ${range[0].year}-${range[0].month} to ${range[1].year}-${range[1].month}`,
    });
  }

  const range = getDateRange();
  const currentCpi = getCPI(range[1].year, range[1].month);

  if (currentCpi === undefined) {
      throw createError({
          statusCode: 500,
          statusMessage: 'Current inflation data not available.',
      });
  }

  // Adjust USD
  const inflationMultiplier = currentCpi / pastCpi;
  const todayUsd = historicalUsd * inflationMultiplier;

  // Revert to ETB
  const finalEtb = todayUsd * exchangeData.current;

  const inflationMultiplierEtb = finalEtb / amountEtb;

  return {
    originalEtb: Number(amountEtb.toFixed(2)),
    historicalUsd: Number(historicalUsd.toFixed(2)),
    todayUsd: Number(todayUsd.toFixed(2)),
    finalEtb: Number(finalEtb.toFixed(2)),
    inflationMultiplier: Number(inflationMultiplierEtb.toFixed(4)),
  };
});
