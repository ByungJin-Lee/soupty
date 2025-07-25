export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('Network');
};

export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('timeout');
};