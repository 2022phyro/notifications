
// function initAppCred (appCred, accessToken, userId) {
//   appCred.authToken = "JWT " + accessToken
//   appCred.userId = userId
//   return appCred
// }
var items = {};
const createStore = (useLS) => {
  useLS = useLS || true
	items = {}
  const getItem = (key) => {
    if (useLS) {
      return JSON.parse(localStorage.getItem(key))
    }
    return items[key]
  };
  const setItem = (key, value) => {
      items[key] = value;
      if (useLS) {
          localStorage.setItem(key, JSON.stringify(value))
      }
  };
  const removeItem = (key) => {
      delete items[key];
      if (useLS) {
        localStorage.removeItem(key)
      }
  };
  const reset = () => {
    if (useLS) {
      for (let key in items) {
        localStorage.removeItem(key)
      }
    }
    items = {};
  };
  return {
      reset,
      getItem,
      removeItem,
      setItem
  };
};
const NotifaiClient = {
  init (appCred, useCookie) {
    this.useCookie = useCookie || true
    this.LEEWAY = 10 * 60 * 1000
    this.store = createStore(!useCookie)
    this.refreshUrl = 'https://notifai.futurdevs.tech/api/v1/refresh'
    Object.assign(this, appCred)
    this.url = `https://notifai.futurdevs.tech/api/v1/apps/${this._id}`
  },

  getToken () {
    let accessToken = this.store.getItem('access')
		const expiry = this.store.getItem('expiry')
    if (accessToken) {
      if (new Date(expiry) < Date.now() + this.LEEWAY) {
      accessToken = this.refreshToken()
			console.log(accessToken)
    }
			return "JWT " + accessToken
		}
  },

  refreshToken() {
		console.log(this.useCookie)
    return fetch(this.refreshUrl, {
      method: 'POST',
			...(this.useCookie && { credentials: 'include' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(jsonData => {
			console.log(jsonData)
      this.store.setItem('access', jsonData.data.accessToken)
      this.store.setItem('expiry', jsonData.data.access_exp)
      if (!this.useCookie) {
        localStorage.setItem('refresh', jsonData.data.refreshToken)
      }
      this.store.setItem('refresh', jsonData.data.refreshToken)
      return jsonData.data.accessToken
    })
  },
  subscribe (userId) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((swReg) => {
          console.log('Service Worker is registered', swReg);
          swReg.pushManager.getSubscription()
            .then((subscription) => {
              console.log("Subscription", subscription)
              if (!subscription) {
                swReg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: this.publicKey
                })
                .then((subscription) => {
                 this.sendSubscriptionToServer(subscription, userId);
                  })
                .catch((err) => {
                  console.log('Failed to subscribe the user: ', err);
                })
              } else {
                this.sendSubscriptionToServer(subscription)
              }
            });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  },
  sendSubscriptionToServer(subscription, userId) {
    const target = JSON.parse(JSON.stringify(subscription))
    const body = { endpoint: target.endpoint, ...target.keys }
    body.payload = {
      appName: this.name,
      publicKey: this.publicKey
    }
    console.log("body", body)
    return fetch(`${this.url}/users/${userId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(jsonData => {
        console.log("yayy", jsonData)
				this.store.setItem('refresh', jsonData.data.tokens.refreshToken)
				this.store.setItem('access', jsonData.data.tokens.accessToken)
				this.store.setItem('expiry', jsonData.data.tokens.access_exp)
				return jsonData
      })
      .catch(error => {
        console.error('Failed to send subscription to server:', error);
    });
  },
  unsubscribe(userId) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        if (subscription) {
          subscription.unsubscribe().then((successful) => {
            console.log('User is unsubscribed:', successful);
            this.removeSubscriptionFromServer(subscription, userId);
          }).catch((e) => {
            console.log('Failed to unsubscribe the user:', e);
          })
        }
      })
    })
  },
  removeSubscriptionFromServer(subscription, userId) {
    const target = JSON.parse(JSON.stringify(subscription))
    const body = { endpoint: target.endpoint, ...target.keys }
    console.log("body", body)
    return fetch(`${this.url}/users/${userId}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getToken()
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(jsonData => {
        console.log('User successfully unsubscribed:', jsonData);
        return jsonData
      })
      .catch(error => {
        console.error('Failed to send subscription to server:', error);
    });
  },
  markNotificationAsRead(msg) {
    return fetch(`${this.url}/messages/${msg.data._id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getToken()
      }
    })
    .then(response => response.json())
    .then(jsonData => {
			console.log(jsonData)
      return jsonData.data
    })
    .catch(error => {
      console.error(error)
    })
  }
}

export default NotifaiClient
