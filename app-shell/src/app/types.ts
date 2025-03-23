export type Data = {
  channel: string,
  data: any
}

export interface MFEConfig {
  id: number;
  remoteEntry: string;
  remoteName: string;
  exposedModule: string;
  scopes: { name: string }[]; // API response type
}