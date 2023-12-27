interface IPagination {
  total?: number;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface IPaginationResponse<T> extends IApiResponse<T> {
  pagination?: IPagination;
}
