document.querySelector('#readPressionLevel').addEventListener('click', function() {
    if (isWebBluetoothEnabled()) {
      onReadPressionLevelButtonClick();
    }
  });

  document.querySelector('#startNotifications').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) {
      onStartNotificationsButtonClick();
    }
  });

  document.querySelector('#stopNotifications').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) {
      onStopNotificationsButtonClick();
    }
  });

  document.querySelector('#reset').addEventListener('click', function(event) {
    if (isWebBluetoothEnabled()) {
      ChromeSamples.clearLog();
      onResetButtonClick();
    }
  });