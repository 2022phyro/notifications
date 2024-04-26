const Notifai = require('./sdk/node')

const apiKey = 'd82d7532194989_55ffc89fc0c9b3b48078ecb2532076674334a8917c5e51cd5091708f5480cf5b'
const client = new Notifai(apiKey, "662a23645866ed08ea1abebc")
const message = {
    userId: 'your-user-id',
    title: 'Sample title',
    body: "testing to see if my makeshift sdk workd for now",
    name: 'duplo',
    icon: 'https://th.bing.com/th/id/R.f87a0379b71dd4cb1e1a79a24c900b0c?rik=RAEwKEBWKjE4xw&pid=ImgRaw&r=0'
}

client.send(message)
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })