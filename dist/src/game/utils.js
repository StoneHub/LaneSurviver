export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const randBetween = (min, max) => Math.random() * (max - min) + min;

export const now = () => performance.now();
