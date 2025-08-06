export const pad2 = (value: number) => {
  return value >= 10 ? value.toString() : `0${value}`;
};
