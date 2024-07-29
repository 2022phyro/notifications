const Notifai = require('../sdk/node')
const apiKey = ''
const client = new Notifai(apiKey, '')
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
