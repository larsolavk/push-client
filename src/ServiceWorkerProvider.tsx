import React, { useState, useEffect } from 'react';

interface ServiceWorkerContextProps {
  initialized: boolean;
  pushSubscription?: string;
  subscribeToPushAsync?: () => Promise<void>;
}

export const ServiceWorkerContext = React.createContext<
  ServiceWorkerContextProps
>({
  initialized: false,
});

const urlBase64ToUint8Array = (base64String: string) => {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const ServiceWorkerProvider: React.FC = ({ children }) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [pushSubscription, setPushSubscription] = useState<string>();
  const sw = navigator.serviceWorker;

  const subscribeToPush = async (
    registration: ServiceWorkerRegistration
  ): Promise<void> => {
    try {
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BABGnN-h9V1WPC6tpJq2n1bTATYozc-LbA2EkGcM8ntvk5xN1I_WwwSiL8u7tTTdxZ_9lfiQVKwJW4fTiqZVHVg'
        ),
      });

      console.log('PushSubscription', JSON.stringify(pushSubscription));
      setPushSubscription(JSON.stringify(pushSubscription));
    } catch (err) {
      console.error('En feil oppsto ved subscribe to push', err);
    }
  };

  const subscribeToPushAsync = async (): Promise<void> => {
    try {
      var registration = await sw.ready;
      return subscribeToPush(registration);
    } catch (err) {
      console.error(
        'subscribeToPushAsync: En feil oppsto ved subscribe to push',
        err
      );
    }
  };

  useEffect(() => {
    if (!sw) {
      console.log('Ingen serviceworker');
      return;
    }

    console.log('Init ServiceWorkerProvider...');
    sw.ready.then((registration) => {
      console.log('sw ready');

      //setState((s) => { return {...s, initialized: true}})
      sw.onmessage = (event) => {
        console.log('sw.onmessage Handler', event);
        if (!event?.data?.type) return;

        switch (event.data.type) {
          case 'INITIALIZED':
            setInitialized(true);
            break;
        }
      };

      if (Notification.permission === 'granted') {
        subscribeToPush(registration);
      }
    });

    sw.controller?.postMessage({
      type: 'INIT',
    });
  }, [sw, setInitialized]);

  return (
    <ServiceWorkerContext.Provider
      value={{ initialized, pushSubscription, subscribeToPushAsync }}
    >
      {children}
    </ServiceWorkerContext.Provider>
  );
};

export default ServiceWorkerProvider;
