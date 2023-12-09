export interface APData {
  id: string;
  type: string;
  key: CryptoKey;
}

export const APDataReference: {
  current: APData | null;
} = {
  current: null,
};
