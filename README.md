# waitroom-openai node backend

Node Express backend that accepts a chunk of unstructured text and send it to OpenAI API to generate short title.

## Run
- Run on local
    ```
    > npm install
    > npm start
    ```
- Run on Docker
    ```
    > docker build . -t <your username>/waitroom-openai-server
    > docker run -p <port>:8080 -d <your username>/waitroom-openai-server
    ```

## ENV variables
- REDIS_URL : redis server url for persistent storage and queue messaging
- QUEUE_CHANNEL : redis channel name for queue messaging
- MAX_RATE : request maximum rate in a given MAX_RATE_SPAN time span
- MAX_RATE_SPAN : request maximum rate time span in seconds

## End points
- /api/request
  Method: POST
  Content-Type: application/json
  Body: 
  ```json
  {
    "content": "blabla"
  }
  ```
  Response:
  ```json
  {
    "error": 0,
    "errMsg": "",           // Error msg: valid when error = 1
    "id": "l2tWlVJleL",     // Request ID
    "status": "0",          // Request status: 0: Complete, 1: Queued, 2: Error
    "msg": "",              // Request message: valid when status = 0
    "resp": "response"      // OpenAI response: valid when status = 0
  }
  ```
- /api/request/:id
  Method: GET
  Params: 
  ```
  id: Request id
  ```
  Response:
  ```json
  {
    "error": 0,
    "errMsg": "",           // Error msg: valid when error = 1
    "id": "l2tWlVJleL",     // Request ID
    "status": "0",          // Request status: 0: Complete, 1: Queued, 2: Error
    "msg": "",              // Request message: valid when status = 0
    "resp": "response"      // OpenAI response: valid when status = 0
  }
  ```

## TODO
1. Use Cypress for integration testing.
2. Implement API throttling
3. Migrate openai request throttling to proxy server
4. Deploy using Kubernetes