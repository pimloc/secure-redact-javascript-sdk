import SecureRedactError from '../SecureRedactError.ts';

const buildBasicToken = (clientId: string, clientSecret: string): string => {
  if (!clientId || !clientSecret) {
    throw new SecureRedactError(
      'clientId and clientSecret must be defined',
      500
    );
  }
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  )}`;
};

export { buildBasicToken };
