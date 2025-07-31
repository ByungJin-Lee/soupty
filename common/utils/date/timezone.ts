export const convertToKST = (utcTimestamp: string) => {
  const date = new Date(utcTimestamp);
  date.setHours(date.getHours() + 9);
  return date;
};

export const convertToUTC = (kstTimestamp: string | Date) => {
  const date = new Date(
    kstTimestamp instanceof Date ? kstTimestamp.getTime() : kstTimestamp
  );
  date.setHours(date.getHours() - 9);
  return date;
};
