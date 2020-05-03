import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

type Props = {
  increment: () => void;
  incrementIfOdd: () => void;
  incrementAsync: () => void;
  decrement: () => void;
  counter: number;
};

export default function Counter(props: Props) {
  const {
    increment,
    incrementIfOdd,
    incrementAsync,
    decrement,
    counter,
  } = props;

  return (
    <div>
      <div data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
      </div>
      <div data-tid="counter">{counter}</div>
      <div>
        <button onClick={increment} data-tclass="btn" type="button">
          <i className="fa fa-plus" />
        </button>
        <button onClick={decrement} data-tclass="btn" type="button">
          <i className="fa fa-minus" />
        </button>
        <button onClick={incrementIfOdd} data-tclass="btn" type="button">
          odd
        </button>
        <button
          onClick={() => incrementAsync()}
          data-tclass="btn"
          type="button"
        >
          async
        </button>
      </div>
    </div>
  );
}
