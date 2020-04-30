import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {TodoItem} from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  constructor (
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.GROUPS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX

  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    // TODO: Get all TODO items for a current user
  
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName : this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues:{
          ':userId':userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}