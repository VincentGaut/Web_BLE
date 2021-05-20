	var bluetoothDevice;
	var pressionLevelCharacteristic;
	var pressionCapteur_1;
	var pressionCapteur_2;
	var accelero_x;
	var accelero_y;
	var accelero_z;
	var datalist= new Array();
	var datalist_2= new Array();
	var datacsv= new Array();
	
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
		
	function storedata(fich_1,fich_2,a,b) {
		fich_1.push(a);
		fich_2.push(b);		
	}
	function storedata_csv(fich,a,b,c,d,e) {
		fich.push(a);
		fich.push(b);
		fich.push(c);
		fich.push(d);
		fich.push(e);
		fich.push('\n');		
	}
	
	function onReadPressionLevelButtonClick() {
	  return (bluetoothDevice ? Promise.resolve() : requestDevice())
	  .then(connectDeviceAndCacheCharacteristics)
	  .then(_ => {
		log('Reading Pression Level...');
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
	  storedata(datalist,datalist_2,pressionCapteur_1,pressionCapteur_2);
	  storedata_csv(datacsv,pressionCapteur_1,pressionCapteur_2,accelero_x,accelero_y,accelero_z);
	  //log('> data = ' + datalist );
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
	function exportToCsv() {
			var tab = datacsv.toString();
            var header = "Capteur 1;Capteur 2;Accelerometre x;Accelerometre y;Accelerometre z\n";
			var myCsv = header + tab;//"Capteur 1;Capteur 2;Accelerometre x;Accelerometre y;Accelerometre z\nval1;val2;val3;val4;val5";

            window.open('data:text/csv;charset=utf-8,' + escape(myCsv));
        }

        var button = document.getElementById('Resultat');
        button.addEventListener('click', exportToCsv);
		//var btn = document.querySelector('.favorite styled');

	
	
	//////////////////////////////////////////////// Tracé du graph//////////////////////////////////////////////
	var str = new Array();
	function tracegraph() {
		for (let i = 0; i <= datalist.length; i++) {
			str.push(0.1*i);
		}
		//var chaine = str.toString();
		//var words = chaine.split(',');
		var labels = str;
		var data = {
			labels: labels,
			datasets: [{
				label: 'Capteur 1',
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				data: datalist,
			},
			{
				label: 'Capteur 2 ',
				backgroundColor: 'rgb(66, 201, 255)',
				borderColor: 'rgb(66, 201, 255)',
				data: datalist_2,
			
			}]
		};
		var config = {
			type: 'line',
			data,
			options: {
				plugins: {
					title: {
						display : true,
						text : "Evolution de la pression"
					}
				},
				scales :{
					x:{
						title:{
							color: 'red',
							display:true,
							text: ' Temps (s)'
						}
					},
					y : {
						title:{
							color: 'red',
							display:true,
							text: ' Pression (Pa)'
						}
					}
				}
			
			}
		};

		var myChart = new Chart(
		document.getElementById('myChart'),
		config
		);
		
		log('> data = ' + datalist.length );
	}
	var button = document.getElementById('tracer');
    button.addEventListener('click', tracegraph);
	
	

	
  