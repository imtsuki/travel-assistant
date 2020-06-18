import { Dictionary } from 'typescript-collections';

import { City, Route } from './types';

/**
 * 代表图中的一条边。
 * @property time 边的长度/时间
 * @property type 边的类型（交通工具）
 */
export interface Edge {
  time: number;
  type: string;
}

/**
 * 图中的坐标以 [城市, 时间] 的二元组来定位。
 */
export type CityTimeNode = [string, number];

/**
 * 根据旅行时刻表来构建出的图，以邻接矩阵方式存储。
 */
export class Graph {
  /**
   * 以邻接矩阵存储的图信息。
   */
  matrix: Dictionary<[CityTimeNode, CityTimeNode], Edge>;

  /**
   * 构造图。
   * @param cities 城市列表，用来创建结点
   */
  constructor(private cities: City[]) {
    this.matrix = new Dictionary();
  }

  /**
   * 向邻接矩阵中添加一条航线/车次。
   * @param route 要添加的航班/车次
   */
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

  /**
   * 获得两个坐标之间的代价值。
   *
   * 坐标以 [城市, 时间] 的二元组定位，当城市相同时，便是在此城市停留对应时间的风险值；
   * 若城市不同，则是乘坐该交通工具的风险值。
   * @param from [起点城市, 时间]
   * @param to [终点城市, 时间]
   *
   * @returns 对应风险值，城市分为高风险 (0.9)、中风险 (0.5)、低风险 (0.2)，
   * 交通工具分为飞机 (9)、火车 (5)、汽车 (2)。
   */
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

  /**
   * 获得两个坐标之间边的类型。
   *
   * @param from [起点城市, 时间]
   * @param to [终点城市, 时间]
   *
   * @returns 对应路线的交通工具 (`'PLANE' | 'TRAIN' | 'BUS'`)，或者是等待 (`'WAIT'`)。
   */
  getRouteType(from: CityTimeNode, to: CityTimeNode): string {
    if (from[0] === to[0]) {
      return 'WAIT';
    } else {
      let edge = this.matrix.getValue([from, to]);
      return edge?.type ?? 'UNKNOWN';
    }
  }
}
