export const buildQueryParams = (obj: Record<string, string>) => {
  const queryParams = [];
  for (const key in obj) {
    const value = encodeURIComponent(obj[key]);
    queryParams.push(`${encodeURIComponent(key)}=${value}`);
  }

  return queryParams.join('&');
};
