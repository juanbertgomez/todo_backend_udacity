import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {TodoItem} from '../models/TodoItem'

// import * as uuid from 'uuid'


const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  constructor (
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX

  ) {}
  async getTodos(userId: string): Promise<TodoItem[]> {
    // TODO: Get all TODO items for a current user
    console.log('userId',userId)
  
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName : this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues:{
          ':userId':userId
      }
    }).promise()

    console.log('resutl', result)
    const items = result.Items
    return items as TodoItem[]
  }

  // async createTodo(userId: string) {

  //   const itemId = uuid.v4()

  //   let createdAt = new Date()
  //   let done = false
  //   let attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${itemId}`
  
  //   const newItem = {
  //     todoId: itemId, 
  //     userId,
  //     createdAt,
  //     done,
  //     attachmentUrl,
  //     ...newTodo
  //   }
  
  //   await docClient.put({
  //     TableName: todosTable,
  //     Item: newItem
  //   }).promise()

  // }
}