import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

let certificate = `-----BEGIN CERTIFICATE-----
MIIC/zCCAeegAwIBAgIJIZXiCuo/1EG5MA0GCSqGSIb3DQEBCwUAMB0xGzAZBgNV
BAMTEmp1YW5iZXJ0LmF1dGgwLmNvbTAeFw0yMDA0MjAwODIzNTVaFw0zMzEyMjgw
ODIzNTVaMB0xGzAZBgNVBAMTEmp1YW5iZXJ0LmF1dGgwLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAL2b9krEATomaYdVj2PI5+AU+zMkgADcXyZn
c7sMbaoUEBWDk5IzD5JOFIyzWansSMe1+hWkChwfHlG2Ky17AL1sfVGw/rTKwe7u
hMEfbefFSzkwz4hdfFwtgQoAd5bgSQnsb9Z4FvYFVdVxedLvmuUFIbaTzRcNG2mJ
O3pdkIWmd8ca0GeiCclYYsC5pUYgbKpjv71cmA+hNuCLQWQshGnhHv/StJ33WTbw
XDavnVbsUjTDnidCQCpdAKVRBvApZaTDWk15U93ZefBpjQ/4Ysky4N3oG0HuvOAp
gxPpkw8rh/JwYIlBIlPlUIYeokaG3Sjp1dVHs6YsrDx5l8Lwp6sCAwEAAaNCMEAw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUYC/R4NAmPt/It4BHI7QikGneQZUw
DgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQAh3cJzK7qqMBgj+TdM
0KNwoH4N1PkYC9XuHpHfEy8YvTCk1vKvIo3aD9Ke7QQEFF1Bawza8fWmEHy8bUKq
2rpS5+FKCjcMkrDnH5pwe5I5PWgiTnpkGMokJtVc+QdvDI7rdO2ra3Ho6Pc4p7XM
mOV7b4CEOHC4JyJ9mq6NJjbh47ePRJUl9hmWD/GOFYP6At39dWTnT5dvVJZDzJMl
tCYE/lLYUUY/w+re72RJNJXgaTN669tO0M8xjI/J1VHB1FJOigibauQMnfjWG7uo
8JmIiGRXOdeE+lvf4SRXS5qP8tKyd8pT70bS9X/bQ/G9rkJ48Ri2P5Wuim9y+skb
ZRFG
-----END CERTIFICATE-----`

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // if(!jwt) {
  //   throw new Error('invalid token')
  // }

    // const response = await Axios.get(jwksUrl)
    // const certificate = response.data

  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload

}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
