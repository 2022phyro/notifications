# Notifai

So Notifai is a little project of mine that I tok on to create a notification micro service. Along the way it has grown into a full service and although in the beta stages. SO here's a little instructions for testing

## Instructions

### Setup

For ease of access, I've prepared zips of the necessary files so you can easily download them and unzip at once. The current sdk available right now is for node js.

* Go to the *tars* folder.
* Download *node_sdk.gz*
* Untar it into your project directory (I haven't published to npm ...yet)
* run npm install

### Testing

* Go to the official site <https://notifai-two.vercel.app/> and sign up.
* Create a new app and give it any name of your choice.

A simple react app has been provided for testing purpose.

* Download the *test_react.gz* file.
* Untar it to a folder of your choice
* Run `npm install`
* Go to the **src/App.jsx** file
* Update the appCred variable with your app details from your system. Also take note of the userId variable. It's supposed to represent the id of a user in your database.

```javascript
// App cred variable
    const appCred = {
    "name": "tesdta",
    "orgId": "YOUR ORG ID",
    "_id": "YOUR APP _ID",
    "publicKey": "CUSTOM_KEY"
}
// userId
  NotifaiClient.init(appCred, 'your-user-id', true)

```
  
* Run `npm run dev` to start the app
* Click on the `subscribe` button to subscribe that system to the service.

### Sending a notification

#### From the composer

* Go to your dashboard to the compose tab
* Compose a new notification. Put in the userId input the user id that you set here `NotifaiClient.init(appCred 'your-user-id', true)`
* Click send and wai for your notification to appear on your system

#### Using the sdk

* Download the test file at *tests/test.js*
* Go to your dashboard and create a new api key. Make sure to copy the key as it's a one time view only
* come to the test.js file

```javascript
// Update import path for the sdk
const Notifai = require('./sdk/node')

// add the api key you just copied
const apiKey = 'your api key'

// Copy your app id from your app settings on your dashboard
const client = new Notifai(apiKey, 'your app id')

// Update your userId property to be the userId of your subscribed user. You can customize the title body and specify a new url for the image icon. Please keep it short.
const message = {
    userId: 'your-user-id',
    title: 'Sample title',
    body: "testing to see if my makeshift sdk workd for now",
    icon: 'https://th.bing.com/th/id/R.f87a0379b71dd4cb1e1a79a24c900b0c?rik=RAEwKEBWKjE4xw&pid=ImgRaw&r=0'
}
```

* Run `node test.js` and wait for your notification at the corner
