self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  const data = event.data.json();
  console.log("JSON Data", data)
  const options = {
    body: data.body,
    ...(data.icon && { icon: data.icon }),
    ...(data.badge && { badge: data.badge }),
    data: {
      ...( data.clickUrl && { url: data.clickUrl }),
      ...data.data
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Service worker event listener for notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data.url;
  if (url) {
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
