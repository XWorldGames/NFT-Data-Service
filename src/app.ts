import errorMiddleware from '@middlewares/error.middleware'
import { readFileSync, resolvePath } from '@utils/filesystem'
import { logger, stream } from '@utils/logger'
import compression from 'compression'
import config from 'config'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import { useExpressServer } from 'routing-controllers'
import spdy from 'spdy'

class App {
  public app: express.Application
  public port: number
  public env: string
  public h2: boolean

  constructor(Controllers: Function[], port: number, h2: boolean) {
    this.app = express()
    this.port = port
    this.env = process.env.NODE_ENV || 'development'
    this.h2 = h2
    this.app.use(express.static(resolvePath('../public')))

    this.initializeMiddlewares()
    this.initializeRoutes(Controllers)
    this.initializeErrorHandling()
  }

  public listen() {
    ;(this.h2
      ? spdy.createServer(
          {
            key: readFileSync(config.get('tls.key')),
            cert: readFileSync(config.get('tls.cert')),
            spdy: {
              protocols: ['h2'],
            },
          },
          this.app,
        )
      : this.app
    ).listen(this.port, () => {
      logger.info(`=================================`)
      logger.info(`======= ENV: ${this.env} =======`)
      logger.info(`🚀 App listening on the port ${this.port}`)
      logger.info(`=================================`)
    })
  }

  public getServer() {
    return this.app
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.get('log.format'), { stream }))
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: '*',
        credentials: false,
      },
      controllers,
      defaultErrorHandler: false,
    })
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware)
  }
}

export default App
