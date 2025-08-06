export const getOneDayPeriod = (date: string) => {
  const start = date + "T00:00:00.000Z";
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().split("T")[0] + "T00:00:00.000Z";

  return {
    start,
    end,
  };
};
