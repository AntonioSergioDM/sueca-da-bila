const getRandomRange = (min: number, max: number) => (
  Math.random() * (max - min) + min
);

export default getRandomRange;
