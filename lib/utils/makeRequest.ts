import SecureRedactError from '../SecureRedactError.ts';

export const makeRequest = async (url: string, options?: RequestInit) => {
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
