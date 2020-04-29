import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import {getTodoById, updateTodo}from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const item = await getTodoById(todoId)

  if (!Boolean(item)) {
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

  await updateTodo(updatedTodo, todoId)
  const updateItem = await getTodoById(todoId)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: updateItem.Items[0],
    })
  }
}
