type ChaiBlock<T = Record<string, any>> = {
  _id: string;
  _name?: string;
  _parent?: string;
  _libBlock?: string;
  _type: string;
  partialBlockId?: string;
} & T;

export type { ChaiBlock };
