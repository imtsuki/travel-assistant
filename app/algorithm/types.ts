export interface City {
  name: string;
  position: { longitude: number; latitude: number };
  risk: string;
}

export interface Route {
  from: string;
  to: string;
  startTime: number;
  endTime: number;
  type: string;
}
