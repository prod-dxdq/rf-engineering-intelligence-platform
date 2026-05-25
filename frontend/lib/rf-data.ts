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
  totalGain: number | null; // dB
  totalNoiseFigure: number | null; // dB
  inputIP3: number | null; // dBm
  outputIP3: number | null; // dBm
  dynamicRangeEstimate: number | null; // dB
  receiverSensitivity: number | null; // dBm
  stageAnalysis: StageAnalysisItem[];
  spectrumData: SpectrumDataPoint[];
  qpskConstellation: QpskConstellationPoint[];
}

export interface SpectrumDataPoint {
  frequencyHz: number;
  magnitude: number;
}

export interface QpskConstellationPoint {
  i: number;
  q: number;
}

export interface StageAnalysisItem {
  stage: string;
  cumulativeGain: number | null; // dB
  stageNoiseFigure: number | null; // dB
  stageIP3: number | null; // dBm
}

export interface WirelessDspResults {
  spectrumData: SpectrumDataPoint[];
  qpskConstellation: QpskConstellationPoint[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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
    return {
      totalGain: 0,
      totalNoiseFigure: 0,
      inputIP3: 0,
      outputIP3: null,
      dynamicRangeEstimate: null,
      receiverSensitivity: null,
      stageAnalysis: [],
      spectrumData: [],
      qpskConstellation: [],
    };
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

  // Receiver sensitivity estimate (dBm): -174 dBm/Hz + 10log10(BW) + NF + required SNR
  const bandwidthHz = 1_000_000;
  const requiredSnrDb = 10;
  const receiverSensitivity =
    -174 + 10 * Math.log10(bandwidthHz) + totalNoiseFigure + requiredSnrDb;

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

  // Stage-by-stage running view for initial UI rendering.
  let cumulativeGainDb = 0;
  const stageAnalysis: StageAnalysisItem[] = stages.map((stage) => {
    cumulativeGainDb += stage.gain;
    return {
      stage: stage.shortName,
      cumulativeGain: Math.round(cumulativeGainDb * 100) / 100,
      stageNoiseFigure: Math.round(stage.noiseFigure * 100) / 100,
      stageIP3: Math.round(stage.ip3 * 100) / 100,
    };
  });

  return {
    totalGain: Math.round(totalGain * 100) / 100,
    totalNoiseFigure: Math.round(totalNoiseFigure * 100) / 100,
    inputIP3: Math.round(inputIP3 * 100) / 100,
    outputIP3: Math.round((inputIP3 + totalGain) * 100) / 100,
    dynamicRangeEstimate:
      Math.round((inputIP3 - totalNoiseFigure - 10) * 100) / 100,
    receiverSensitivity: Math.round(receiverSensitivity * 100) / 100,
    stageAnalysis,
    spectrumData: [],
    qpskConstellation: [],
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
  const payload = {
    stages: stages.map((stage) => ({
      name: stage.shortName,
      gain_dB: stage.gain,
      noise_figure_dB: stage.noiseFigure,
      ip3_dBm: stage.ip3,
    })),
  };

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  const baseUrls = [API_BASE_URL, "http://127.0.0.1:8000"].filter(
    (value, index, self) => self.indexOf(value) === index
  );
  const routes = ["/api/analyze", "/cascade/analyze"];

  let response: Response | null = null;

  for (const baseUrl of baseUrls) {
    for (const route of routes) {
      response = await fetch(`${baseUrl}${route}`, requestOptions);
      if (response.ok) {
        break;
      }
      if (response.status !== 404) {
        break;
      }
    }

    if (response?.ok) {
      break;
    }
  }

  if (!response || !response.ok) {
    const status = response?.status ?? "unknown";
    throw new Error(`Backend analyze failed: ${status}`);
  }

  const data = await response.json();
  const results = data?.results;
  const toNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const totalGain = toNumberOrNull(results?.total_gain_dB);
  const totalNoiseFigure = toNumberOrNull(results?.total_noise_figure_dB);
  const inputIP3 = toNumberOrNull(results?.input_ip3_dBm);
  const outputIP3 = toNumberOrNull(results?.output_ip3_dBm);
  const dynamicRangeEstimate = toNumberOrNull(results?.dynamic_range_estimate_dB);
  const backendReceiverSensitivity = toNumberOrNull(results?.receiver_sensitivity_dBm);
  const stageAnalysisRaw = Array.isArray(results?.stage_analysis)
    ? results.stage_analysis
    : [];
  const spectrumDataRaw = Array.isArray(results?.spectrum_data)
    ? results.spectrum_data
    : [];
  const qpskConstellationRaw = Array.isArray(results?.qpsk_constellation)
    ? results.qpsk_constellation
    : [];

  const stageAnalysis: StageAnalysisItem[] = stageAnalysisRaw.map((item: unknown) => {
    const stageItem = item as Record<string, unknown>;
    return {
      stage:
        String(stageItem?.stage ?? stageItem?.name ?? "Unknown Stage") ||
        "Unknown Stage",
      cumulativeGain: toNumberOrNull(stageItem?.cumulative_gain_dB),
      stageNoiseFigure: toNumberOrNull(
        stageItem?.stage_noise_figure_dB ?? stageItem?.noise_figure_dB
      ),
      stageIP3: toNumberOrNull(stageItem?.stage_ip3_dBm ?? stageItem?.ip3_dBm),
    };
  });

  const spectrumData: SpectrumDataPoint[] = (spectrumDataRaw as unknown[])
    .map((item: unknown): SpectrumDataPoint | null => {
      const point = item as Record<string, unknown>;
      const frequencyHz = toNumberOrNull(point?.frequency_hz);
      const magnitude = toNumberOrNull(point?.magnitude);

      if (frequencyHz === null || magnitude === null) {
        return null;
      }

      return {
        frequencyHz,
        magnitude,
      };
    })
    .filter((point: SpectrumDataPoint | null): point is SpectrumDataPoint => point !== null)
    .filter((point: SpectrumDataPoint) => point.frequencyHz >= 0)
    .sort((a: SpectrumDataPoint, b: SpectrumDataPoint) => a.frequencyHz - b.frequencyHz);

  const qpskConstellation: QpskConstellationPoint[] = (qpskConstellationRaw as unknown[])
    .map((item: unknown): QpskConstellationPoint | null => {
      const point = item as Record<string, unknown>;
      const i = toNumberOrNull(point?.i);
      const q = toNumberOrNull(point?.q);

      if (i === null || q === null) {
        return null;
      }

      return {
        i,
        q,
      };
    })
    .filter(
      (point: QpskConstellationPoint | null): point is QpskConstellationPoint =>
        point !== null
    );

  // Keep UI resilient if backend temporarily omits this field.
  const receiverSensitivity =
    backendReceiverSensitivity ??
    (totalNoiseFigure !== null
      ? Math.round((-174 + 10 * Math.log10(1_000_000) + totalNoiseFigure + 10) * 100) /
        100
      : null);

  return {
    totalGain,
    totalNoiseFigure,
    inputIP3,
    outputIP3,
    dynamicRangeEstimate,
    receiverSensitivity,
    stageAnalysis,
    spectrumData,
    qpskConstellation,
  };
}

export async function analyzeWirelessDsp(): Promise<WirelessDspResults> {
  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const baseUrls = [API_BASE_URL, "http://127.0.0.1:8000"].filter(
    (value, index, self) => self.indexOf(value) === index
  );
  const routes = ["/api/wireless-dsp/analyze", "/wireless-dsp/analyze"];

  let response: Response | null = null;

  for (const baseUrl of baseUrls) {
    for (const route of routes) {
      response = await fetch(`${baseUrl}${route}`, requestOptions);
      if (response.ok) {
        break;
      }
      if (response.status !== 404) {
        break;
      }
    }

    if (response?.ok) {
      break;
    }
  }

  if (!response || !response.ok) {
    const status = response?.status ?? "unknown";
    throw new Error(`Backend wireless-dsp analyze failed: ${status}`);
  }

  const data = await response.json();
  const results = data?.results;

  const toNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const spectrumDataRaw = Array.isArray(results?.spectrum_data)
    ? results.spectrum_data
    : [];
  const qpskConstellationRaw = Array.isArray(results?.qpsk_constellation)
    ? results.qpsk_constellation
    : [];

  const spectrumData: SpectrumDataPoint[] = (spectrumDataRaw as unknown[])
    .map((item: unknown): SpectrumDataPoint | null => {
      const point = item as Record<string, unknown>;
      const frequencyHz = toNumberOrNull(point?.frequency_hz);
      const magnitude = toNumberOrNull(point?.magnitude);

      if (frequencyHz === null || magnitude === null) {
        return null;
      }

      return {
        frequencyHz,
        magnitude,
      };
    })
    .filter((point: SpectrumDataPoint | null): point is SpectrumDataPoint => point !== null)
    .sort((a: SpectrumDataPoint, b: SpectrumDataPoint) => a.frequencyHz - b.frequencyHz);

  const qpskConstellation: QpskConstellationPoint[] = (qpskConstellationRaw as unknown[])
    .map((item: unknown): QpskConstellationPoint | null => {
      const point = item as Record<string, unknown>;
      const i = toNumberOrNull(point?.i);
      const q = toNumberOrNull(point?.q);

      if (i === null || q === null) {
        return null;
      }

      return {
        i,
        q,
      };
    })
    .filter(
      (point: QpskConstellationPoint | null): point is QpskConstellationPoint =>
        point !== null
    );

  return {
    spectrumData,
    qpskConstellation,
  };
}
