import './App.css'
import TestClient from './Client.jsx'
import NotifaiClient from './swreg.js'

function App() {
  const appCred = {
    "name": "tesdta",
    "orgId": "YOUR ORG ID",
    "_id": "YOUR APP _ID",
    "publicKey": "CUSTOM_KEY"
}
  NotifaiClient.init(appCred, 'your-user-id', true)
  const handleSubscribe = () => {
    NotifaiClient.subscribe()
  }

  const handleUnsubscribe = () => {
    NotifaiClient.unsubscribe()
  }

  return (
    <>
      <div>
        <TestClient/>
        <div className="byy">
          <button onClick={handleSubscribe}>Subscribe</button>
          <button onClick={handleUnsubscribe}>Unsubscribe</button>          
        </div>

      </div>
    </>
  )
}

export default App
