export const convertToKST = (utcTimestamp: string) => {
  const date = new Date(utcTimestamp);
  date.setHours(date.getHours() + 9);
  return date.toISOString();
};
