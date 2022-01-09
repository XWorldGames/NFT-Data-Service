// organize-imports-ignore
process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'reflect-metadata'
import 'dotenv/config'
import { Container } from 'typedi'
import { useContainer } from 'routing-controllers'
import '@/collections'
import App from '@/app'
import { validateEnv } from '@utils/util'
import { getImageControllers, getMetadataControllers } from '@/collection'
import { ImageTokenController } from '@controllers/image/image-token.controller'
import { MetadataController } from '@controllers/metadata/metadata.controller'
import { EmptyController } from '@controllers/empty.controller'
import '@interceptors/response.interceptor'

validateEnv()
useContainer(Container)

const imagePort = Number(process.env.IMAGE_PORT || 9001)
const metadataPort = Number(process.env.METADATA_PORT || 9002)

new App(getImageControllers().concat([ImageTokenController, EmptyController]), imagePort, true).listen()
new App(getMetadataControllers().concat([MetadataController, EmptyController]), metadataPort, false).listen()
