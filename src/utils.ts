function identity<T>(d: T): T {
  return d;
}

function noop() {}

type Noop = typeof noop;

export { identity, noop };

export type { Noop };
