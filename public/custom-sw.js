self.addEventListener('message', (event) => {
  console.log('custom-sw got message', event);
  if (event.data && event.data.type === 'INIT') {
    // Select who we want to respond to
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: 'window',
      })
      .then((clients) => {
        if (clients && clients.length) {
          // Send a response - the clients
          // array is ordered by last focused
          clients[0].postMessage({
            type: 'INITIALIZED',
          });
        }
      });
  }
});

self.addEventListener('push', (event) => {
  console.log('Push received', event);

  const data = event.data.json();
  console.log('Push received (json)', data);
  const options = {
    body: data.body,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
