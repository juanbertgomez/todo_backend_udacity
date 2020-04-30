import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const userIdIndex = process.env.USER_ID_INDEX

import { getUserId } from '../utils'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('Processing event: ', event)
  let userId = getUserId(event)

  const result = await docClient.query({
    TableName: todosTable,
    IndexName: userIdIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues:{
        ':userId':userId
    }
  }).promise()

  const items = result.Items
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
