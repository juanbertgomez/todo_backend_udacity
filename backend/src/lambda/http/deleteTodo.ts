import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import {TodoAccess} from '../../dataLayer/todosAccess'

let dataLayer = new TodoAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

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
 
  await dataLayer.deleteTodoById(todoId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: `todo ${todo.name} deleted`,
    })
  }

}