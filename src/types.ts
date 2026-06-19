export interface MetricData {
  name: string;
  cnn: number;
  vit: number;
}

export interface StatItem {
  id: string;
  value: string | number;
  label: string;
}

export interface ModelDetail {
  name: string;
  architecture: string;
  highlight: boolean;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    aucRoc: number;
  };
  strengths: string[];
}
