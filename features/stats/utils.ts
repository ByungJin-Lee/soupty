export const normalizeData = (data: number[], min = 20, max = 40) => {
  let dataMin = Infinity;
  let dataMax = -Infinity;
  
  for (const value of data) {
    if (value < dataMin) dataMin = value;
    if (value > dataMax) dataMax = value;
  }
  
  return data.map((v) => min + ((v - dataMin) / (dataMax - dataMin)) * (max - min));
};