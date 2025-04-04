type ChaiBlock<T = Record<string, any>> = {
  _id: string;
  _name?: string;
  _parent?: string | null | undefined;
  _bindings?: Record<string, string>;
  _libBlock?: string;
  _type: string;
  _partialBlockId?: string;
} & T;

export type { ChaiBlock };
