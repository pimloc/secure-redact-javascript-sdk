import SecureRedactError from './SecureRedactError.ts';

class SecureRedactRequest {
  static makeRequest = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      const body = await response.json();
      if (!response.ok || body.error) {
        const text = body.error || 'Error';
        throw new SecureRedactError(
          `Received invalid response: ${text}`,
          response.status
        );
      }
      return body;
    } catch (err) {
      if (err instanceof SecureRedactError) {
        throw err;
      } else {
        throw new SecureRedactError(err.message, 500);
      }
    }
  };

  static buildQueryParams = (obj: Record<string, string>) => {
    const queryParams = [];
    for (const key in obj) {
      const value = encodeURIComponent(obj[key]);
      queryParams.push(`${encodeURIComponent(key)}=${value}`);
    }

    return queryParams.join('&');
  };
}

export { SecureRedactRequest };
