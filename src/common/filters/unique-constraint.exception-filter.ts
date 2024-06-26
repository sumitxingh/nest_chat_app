import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


@Catch(PrismaClientKnownRequestError)
export class UniqueConstraintExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { meta } = exception;
    const message = this.getErrorMessage(meta);

    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'Conflict',
    });
  }

  private getErrorMessage(meta: any): string {
    if (meta && meta.modelName && meta.target) {
      const field = Array.isArray(meta.target) ? meta.target[0] : meta.target;
      const modelName = meta.modelName;
      return `This ${field} is already exists in ${modelName}`
    }

    return 'Resource already exists.';
  }
}
