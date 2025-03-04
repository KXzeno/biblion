import PositionalList, { Position } from './PositionalList';

export default class LinkedPositionalList<E> implements PositionalList<E> {
  private header: Node<E | null>;
  private trailer: Node<E | null>;
  private sz: number = 0;

  constructor() {
    this.header = new Node(null, null, null);
    this.trailer = new Node(null, this.header, null);
    this.header.setNext(this.trailer);
  }

  private validate(p: Position<E>): Node<E> {
    if (!(p instanceof Node)) {
      throw new Error("Invalid position");
    }

    const node: Node<E> = p as Node<E>;

    if (node.getNext() === null) {
      throw new Error('Position not in list.');
    }

    return node;
  }

  private position(node: Node<E | null> | null): Position<E | null> | null {
    if (node === this.header || node === this.trailer) {
      return null;
    }
    return node;
  }

  public size(): number {
    return this.sz;
  }

  public isEmpty(): boolean {
    return this.sz === 0;
  }

  first(): Position<E | null> | null {
    return this.position(this.header.getNext());
  }

  public last(): Position<E | null> | null {
    return this.position(this.trailer.getPrev());
  }

  public before(p: Position<E>): Position<E | null> | null {
    const node: Node<E> = this.validate(p);
    return this.position(node.getPrev());
  }

  public after(p: Position<E>): Position<E | null> | null {
    const node: Node<E> = this.validate(p);
    return this.position(node.getNext());
  }

  private addBetween(e: E, pred: Node<E | null> | null , succ: Node<E | null> | null): Position<E | null> {
    if (pred === null || succ === null) {
      throw new Error('A neighboring node is conflicted.');
    }

    const newest: Node<E | null> = new Node(e, pred, succ);

    pred.setNext(newest);
    succ.setPrev(newest);

    this.sz++;

    return newest;
  }

  public addFirst(e: E): Position<E | null> | null {
    return this.addBetween(e, this.header, this.header.getNext());
  }

  public addLast(e: E): Position<E | null>  | null {
    return this.addBetween(e, this.trailer.getPrev(), this.trailer)
  }

  public addBefore(p: Position<E>, e: E): Position<E | null> | null {
    const node: Node<E> = this.validate(p);
    return this.addBetween(e, node.getPrev(), node);
  }

  public addAfter(p: Position<E>, e: E): Position<E | null> | null {
    const node: Node<E> = this.validate(p);
    return this.addBetween(e, node, node.getNext());
  }

  public set(p: Position<E>, e: E): E | null {
    const node: Node<E> = this.validate(p);
    const answer: E | null = node.getElement();
    node.setElement(e);
    return answer;
  }

  public remove(p: Position<E>): E | null {
    const node: Node<E> = this.validate(p);
    const predecessor: Node<E | null> | null = node.getPrev();
    const successor: Node<E | null> | null = node.getNext();

    if (predecessor === null || successor === null) {
      throw new Error('Neighboring positions conflicted.');
    }

    predecessor.setNext(successor);
    successor.setPrev(predecessor);
    this.sz--;

    const answer: E | null = node.getElement();
    node.setElement(null);
    node.setNext(null);
    node.setPrev(null);

    return answer;
  }
}

class Node<E> implements Position<E> {
  private element: E | null;
  private prev: Node<E> | null;
  private next: Node<E> | null;

  constructor(e: E, p: Node<E> | null, n: Node<E> | null) {
    this.element = e;
    this.prev = p;
    this.next = n;
  }

  public getElement(): E | null {
    if (this.next === null) {
      throw new Error('Position invalid.');
    }
    return this.element;
  }

  public getPrev(): Node<E | null> | null {
    return this.prev;
  }

  public getNext(): Node<E | null> | null {
    return this.next;
  }

  public setElement(e: E | null): void {
    this.element = e;
  }

  public setPrev(p: Node<E> | null): void {
    this.prev = p;
  }

  public setNext(n: Node<E> | null): void {
    this.next = n;
  }
}
