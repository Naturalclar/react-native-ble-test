/* eslint-disable import/prefer-default-export */
/**
 * calculateWeight: String
 * @param {Array<Int>} value
 * Converts weight data to kg.
 */
export function calculateWeight(value) {
  if (!value) {
    return "--.-";
  }
  const high = value[2].toString(16);
  const low = value[1].toString(16);
  const weightString = `${high}${low}`;
  const dec = parseInt(weightString, 16);
  const weight = (dec * 0.005).toFixed(1);
  return weight;
}
