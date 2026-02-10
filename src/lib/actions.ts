'use server'

import { query } from './db';

export async function fetchAllData() {
  try {
    // Inicjalizacja tabel jeśli nie istnieją
    await query(`CREATE TABLE IF NOT EXISTS profiles (id VARCHAR(50) PRIMARY KEY, data JSON)`);
    await query(`CREATE TABLE IF NOT EXISTS products (id VARCHAR(50) PRIMARY KEY, data JSON)`);
    await query(`CREATE TABLE IF NOT EXISTS entries (id VARCHAR(50) PRIMARY KEY, profile_id VARCHAR(50), date VARCHAR(20), data JSON)`);
    await query(`CREATE TABLE IF NOT EXISTS measurements (id VARCHAR(50) PRIMARY KEY, profile_id VARCHAR(50), data JSON)`);
    await query(`CREATE TABLE IF NOT EXISTS app_settings ( \`key\` VARCHAR(50) PRIMARY KEY, \`value\` VARCHAR(255))`);

    const [profiles, products, entries, measurements, settings]: any = await Promise.all([
      query('SELECT data FROM profiles'),
      query('SELECT data FROM products'),
      query('SELECT data FROM entries'),
      query('SELECT data FROM measurements'),
      query('SELECT value FROM app_settings WHERE `key` = "active_profile_id"')
    ]);

    return {
      profiles: profiles.map((p: any) => typeof p.data === 'string' ? JSON.parse(p.data) : p.data),
      products: products.map((p: any) => typeof p.data === 'string' ? JSON.parse(p.data) : p.data),
      entries: entries.map((e: any) => typeof e.data === 'string' ? JSON.parse(e.data) : e.data),
      measurements: measurements.map((m: any) => typeof m.data === 'string' ? JSON.parse(m.data) : m.data),
      activeProfileId: settings.length > 0 ? settings[0].value : 'default'
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw new Error('DATABASE_CONNECTION_ERROR');
  }
}

export async function syncProfiles(profiles: any[]) {
  await query('DELETE FROM profiles');
  for (const p of profiles) {
    await query('INSERT INTO profiles (id, data) VALUES (?, ?)', [p.id, JSON.stringify(p)]);
  }
}

export async function syncProducts(products: any[]) {
  await query('DELETE FROM products');
  for (const p of products) {
    await query('INSERT INTO products (id, data) VALUES (?, ?)', [p.id, JSON.stringify(p)]);
  }
}

export async function syncEntries(entries: any[]) {
  await query('DELETE FROM entries');
  for (const e of entries) {
    await query('INSERT INTO entries (id, profile_id, date, data) VALUES (?, ?, ?, ?)', 
      [e.id, e.profileId, e.date, JSON.stringify(e)]);
  }
}

export async function syncMeasurements(measurements: any[]) {
  await query('DELETE FROM measurements');
  for (const m of measurements) {
    await query('INSERT INTO measurements (id, profile_id, data) VALUES (?, ?, ?)',
      [m.id, m.profileId, JSON.stringify(m)]);
  }
}

export async function syncSettings(activeProfileId: string) {
  await query('INSERT INTO app_settings (`key`, `value`) VALUES ("active_profile_id", ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)', 
    [activeProfileId]);
}