export type ChaiBlock = {
  readonly _id: string;
  readonly _type: string;
  _name?: string;
  _parent?: string | null | undefined;
  _bindings?: Record<string, string>;
} & Record<string, any>;

export type GlobalBlock = Record<string, any>;
