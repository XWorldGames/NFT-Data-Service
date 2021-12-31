import { HttpException } from '@exceptions/http.exception'

export class HttpNotFoundException extends HttpException {
  constructor(message?: string) {
    super(404, message)
  }
}
