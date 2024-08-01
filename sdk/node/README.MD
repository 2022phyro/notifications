# Notifai

This is a little project of mine to create a web-push notification system independent of GCM and the others (for fun :)). It makes use of grpc to handle the requests from the clients and queue them in in order to make sure that it is able to reach our servers with the least latency possible

## Installation

```javascript
npm i notifai
```

## Usage
You have to head over to [Notifai](https://notifai-two.vercel.app) to create a new account. Also create a new app to begin with. Then you can create an API\_KEY. The key is only shown once so be sure to copy it the first time you see it. You should have a server running with our frontend service-workers and library and then get your appId to attempt the code below
```javascript
const Notifai = require('notifai')
const apiKey = 'your_API_KEY'
const client = new Notifai(apiKey, 'YOUR_APP_ID')
const message = {
    userId: 'your-user-id',
    title: 'Sample title',
    body: "testing to see if my makeshift sdk workd for now",
    icon: 'https://th.bing.com/th/id/R.f87a0379b71dd4cb1e1a79a24c900b0c?rik=RAEwKEBWKjE4xw&pid=ImgRaw&r=0'
}
client.send(message)
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })
```
