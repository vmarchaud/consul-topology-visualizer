
import { readFileSync } from 'fs'

export const httpsKey = process.env.CONSUL_CLIENT_KEY ?
  readFileSync(process.env.CONSUL_CLIENT_KEY) : undefined
export const httpsCert = process.env.CONSUL_CLIENT_CERT ?
  readFileSync(process.env.CONSUL_CLIENT_CERT) : undefined
export const httpsCa = process.env.CONSUL_CACERT ?
  readFileSync(process.env.CONSUL_CACERT) : undefined
export const consulURI = process.env.CONSUL_HTTP_ADDR