export interface ApiSuccessResponse<T = undefined> {
  statusCode: number;
  message: string | null;
  data?: T;
  success: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: unknown;
  success: false;
}
