import { HashedImageEntity } from '@/entities/hashed-image.entity'
import { NotModifiedResponse } from '@/http/not-modified.response'
import { Response } from 'express'
import { Action, Interceptor, InterceptorInterface } from 'routing-controllers'
import { Service } from 'typedi'

@Interceptor()
@Service()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, content: any) {
    const response = action.response as Response
    if (content instanceof HashedImageEntity) {
      this.applyCacheControl(response).header('ETag', `"${content.hash}"`).contentType(content.image.mimetype)
      return content.image.buffer
    } else if (content instanceof NotModifiedResponse) {
      this.applyCacheControl(response).status(304).header('ETag', `"${content.hash}"`)
      return ''
    }
    return content
  }

  private applyCacheControl(response: Response): Response {
    const ttl = 3600
    return response.setHeader('Cache-Control', `public, max-age=${ttl}, must-revalidate, proxy-revalidate`)
  }
}
