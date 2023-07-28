class SecureRedactError extends Error {
  statusCode: number;

  constructor(err: Error | string, statusCode: number) {
    super(err instanceof Error ? err.message : err);
    this.name = 'SecureRedactError';
    this.statusCode = statusCode;
  }
}

export default SecureRedactError;
