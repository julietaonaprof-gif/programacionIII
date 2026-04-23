import ErrorDto from "../data/dtos/error.dto";

export default class CustomError {
  private constructor(private _code: number, private message: string, private scope: string, private origError?: Error) {}

  get code(): number {
    return this._code;
  }

  public getErrorDto(): ErrorDto {
    const error: ErrorDto = {
      code: this.code,
      message: this.message ?? "Error inesperado",
      techDetail: {
        scope: this.scope,
        techReason: JSON.stringify(this.origError) ?? "-"
      }
    }
    return error;
  }

  public static buildBadRequestError(message: string, scope: string, origError?: Error): CustomError {
    const error = new CustomError(400, message, scope, origError);
    return error;
  }

  public static buildNotFoundError(message: string, scope: string, origError?: Error): CustomError {
    const error = new CustomError(404, message, scope, origError);
    return error
  }

  public static buildConflictError(message: string, scope: string, origError?: Error): CustomError {
    const error = new CustomError(409, message, scope, origError);
    return error
  }

  public static buildInternalError(message: string, scope: string, origError?: Error): CustomError {
    const error = new CustomError(500, message, scope, origError);
    return error
  }

}
