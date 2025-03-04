export interface Position<E> {
  /** 
   * Returns the element stored at this position
   *
   * @returns the stored element
   * @throws an error if position is invalid
   */
  getElement(): E | null;
}

export default interface PositionalList<E> {

  size(): number;

  isEmpty(): boolean;

  first(): Position<E | null> | null;

  last(): Position<E | null> | null;

  before(p: Position<E> | null): Position<E | null> | null;

  after(p: Position<E>): Position<E | null> | null;

  addFirst(e: E): Position<E | null> | null;

  addLast(e: E): Position<E | null> | null;

  addBefore(p: Position<E>, e: E): Position<E | null> | null;

  addAfter(p: Position<E>, e: E): Position<E | null> | null;

  set(p: Position<E>, e: E): E | null;

  remove(p: Position<E>): E | null;
}
