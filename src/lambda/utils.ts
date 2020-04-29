import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import * as AWS from 'aws-sdk'
import {TodoUpdate} from '../models/TodoUpdate'

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export async function getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
  return await docClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues:{
          ':todoId': id
      }
  }).promise()
}

export async function updateTodo(updatedTodo:TodoUpdate,todoId:string){
  await docClient.update({
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

export async function deleteTodoById(todoId: string){
  const param = {
      TableName: todosTable,
      Key:{
          "todoId":todoId
      }
  }

   await docClient.delete(param).promise()
}