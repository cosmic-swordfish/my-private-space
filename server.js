const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Proxy endpoint for Google Weather API
app.get('/api/weather', async (req, res) => {
  const { location } = req.query;
  if (!location) return res.status(400).json({ error: 'Location is required' });
  try {
    const response = await fetch(
      `https://weather.googleapis.com/v1/currentConditions?key=${GOOGLE_API_KEY}&location=${location}`
    );
    if (!response.ok) throw new Error(`Weather API failed: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Google Air Quality API
app.get('/api/air-quality', async (req, res) => {
  const { location } = req.query;
  if (!location) return res.status(400).json({ error: 'Location is required' });
  try {
    const response = await fetch(
      `https://airquality.googleapis.com/v1/currentConditions?key=${GOOGLE_API_KEY}&location=${location}`
    );
    if (!response.ok) throw new Error(`Air Quality API failed: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Google Pollen API
app.get('/api/pollen', async (req, res) => {
  const { location } = req.query;
  if (!location) return res.status(400).json({ error: 'Location is required' });
  try {
    const response = await fetch(
      `https://pollen.googleapis.com/v1/currentConditions?key=${GOOGLE_API_KEY}&location=${location}`
    );
    if (!response.ok) throw new Error(`Pollen API failed: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Google Geocoding API
app.get('/api/geocode', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'Address is required' });
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
    );
    if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for CoinGecko API
app.get('/api/crypto', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pi-network,tether&vs_currencies=usd&include_24hr_change=true'
    );
    if (!response.ok) throw new Error(`Crypto API failed: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the app for Vercel (removes the need for app.listen)
module.exports = app;
