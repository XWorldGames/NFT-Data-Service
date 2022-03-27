// organize-imports-ignore

process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'reflect-metadata'
import 'dotenv/config'
import { Container } from 'typedi'
import { useContainer } from 'routing-controllers'
import '@/collections'
import App from '@/app'
import { validateEnv } from '@utils/util'
import { getDatabaseGraphQLResolvers, getImageControllers, getMetadataControllers } from '@/collection'
import { ImageTokenController } from '@controllers/image/image-token.controller'
import { MetadataController } from '@controllers/metadata/metadata.controller'
import { EmptyController } from '@controllers/empty.controller'
import '@interceptors/response.interceptor'
import { buildSchema, NonEmptyArray } from 'type-graphql'
import { graphqlHTTP } from 'express-graphql'
import '@/graph/services/database'

validateEnv()
useContainer(Container)

const imagePort = Number(process.env.IMAGE_PORT || 9001)
const metadataPort = Number(process.env.METADATA_PORT || 9002)
const databasePort = Number(process.env.DATABASE_PORT || 9003)

new App({ controllers: getImageControllers().concat([ImageTokenController, EmptyController]) }, imagePort, false).listen()
new App({ controllers: getMetadataControllers().concat([MetadataController, EmptyController]) }, metadataPort, false).listen()

buildSchema({
  resolvers: getDatabaseGraphQLResolvers() as NonEmptyArray<Function>,
}).then(schema => {
  new App(
    {
      middlewares: [
        graphqlHTTP({
          schema,
          graphiql: true,
        }),
      ],
    },
    databasePort,
    false,
  ).listen()
})
