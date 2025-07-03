export type Response<T> = T & {
  token: string;
  status: string;
  statusCode: number;
  timestamp: string;
};

export type ParsedError = {
  key: string;
  message: string;
};
