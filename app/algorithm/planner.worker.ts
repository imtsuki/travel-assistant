import log from 'electron-log';

import cities from '../data/cities.json';
import routes from '../data/routes.json';

const ctx: Worker = self as any;

import { dijkstra } from './dijkstra';
import { Graph } from './graph';

let graph = new Graph(cities);

for (let route of routes) {
  graph.addRoute(route);
}

ctx.addEventListener('message', (event) => {
  log.log('planner.worker received request:', event.data);

  let plans = dijkstra(graph, event.data.source, event.data.destination);

  ctx.postMessage(plans);
});

export default null as any;
