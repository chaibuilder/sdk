type ChaiBlock<T = Record<string, any>> = {
  _id: string;
  _name?: string;
  _parent?: string | null | undefined;
  _type: string;
  _libBlock?: string;
} & T;

export type { ChaiBlock };
