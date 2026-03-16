import { calculateSiteEmissions } from '../utils/carbon';

const STORAGE_KEY = 'carbon_sites';

const defaultSites = [
  {
    id: 'site-1',
    name: 'Usine A',
    location: 'Lyon',
    surface: 1250,
    employees: 85,
    energyConsumption: 450000,
    materials: {
      beton: { label: 'Béton', quantity: 1200, co2e: 0.11 },
      acier: { label: 'Acier', quantity: 450, co2e: 1.7 },
    },
    createdAt: '2025-10-10',
  },
  {
    id: 'site-2',
    name: 'Bureau B',
    location: 'Toulouse',
    surface: 620,
    employees: 45,
    energyConsumption: 190000,
    materials: {
      bois: { label: 'Bois', quantity: 210, co2e: 0.05 },
      verre: { label: 'Verre', quantity: 150, co2e: 0.8 },
    },
    createdAt: '2025-11-02',
  },
];

const seedData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSites));
  }
};

const getAllSites = async () => {
  seedData();
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return data.map((site) => ({
    ...site,
    ...calculateSiteEmissions(site),
    history: site.history || [],
  }));
};

const getSiteById = async (id) => {
  const sites = await getAllSites();
  return sites.find((site) => site.id === id) || null;
};

const saveSites = (sites) => localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));

const createSite = async (newSite) => {
  const sites = await getAllSites();
  const site = {
    ...newSite,
    id: `site-${Date.now()}`,
    createdAt: new Date().toISOString(),
    history: [{ date: new Date().toISOString(), ...calculateSiteEmissions(newSite) }],
  };
  sites.push(site);
  saveSites(sites);
  return { ...site, ...calculateSiteEmissions(site) };
};

const updateSite = async (id, updates) => {
  const sites = await getAllSites();
  const idx = sites.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Site introuvable');
  const merged = { ...sites[idx], ...updates };
  merged.history = sites[idx].history || [];
  merged.history.push({ date: new Date().toISOString(), ...calculateSiteEmissions(merged) });
  sites[idx] = merged;
  saveSites(sites);
  return { ...merged, ...calculateSiteEmissions(merged) };
};

const deleteSite = async (id) => {
  const sites = await getAllSites();
  const filtered = sites.filter((s) => s.id !== id);
  saveSites(filtered);
  return true;
};

export default {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
};
