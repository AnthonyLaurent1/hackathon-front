export const calculateSiteEmissions = (site) => {
  const { surface, employees, energyConsumption, materials = {} } = site;

  const constructionFromArea = surface * 30;
  const materialsTotal = Object.values(materials).reduce((acc, material) => {
    if (!material?.quantity || !material?.co2e) return acc;
    return acc + material.quantity * material.co2e;
  }, 0);

  const constructionCO2 = constructionFromArea + materialsTotal;

  const exploitationFromEnergy = energyConsumption * (0.3 / 1000); // tCO2 per kWh moyenne
  const exploitationFromStaff = employees * 2.3;
  const exploitationCO2 = exploitationFromEnergy + exploitationFromStaff;

  const totalCO2 = constructionCO2 + exploitationCO2;

  return {
    constructionCO2: Number(constructionCO2.toFixed(2)),
    exploitationCO2: Number(exploitationCO2.toFixed(2)),
    totalCO2: Number(totalCO2.toFixed(2)),
    co2PerM2: surface > 0 ? Number((totalCO2 / surface).toFixed(2)) : 0,
    co2PerEmployee: employees > 0 ? Number((totalCO2 / employees).toFixed(2)) : 0,
  };
};
