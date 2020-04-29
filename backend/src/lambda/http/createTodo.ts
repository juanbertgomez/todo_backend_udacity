import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHEMENTS_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const itemId = uuid.v4()

  let userId = getUserId(event)
  let createdAt = new Date()
  let done = false
  let attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${itemId}`

  const newItem = {
    todoId: itemId, 
    userId,
    createdAt,
    done,
    attachmentUrl,
    ...newTodo
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({newItem})
  }
}