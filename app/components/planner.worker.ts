import log from 'electron-log';
import { Dictionary } from 'typescript-collections';

import cities from '../data/cities.json';
import routes from '../data/routes.json';

const ctx: Worker = self as any;

interface City {
  name: string;
  position: { longitude: number; latitude: number };
  risk: string;
}

interface Route {
  from: string;
  to: string;
  startTime: number;
  endTime: number;
  type: string;
}

interface Edge {
  time: number;
  type: string;
}

class Graph {
  matrix: Dictionary<[[string, number], [string, number]], Edge>;

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

  getWeight(from: [string, number], to: [string, number]) {
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

  getRouteType(from: [string, number], to: [string, number]) {
    if (from[0] === to[0]) {
      return 'WAIT';
    } else {
      let edge = this.matrix.getValue([from, to]);
      return edge?.type ?? 'UNKNOWN';
    }
  }
}

let graph = new Graph(cities);

for (let route of routes) {
  graph.addRoute(route);
}

function dijkstra(graph: Graph, source: string, destination: string) {
  let dist = new Dictionary<[string, number], number>();
  let prev = new Dictionary<[string, number], [[string, number], string]>();
  let Q = new Array<[string, number]>();
  for (let city of cities) {
    for (let i = 6; i <= 23; i++) {
      dist.setValue([city.name, i], Infinity);
      Q.push([city.name, i]);
    }
  }

  dist.setValue([source, 6], 0);

  while (Q.length > 0) {
    let u = Q.reduce((min, next) => {
      let distMin = dist.getValue(min) ?? Infinity;
      let distNext = dist.getValue(next) ?? Infinity;
      if (distMin > distNext) {
        min = next;
      }
      return min;
    });

    Q = Q.filter((v) => v !== u);

    for (let v of Q) {
      let alt = (dist.getValue(u) ?? Infinity) + graph.getWeight(u, v);
      if (alt < (dist.getValue(v) ?? Infinity)) {
        dist.setValue(v, alt);
        prev.setValue(v, [u, graph.getRouteType(u, v)]);
      }
    }
  }

  let plans = [];

  for (let v of prev.keys()) {
    if (v[0] === destination) {
      let edge = prev.getValue(v);
      if (edge && edge[1] !== 'WAIT') {
        let plan = [];

        plan.unshift([v, 'ARRIVED']);

        let current = v;

        while (true) {
          let step = prev.getValue(current);

          if (step) {
            plan.unshift(step);
            current = step[0];
          } else {
            break;
          }
        }

        plans.push({
          risk: dist.getValue(v) ?? Infinity,
          arrivalTime: v[1],
          plan: plan,
        });
      }
    }
  }
  return plans;
}

ctx.addEventListener('message', (event) => {
  log.log('planner.worker received request:', event.data);

  let plans = dijkstra(graph, event.data.source, event.data.destination);

  ctx.postMessage(plans);
});

export default null as any;
