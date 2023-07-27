class SecureRedactError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'SecureRedactError';
    this.statusCode = statusCode;
  }
}

export default SecureRedactError;
