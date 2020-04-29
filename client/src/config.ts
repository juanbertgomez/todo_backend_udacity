// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'wsh2fa6gk9'

export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'juanbert.auth0.com',            // Auth0 domain
  clientId: 'bfTLEvR5Z6eHY5oMlaz54dJD0P3Zaovk',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
