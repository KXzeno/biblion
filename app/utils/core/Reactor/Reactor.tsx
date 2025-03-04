// import StringLiteralBuilder from "@/utils/auxil/StringLiteralBuilder";

/**
 * The Reactor class creates strongly typed 
 * byproducts within React's ecosystem with the 
 * core intention to reduce unnecessary boilerplate 
 *
 * @remarks
 *
 * After days of effort playing with conditional and 
 * template literal types, I've yet to find a solution
 * to convert parsed strings to literals. As of now this
 * class will be deprecated until picked up for relevant use
 *
 * @deprecated
 *
 * @author Kx
 */
export default class Reactor {
  // private fn;

  /**
   * Instantiates with the reducer callback
   *
   * @param fn - the reducer callback
   */
  private constructor(/** fn: () => void */) {
    // this.fn = fn;
  }

  /**
   * Parses the function body for action types
   *
   * @returns **TODO**
   */
  // private parseActionTypes(): string[] {
  //   const fnString = this.fn.toString();

  //   const params = fnString.match(/(?!\([\s]?)([\w\s\,]+)(?=[\s]?\))/);

  //   if (params && params[0].split(/\,/).length !== 2) {
  //     throw new Error('Arguments unfulfilled.');
  //   }

  //   let types: RegExpStringIterator<RegExpMatchArray> | string[] = fnString.matchAll(/(?!case\:\s\')([\w]+)(?=\':)/g);

  //   try {
  //     types = types.map(type => type[0]).toArray();
  //     return types;
  //   } catch (err) {
  //     throw new Error(`Failed to parse types: ${err}`);
  //   }
  // }

  /**
   * Customized reducer that automates static typing
   *
   * @param fn - the reducer callback
   */
  // public static useReducer(fn: (state: object, action: { type: string }) => object) {
  //    const reactor = new Reactor(fn);
  //    const actionTypeArray: Array<string> = reactor.parseActionTypes();
  // }
}

// type ActionTypes<T, RefArray extends string[], Indexer extends number[] = []> = Indexer['length'] extends RefArray['length'] ? 
//   Exclude<T, null> :
//   ActionTypes<T | RefArray[Indexer['length']], RefArray, [...Indexer, Indexer['length']]>;

