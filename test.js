const Notifai = require('./sdk/node')
const apiKey = '09851f2891fd6a_7d6625475a3a8bfee9f4717bb7cfbe90470126b0f7f76813e50be0719b129967'
const client = new Notifai(apiKey, '662d57ebbcbdcf04cd5826c1')
const message = {
    userId: 'your-user-id',
    title: 'Sample title',
    body: "testing to see if my makeshift sdk workd for now",
    name: 'test3',
    icon: 'https://th.bing.com/th/id/R.f87a0379b71dd4cb1e1a79a24c900b0c?rik=RAEwKEBWKjE4xw&pid=ImgRaw&r=0'
}

client.send(message)
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })