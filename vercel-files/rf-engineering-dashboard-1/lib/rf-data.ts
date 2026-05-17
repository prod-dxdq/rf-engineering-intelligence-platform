// RF Stage Data Types
export interface RFStage {
  id: string;
  name: string;
  shortName: string;
  description: string;
  gain: number; // dB
  noiseFigure: number; // dB
  ip3: number; // dBm
  icon: "lna" | "mixer" | "ifamp";
}

export interface ReceiverChainResults {
  totalGain: number; // dB
  totalNoiseFigure: number; // dB
  inputIP3: number; // dBm
}

// Hardcoded RF stage data - easy to replace with API data
export const rfStages: RFStage[] = [
  {
    id: "lna",
    name: "Low Noise Amplifier",
    shortName: "LNA",
    description: "Front-end amplification with minimal noise contribution",
    gain: 18.5,
    noiseFigure: 0.8,
    ip3: 22.0,
    icon: "lna",
  },
  {
    id: "mixer",
    name: "Frequency Mixer",
    shortName: "Mixer",
    description: "RF to IF frequency conversion stage",
    gain: -6.5,
    noiseFigure: 8.2,
    ip3: 15.0,
    icon: "mixer",
  },
  {
    id: "ifamp",
    name: "IF Amplifier",
    shortName: "IF Amp",
    description: "Intermediate frequency signal amplification",
    gain: 25.0,
    noiseFigure: 3.5,
    ip3: 28.0,
    icon: "ifamp",
  },
];

// Calculate cascaded receiver chain parameters using Friis formula
export function calculateReceiverChain(stages: RFStage[]): ReceiverChainResults {
  if (stages.length === 0) {
    return { totalGain: 0, totalNoiseFigure: 0, inputIP3: 0 };
  }

  // Total Gain (simple addition in dB)
  const totalGain = stages.reduce((sum, stage) => sum + stage.gain, 0);

  // Cascaded Noise Figure using Friis formula
  // F_total = F1 + (F2-1)/G1 + (F3-1)/(G1*G2) + ...
  let totalNoiseFigureLinear = Math.pow(10, stages[0].noiseFigure / 10);
  let cumulativeGain = Math.pow(10, stages[0].gain / 10);

  for (let i = 1; i < stages.length; i++) {
    const nfLinear = Math.pow(10, stages[i].noiseFigure / 10);
    totalNoiseFigureLinear += (nfLinear - 1) / cumulativeGain;
    cumulativeGain *= Math.pow(10, stages[i].gain / 10);
  }

  const totalNoiseFigure = 10 * Math.log10(totalNoiseFigureLinear);

  // Input-referred IP3 calculation (cascaded)
  // 1/IIP3_total = 1/IIP3_1 + G1/IIP3_2 + (G1*G2)/IIP3_3 + ...
  let iip3InverseSum = 1 / Math.pow(10, stages[0].ip3 / 10);
  cumulativeGain = Math.pow(10, stages[0].gain / 10);

  for (let i = 1; i < stages.length; i++) {
    const stageIp3Linear = Math.pow(10, stages[i].ip3 / 10);
    iip3InverseSum += cumulativeGain / stageIp3Linear;
    cumulativeGain *= Math.pow(10, stages[i].gain / 10);
  }

  const inputIP3 = 10 * Math.log10(1 / iip3InverseSum);

  return {
    totalGain: Math.round(totalGain * 100) / 100,
    totalNoiseFigure: Math.round(totalNoiseFigure * 100) / 100,
    inputIP3: Math.round(inputIP3 * 100) / 100,
  };
}

// API integration helper - replace this function to fetch from your backend
export async function fetchRFStages(): Promise<RFStage[]> {
  // Simulate API call - replace with actual fetch
  // const response = await fetch('/api/rf-stages');
  // return response.json();
  return rfStages;
}

export async function analyzeReceiverChain(stages: RFStage[]): Promise<ReceiverChainResults> {
  // Simulate API call - replace with actual fetch
  // const response = await fetch('/api/analyze', {
  //   method: 'POST',
  //   body: JSON.stringify({ stages }),
  // });
  // return response.json();
  return calculateReceiverChain(stages);
}
