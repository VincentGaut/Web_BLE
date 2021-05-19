	var bluetoothDevice;
	var pressionLevelCharacteristic;
	var pressionCapteur_1;
	var pressionCapteur_2;
	var accelero_x;
	var accelero_y;
	var accelero_z;
	
	var g = new JustGage({
	id: "gauge",
	value: 0,
	min: 0,
	max: 10000,
	title: "Pression capteur 1"
	});
	
	

	var j = new JustGage({
		id: "gauge2",
		value: 0,
		min: 0,
		max: 10000,
		title: "Pression capteur 2"
		});
		
	//function update() {
	//var capteur_1 = document.getElementById('pression_1').value
	//g.refresh(capteur_1)
				
	//}

	function update(j,cap) {
		j.refresh(cap)
		}

	var btn = document.querySelector('.favorite styled');


	function onReadPressionLevelButtonClick() {
	  return (bluetoothDevice ? Promise.resolve() : requestDevice())
	  .then(connectDeviceAndCacheCharacteristics)
	  .then(_ => {
		log('Reading Battery Level...');
		return pressionLevelCharacteristic.readValue();
	  })
	  .catch(error => {
		log('Argh! ' + error);
	  });
	}

	function requestDevice() {
	  log('Requesting any Bluetooth Device...');
	  return navigator.bluetooth.requestDevice({filters: [ {services :['00001523-1212-efde-1523-785feabcd123']}]})
	   // filters: [...] <- Prefer filters to save energy & show relevant devices.
		  //acceptAllDevices: true,
		  //optionalServices: ['battery_service']})
	  .then(device => {
		bluetoothDevice = device;
		bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
	  });
	}

	function connectDeviceAndCacheCharacteristics() {
	  if (bluetoothDevice.gatt.connected && pressionLevelCharacteristic) {
		return Promise.resolve();
	  }

	  log('Connecting to GATT Server...');
	  return bluetoothDevice.gatt.connect()
	  .then(server => {
		log('Getting Service...');
		//return server.getPrimaryServices();//'battery_service');
		return server.getPrimaryService('00001523-1212-efde-1523-785feabcd123');
	  })
	  .then(service => {
		log('Getting Characteristic...');
		//return service.getCharacteristics();//'00001524-1212-efde-1523-785feabcd123');//'battery_level');
		return service.getCharacteristic('00001524-1212-efde-1523-785feabcd123');
	  })
	  .then(characteristic => {
		pressionLevelCharacteristic = characteristic;
		pressionLevelCharacteristic.addEventListener('characteristicvaluechanged',
			handlePressionLevelChanged);
		document.querySelector('#startNotifications').disabled = false;
		document.querySelector('#stopNotifications').disabled = true;
	  });
	}

	/* This function will be called when `readValue` resolves and
	 * characteristic value changes since `characteristicvaluechanged` event
	 * listener has been added. */
	function handlePressionLevelChanged(event) {
	  pressionCapteur_1 = event.target.value.getUint16(0);
	  pressionCapteur_2 = event.target.value.getUint16(2);
	  accelero_x = event.target.value.getUint16(4);
	  accelero_y = event.target.value.getUint16(6);
	  accelero_z = event.target.value.getUint16(8);
	  //log('> Pression Capteur 1 = ' + pressionCapteur_1 + ' Pa');
	  //log('> Pression Capteur 2 = ' + pressionCapteur_2 + ' Pa');
	  //log('> Position x = ' + accelero_x + ' m.s-2');
	  //log('> Position y = ' + accelero_y + ' m.s-2');
	  //log('> Position z = ' + accelero_z + ' m.s-2');
	  update(g,pressionCapteur_1);
	  update(j,pressionCapteur_2);
	}

	function onStartNotificationsButtonClick() {
	  log('Starting Pression Level Notifications...');
	  pressionLevelCharacteristic.startNotifications()
	  .then(_ => {
		log('> Notifications started');
		document.querySelector('#startNotifications').disabled = true;
		document.querySelector('#stopNotifications').disabled = false;
	  })
	  .catch(error => {
		log('Argh! ' + error);
	  });
	}

	function onStopNotificationsButtonClick() {
	  log('Stopping Pression Level Notifications...');
	  pressionLevelCharacteristic.stopNotifications()
	  .then(_ => {
		log('> Notifications stopped');
		document.querySelector('#startNotifications').disabled = false;
		document.querySelector('#stopNotifications').disabled = true;
	  })
	  .catch(error => {
		log('Argh! ' + error);
	  });
	}

	function onResetButtonClick() {
	  if (pressionLevelCharacteristic) {
		pressionLevelCharacteristic.removeEventListener('characteristicvaluechanged',
			handlePressionLevelChanged);
		pressionLevelCharacteristic = null;
	  }
	  // Note that it doesn't disconnect device.
	  bluetoothDevice = null;
	  log('> Bluetooth Device reset');
	}

	function onDisconnected() {
	  log('> Bluetooth Device disconnected');
	  connectDeviceAndCacheCharacteristics()
	  .catch(error => {
		log('Argh! ' + error);
	  });
	}


	//btn.addEventListener('click', next_page);