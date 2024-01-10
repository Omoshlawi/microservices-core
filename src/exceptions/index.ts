export class APIException extends Error {
  public status: number;
  public errors: { [key: string]: any };

  constructor(status: number, errors: { [key: string]: any }) {
    super("API Exception");
    this.status = status;
    this.errors = errors;
  }
}
export class ServiceNotFoundException extends Error {
  constructor(message?: string) {
    super("ServiceNotFoundException");
    this.message = message ?? "No matching service found";
  }
}
