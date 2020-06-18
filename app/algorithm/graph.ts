import { Dictionary } from 'typescript-collections';

import { City, Route } from './types';

export interface Edge {
  time: number;
  type: string;
}

export type CityTimeNode = [string, number];

export class Graph {
  matrix: Dictionary<[CityTimeNode, CityTimeNode], Edge>;

  constructor(private cities: City[]) {
    this.matrix = new Dictionary();
  }

  addRoute(route: Route) {
    let edge = this.matrix.getValue([
      [route.from, route.startTime],
      [route.to, route.endTime],
    ]);
    if (edge) {
      console.log('Duplicate!');
    } else {
      this.matrix.setValue(
        [
          [route.from, route.startTime],
          [route.to, route.endTime],
        ],
        { time: route.endTime - route.startTime, type: route.type }
      );
    }
  }

  getWeight(from: CityTimeNode, to: CityTimeNode) {
    if (from[0] === to[0]) {
      let risk = this.cities.find((c) => c.name == from[0])?.risk;
      let riskParam;
      switch (risk) {
        case 'LOW':
          riskParam = 0.2;
          break;
        case 'MEDIUM':
          riskParam = 0.5;
          break;
        case 'HIGH':
          riskParam = 0.9;
          break;
        default:
          throw new Error(`Unknown risk level ${risk}`);
      }
      return from[1] < to[1] ? (to[1] - from[1]) * riskParam : Infinity;
    } else {
      let edge = this.matrix.getValue([from, to]);
      if (edge) {
        let riskParam;
        switch (edge.type) {
          case 'PLANE':
            riskParam = 9;
            break;
          case 'TRAIN':
            riskParam = 5;
            break;
          case 'BUS':
            riskParam = 2;
            break;
          default:
            throw new Error(`Unknown route type ${edge.type}`);
        }
        return edge.time * riskParam;
      } else {
        return Infinity;
      }
    }
  }

  getRouteType(from: CityTimeNode, to: CityTimeNode) {
    if (from[0] === to[0]) {
      return 'WAIT';
    } else {
      let edge = this.matrix.getValue([from, to]);
      return edge?.type ?? 'UNKNOWN';
    }
  }
}
