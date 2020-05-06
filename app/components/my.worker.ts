import log from 'electron-log';
import * as R from 'ramda';

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
  log.log('worker received message', event.data);
  setTimeout(
    () =>
      ctx.postMessage({
        foo: 'boo',
        bar: R.add(1, 2),
      }),
    2000
  );
});
export default null as any;
