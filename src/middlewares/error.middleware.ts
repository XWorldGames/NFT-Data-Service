import { HttpException } from '@exceptions/http.exception'
import { logger } from '@utils/logger'
import { NextFunction, Request, Response } from 'express'

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500
    const message: string = error.message || ''

    if (status === 500) {
      // eslint-disable-next-line no-console
      console.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`, error)
      logger.error(`[HTTP] ${req.method} ${req.path} >> StatusCode:: ${status}, Message:: ${message}`)
    }

    res.setHeader('Cache-Control', 'no-store, no-cache').status(status).send(message)
  } catch (error) {
    next(error)
  }
}

export default errorMiddleware
