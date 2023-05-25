type Newable<T> = { new (...args: any[]): T };

type OmitBaseEntity<T> = Omit<
  T,
  "hasId" | "save" | "remove" | "softRemove" | "recover" | "reload"
>;
