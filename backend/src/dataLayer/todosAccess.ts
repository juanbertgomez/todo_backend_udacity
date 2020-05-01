import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWS  from 'aws-sdk'
import {TodoItem} from '../models/TodoItem'
import {TodoUpdate} from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'


export class TodoAccess {
  constructor (
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX,
    private readonly bucketName = process.env.ATTACHEMENTS_S3_BUCKET


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

  async getTodoById(id: string): Promise<TodoItem>{
    let items = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues:{
            ':todoId': id
        }
    }).promise()

    return items.Items[0] as TodoItem
  }


  async createTodo(userId: string, newTodo: CreateTodoRequest):Promise<TodoItem> {

    const itemId = uuid.v4()

    let createdAt = new Date().toISOString()
    let done = false
    let attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${itemId}`
  
    const newItem = {
      todoId: itemId, 
      userId,
      createdAt: createdAt,
      done,
      attachmentUrl,
      ...newTodo
    }
  
    await this.docClient.put({
      TableName: this.todosTable,
      Item: newItem
    }).promise()

    return newItem as TodoItem

  }

  async  updateTodo(updatedTodo:TodoUpdate,todoId:string){
    await this.docClient.update({
        TableName: this.todosTable,
        Key:{
            'todoId':todoId
        },
        UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
        ExpressionAttributeValues: {
            ':n' : updatedTodo.name,
            ':d' : updatedTodo.dueDate,
            ':done' : updatedTodo.done
        },
        ExpressionAttributeNames:{
            "#namefield": "name"
          }
      }).promise()
  }

  async deleteTodoById(todoId: string) : Promise<string> {
    const param = {
      TableName: this.todosTable,
      Key:{
          "todoId":todoId
      }
  }
  
  await this.docClient.delete(param).promise()

  return todoId
  }

}