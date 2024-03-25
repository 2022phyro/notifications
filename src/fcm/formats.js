function configureAndroid (defaults) {
  defaults = defaults || {}
  return {
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        ...defaults
      }
    }
  }
}

function configureWebPush (defaults) {
  defaults = defaults || {}
  return {
    webpush: {
      headers: {
        Urgency: 'high'
      },
      notification: {
        ...defaults
      }
    }
  }
}

function configureApns (defaults) {
  defaults = defaults || {}
  return {
    apns: {
      headers: {
        'apns-priority': '10'
      },
      payload: {
        aps: {
          sound: 'default',
          ...defaults
        }
      }
    }
  }
}

function buildMessage (data) {
  const message = {
    ...(data.name && { name: data.name }),
    ...(data.data && { data: data.data }),
    ...(data.notification && { notification: data.notification }),
    ...configureAndroid(data.android),
    ...configureWebPush(data.webpush),
    ...configureApns(data.apns),
    ...(data.fcm_options && { fcm_options: data.fcm_options }),
    ...(data.token && { token: data.token }),
    ...(data.topic && { topic: data.topic }),
    ...(data.condition && { condition: data.condition })
  }
  return message
}

module.exports = {
  buildMessage
}
