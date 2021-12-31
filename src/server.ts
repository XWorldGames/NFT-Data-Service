// organize-imports-ignore
process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'reflect-metadata'
import 'dotenv/config'
import { Container } from 'typedi'
import { useContainer } from 'routing-controllers'
import '@/collections'
import App from '@/app'
import { validateEnv } from '@utils/util'
import { getControllers } from '@/collection'
import { TokenController } from '@controllers/token.controller'
import { EmptyController } from '@controllers/empty.controller'
import '@interceptors/response.interceptor'

validateEnv()
useContainer(Container)

const app = new App(getControllers().concat([TokenController, EmptyController]))
app.listen()
