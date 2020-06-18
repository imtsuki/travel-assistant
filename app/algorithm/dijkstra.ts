import { Dictionary } from 'typescript-collections';

import cities from '../data/cities.json';

import { Graph, CityTimeNode } from './graph';

export function dijkstra(graph: Graph, source: string, destination: string) {
  let dist = new Dictionary<CityTimeNode, number>();
  let prev = new Dictionary<CityTimeNode, [CityTimeNode, string]>();
  let Q = new Array<CityTimeNode>();
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
