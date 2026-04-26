export interface TrackingHistoryItem {
  status: string;
  date?: string;
  location: string;
  actor?: string;
  isAlert?: boolean;
  isCompleted?: boolean;
}

export interface ParcelData {
  trackingNumber: string;
  registrationDate: string;
  type: string;
  route: string;
  status: string;
  rawStatus: string;
  sender: { name: string; city: string; branch: string };
  receiver: { name: string; city: string; branch: string };
  details: { weight: string; dimensions: string; declaredValue: string };
  financials: { cost: string; deliveryType: string };
  history: TrackingHistoryItem[];
}