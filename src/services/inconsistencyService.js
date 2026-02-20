import logger from "./logger.js";

function analyzeInconsistency(currentEntry, history) {

  logger.log("Entered Inconsistency Analysis");
  if (history.length < 3) {
    return { is_anomaly: false, anomaly_reason: 'Not enough history to analyze progress.' };
  }
  else if (history.length > 7) {
    history = history.slice(0, 7); // Keep only the last 7 entries
  }

  //calculate mean and standard deviation
  const getVelocity = (curr, prev) => {
    const timeGapHours = (new Date(curr.commit_timestamp) - new Date(prev.commit_timestamp)) / (1000 * 60 * 60);
    // Cap timeGap at 1 minute (0.016h) to avoid infinity on near-simultaneous pushes
    const safeTimeGap = Math.max(timeGapHours, 0.016);
    return curr.difficulty_of_commit / safeTimeGap;
  };

  const velocities = [];
  const v = getVelocity(currentEntry, history[0]);
  velocities.push(v);
  for (let i = 0; i < history.length - 1; i++) {
    // We calculate the velocity of each commit relative to the one before it
    const v = getVelocity(history[i], history[i + 1]);
    velocities.push(v);
  }
  // The current velocity is the first one in our calculated array
  const currentVelocity = velocities[0];
  const pastVelocities = velocities.slice(1); // Baseline excluding current

  // Calculate Mean and StdDev of past velocities
  const n = pastVelocities.length;
  const meanV = pastVelocities.reduce((a, b) => a + b, 0) / n;
  const sampleVar = pastVelocities.map(v => Math.pow(v - meanV, 2)).reduce((a, b) => a + b, 0) / (n - 1);
  const stdDevV = Math.sqrt(sampleVar);

  if (stdDevV === 0) {
    return { is_anomaly: false, anomaly_reason: 'Stable work tempo' };
  }

  //  Calculate T-Score for Velocity
  const t_score = (currentVelocity - meanV) / stdDevV;

  if (t_score > 2.5) {
    return {
      is_anomaly: true,
      anomaly_reason: `Student produced high-difficulty work significantly faster than their average pace.`
    };
  }

  return { is_anomaly: false, anomaly_reason: `Consistent work` };
}

export default analyzeInconsistency;