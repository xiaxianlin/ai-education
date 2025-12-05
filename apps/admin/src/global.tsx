const clearCache = () => {
  if (window.caches) {
    caches
      .keys()
      .then((keys) => keys.forEach((key) => caches.delete(key)))
      .catch((e) => console.log(e));
  }
};

const { serviceWorker } = navigator;
if (serviceWorker.getRegistrations) {
  serviceWorker.getRegistrations().then((sws) => {
    sws.forEach((sw) => {
      sw.unregister();
    });
  });
}
serviceWorker.getRegistration().then((sw) => {
  if (sw) sw.unregister();
});

clearCache();
