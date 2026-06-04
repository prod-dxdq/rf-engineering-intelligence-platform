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

export interface BerVsSnrPoint {
  snrDb: number;
  ber: number;
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
  berVsSnr: BerVsSnrPoint[];
}

export interface LinkBudgetInput {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  frequencyMhz: number;
  distanceKm: number;
  receiverSensitivityDbm: number;
  model: LinkBudgetModel;
}

export type LinkBudgetModel = "free_space" | "urban" | "suburban";

export interface LinkBudgetResults {
  freeSpacePathLossDb: number | null;
  receivedPowerDbm: number | null;
  linkMarginDb: number | null;
}

export interface CoverageInput {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  frequencyMhz: number;
  receiverSensitivityDbm: number;
  model: LinkBudgetModel;
}

export interface CoveragePoint {
  distanceKm: number;
  receivedPowerDbm: number;
  linkMarginDb: number;
  isCovered: boolean;
  signalQuality: "Good" | "Fair" | "Poor" | "Unknown";
}

export interface CoverageComparisonPoint {
  distance_km: number;
  free_space: number;
  urban: number;
  suburban: number;
}

export interface CoverageResults {
  coveragePoints: CoveragePoint[];
  coverageRadiusKm: number | null;
  comparisonData: CoverageComparisonPoint[];
}

export interface MlSignalIntelligenceInput {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  frequencyMhz: number;
  distanceKm: number;
  receiverSensitivityDbm: number;
  model: LinkBudgetModel;
}

export interface MlSignalIntelligenceResult {
  receivedPowerDbm: number | null;
  linkMarginDb: number | null;
  predictedSignalQuality: "Good" | "Fair" | "Poor" | "Unknown";
  evaluatedDistanceKm: number;
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
  const berVsSnrRaw = Array.isArray(data?.ber_vs_snr) ? data.ber_vs_snr : [];

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

  const berVsSnr: BerVsSnrPoint[] = (berVsSnrRaw as unknown[])
    .map((item: unknown): BerVsSnrPoint | null => {
      const point = item as Record<string, unknown>;
      const snrDb = toNumberOrNull(point?.snr_db);
      const ber = toNumberOrNull(point?.ber);

      if (snrDb === null || ber === null) {
        return null;
      }

      return {
        snrDb,
        ber,
      };
    })
    .filter((point: BerVsSnrPoint | null): point is BerVsSnrPoint => point !== null)
    .sort((a: BerVsSnrPoint, b: BerVsSnrPoint) => a.snrDb - b.snrDb);

  return {
    spectrumData,
    qpskConstellation,
    berVsSnr,
  };
}

export async function analyzeLinkBudget(
  input: LinkBudgetInput
): Promise<LinkBudgetResults> {
  const baseUrls = [API_BASE_URL, "http://127.0.0.1:8000"].filter(
    (value, index, self) => self.indexOf(value) === index
  );
  const routes = ["/api/link-budget/analyze", "/link-budget/analyze"];

  let response: Response | null = null;

  for (const baseUrl of baseUrls) {
    const requestUrl = buildLinkBudgetAnalyzeUrl(input, baseUrl);
    response = await fetchLinkBudgetByUrl(requestUrl);

    if (response.ok) {
      break;
    }

    if (response.status !== 404) {
      break;
    }

    for (const route of routes) {
      if (route === "/link-budget/analyze") {
        continue;
      }

      const fallbackUrl = buildLinkBudgetAnalyzeUrl(input, baseUrl, route);
      response = await fetchLinkBudgetByUrl(fallbackUrl);

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
    throw new Error(`Backend link-budget analyze failed: ${status}`);
  }

  return parseLinkBudgetResults(await response.json());
}

export function buildLinkBudgetAnalyzeUrl(
  input: LinkBudgetInput,
  baseUrl = API_BASE_URL,
  route = "/link-budget/analyze"
): string {
  const query = new URLSearchParams({
    tx_power_dbm: String(input.txPowerDbm),
    tx_antenna_gain_dbi: String(input.txAntennaGainDbi),
    rx_antenna_gain_dbi: String(input.rxAntennaGainDbi),
    frequency_mhz: String(input.frequencyMhz),
    distance_km: String(input.distanceKm),
    receiver_sensitivity_dbm: String(input.receiverSensitivityDbm),
    model: input.model,
  });

  return `${baseUrl}${route}?${query.toString()}`;
}

export async function fetchLinkBudgetByUrl(
  requestUrl: string
): Promise<Response> {
  return fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function parseLinkBudgetResults(data: unknown): LinkBudgetResults {
  const toNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const payload = data as Record<string, unknown>;

  return {
    freeSpacePathLossDb: toNumberOrNull(payload?.free_space_path_loss_db),
    receivedPowerDbm: toNumberOrNull(payload?.received_power_dbm),
    linkMarginDb: toNumberOrNull(payload?.link_margin_db),
  };
}

export async function analyzeCoverage(input: CoverageInput): Promise<CoverageResults> {
  const baseUrls = [API_BASE_URL, "http://127.0.0.1:8000"].filter(
    (value, index, self) => self.indexOf(value) === index
  );
  const routes = ["/api/coverage/analyze", "/coverage/analyze"];

  let response: Response | null = null;

  for (const baseUrl of baseUrls) {
    const requestUrl = buildCoverageAnalyzeUrl(input, baseUrl);
    response = await fetchCoverageByUrl(requestUrl);

    if (response.ok) {
      break;
    }

    if (response.status !== 404) {
      break;
    }

    for (const route of routes) {
      if (route === "/coverage/analyze") {
        continue;
      }

      const fallbackUrl = buildCoverageAnalyzeUrl(input, baseUrl, route);
      response = await fetchCoverageByUrl(fallbackUrl);

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
    throw new Error(`Backend coverage analyze failed: ${status}`);
  }

  return parseCoverageResults(await response.json());
}

export function buildCoverageAnalyzeUrl(
  input: CoverageInput,
  baseUrl = API_BASE_URL,
  route = "/coverage/analyze"
): string {
  const query = new URLSearchParams({
    tx_power_dbm: String(input.txPowerDbm),
    tx_antenna_gain_dbi: String(input.txAntennaGainDbi),
    rx_antenna_gain_dbi: String(input.rxAntennaGainDbi),
    frequency_mhz: String(input.frequencyMhz),
    receiver_sensitivity_dbm: String(input.receiverSensitivityDbm),
    model: input.model,
  });

  return `${baseUrl}${route}?${query.toString()}`;
}

export async function fetchCoverageByUrl(requestUrl: string): Promise<Response> {
  return fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function parseCoverageResults(data: unknown): CoverageResults {
  const toNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toSignalQuality = (value: unknown): "Good" | "Fair" | "Poor" | "Unknown" => {
    const normalized = String(value ?? "").trim().toLowerCase();
    if (normalized === "good") {
      return "Good";
    }
    if (normalized === "fair") {
      return "Fair";
    }
    if (normalized === "poor") {
      return "Poor";
    }
    return "Unknown";
  };

  const payload = (data as Record<string, unknown>) ?? {};

  const rawPoints = Array.isArray(data)
    ? data
    : Array.isArray(payload?.coverage_data)
      ? (payload.coverage_data as unknown[])
      : [];

  const coveragePoints = rawPoints
    .map((item: unknown): CoveragePoint | null => {
      const point = item as Record<string, unknown>;
      const distanceKm = toNumberOrNull(point?.distance_km);
      const receivedPowerDbm = toNumberOrNull(point?.received_power_dbm);
      const linkMarginDb = toNumberOrNull(point?.link_margin_db);

      if (distanceKm === null || receivedPowerDbm === null || linkMarginDb === null) {
        return null;
      }

      return {
        distanceKm,
        receivedPowerDbm,
        linkMarginDb,
        isCovered: Boolean(point?.is_covered),
        signalQuality: toSignalQuality(point?.signal_quality),
      };
    })
    .filter((point: CoveragePoint | null): point is CoveragePoint => point !== null)
    .sort((a: CoveragePoint, b: CoveragePoint) => a.distanceKm - b.distanceKm);

  const coverageRadiusKm = toNumberOrNull(payload?.farthest_covered_distance_km);
  const rawComparisonData = Array.isArray(payload?.comparison_data)
    ? (payload.comparison_data as unknown[])
    : [];

  const comparisonData = rawComparisonData
    .map((item: unknown): CoverageComparisonPoint | null => {
      const row = item as Record<string, unknown>;
      const distanceKm = toNumberOrNull(row?.distance_km);
      const freeSpace = toNumberOrNull(row?.free_space);
      const urban = toNumberOrNull(row?.urban ?? row?.two_ray);
      const suburban = toNumberOrNull(row?.suburban ?? row?.log_distance);

      if (
        distanceKm === null ||
        freeSpace === null ||
        urban === null ||
        suburban === null
      ) {
        return null;
      }

      return {
        distance_km: distanceKm,
        free_space: freeSpace,
        urban,
        suburban,
      };
    })
    .filter(
      (point: CoverageComparisonPoint | null): point is CoverageComparisonPoint => point !== null
    )
    .sort((a: CoverageComparisonPoint, b: CoverageComparisonPoint) => a.distance_km - b.distance_km);

  return {
    coveragePoints,
    coverageRadiusKm,
    comparisonData,
  };
}

export async function analyzeMlSignalIntelligence(
  input: MlSignalIntelligenceInput
): Promise<MlSignalIntelligenceResult> {
  const evaluatedDistanceKm = Math.min(20, Math.max(1, Math.round(input.distanceKm)));

  const coveragePromise = analyzeCoverage({
    txPowerDbm: input.txPowerDbm,
    txAntennaGainDbi: input.txAntennaGainDbi,
    rxAntennaGainDbi: input.rxAntennaGainDbi,
    frequencyMhz: input.frequencyMhz,
    receiverSensitivityDbm: input.receiverSensitivityDbm,
    model: input.model,
  });

  const timeoutMs = 12000;
  const timeoutPromise = new Promise<CoverageResults>((_, reject) => {
    setTimeout(() => reject(new Error("Backend coverage analyze timed out")), timeoutMs);
  });

  const coverageResults = await Promise.race([coveragePromise, timeoutPromise]);

  const exactPoint = coverageResults.coveragePoints.find(
    (point) => point.distanceKm === evaluatedDistanceKm
  );

  const fallbackPoint =
    coverageResults.coveragePoints.length > 0
      ? coverageResults.coveragePoints[coverageResults.coveragePoints.length - 1]
      : null;

  const selectedPoint = exactPoint ?? fallbackPoint;

  return {
    receivedPowerDbm: selectedPoint?.receivedPowerDbm ?? null,
    linkMarginDb: selectedPoint?.linkMarginDb ?? null,
    predictedSignalQuality: selectedPoint?.signalQuality ?? "Unknown",
    evaluatedDistanceKm,
  };
}
