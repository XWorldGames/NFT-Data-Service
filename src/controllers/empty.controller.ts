import { HttpNotFoundException } from '@exceptions/http-not-found.exception'
import { All, Controller } from 'routing-controllers'
import { Service } from 'typedi'

@Controller()
@Service()
export class EmptyController {
  @All('*')
  empty() {
    throw new HttpNotFoundException()
  }
}
