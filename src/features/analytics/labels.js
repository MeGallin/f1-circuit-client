export const analyticsCount = (count, noun, plural = `${noun}s`) =>
  `${count} ${count === 1 ? noun : plural}`;
