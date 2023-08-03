import SecureRedactError from '../SecureRedactError.js';

const buildBasicToken = (clientId: string, clientSecret: string): string => {
  if (!clientId || !clientSecret) {
    throw new SecureRedactError(
      'clientId and clientSecret must be defined',
      500
    );
  }
  return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
};

export { buildBasicToken };
