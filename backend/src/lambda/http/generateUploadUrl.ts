import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import {TodoAccess} from '../../dataLayer/todosAccess'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

let dataLayer = new TodoAccess()

const bucketName = process.env.ATTACHEMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event ', event)
  const todoId = event.pathParameters.todoId
  const todo = await dataLayer.getTodoById(todoId)

  if (!Boolean(todo)) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const url = getUploadUrl(todoId)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: todo,
      uploadUrl: url
    })
  }
}

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}