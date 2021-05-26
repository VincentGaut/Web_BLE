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
	var roll=0;
	var pitch=0;
	var flag=true;
	let orientation = [0, 0, 0];
	let quaternion = [1, 0, 0, 0];
	let calibration = [0, 0, 0, 0];

	const canvas = document.querySelector('#canvas');


	
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
	  flag=false;
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
	  accelero_x = event.target.value.getInt16(4);
	  accelero_y = event.target.value.getInt16(6);
	  accelero_z = event.target.value.getInt16(8);
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
		roll = Math.atan(accelero_y/Math.sqrt((accelero_x*accelero_x)+(accelero_z*accelero_z)))*180/Math.PI;//rotation X
		pitch = Math.atan(-1*accelero_x/Math.sqrt((accelero_y*accelero_y)+(accelero_z*accelero_z)))*180/Math.PI;// rotation y
		document.documentElement.style
    .setProperty('--Rotate_x', roll);
	document.documentElement.style
    .setProperty('--Rotate_y', pitch);
	//log('>Roll = ' + roll );
	//log('> Pitch = ' + pitch );
	//get property

	getComputedStyle(document.documentElement)
    .getPropertyValue('--Rotate_x'); // returns value
	getComputedStyle(document.documentElement)
    .getPropertyValue('--Rotate_y'); // returns value
	//log('>Roll = ' + --Rotate_x );
	//log('> Pitch = ' + --Rotate_y );
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
	  flag=true;
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
            var header = "vide,Capteur 1,Capteur 2,Accelerometre x,Accelerometre y,Accelerometre z\n";
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
	
	function tareClick(){
		log('Tare done');
		
	}

	var button = document.getElementById('tare');
	button.addEventListener('click', tareClick);
	
	
	




fitToContainer(canvas);



function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}


document.addEventListener('DOMContentLoaded', () => {
	 
  if (isWebGLAvailable()) {
    const webGLnotSupported = document.getElementById('webGLnotSupported');
    webGLnotSupported.classList.add('hidden');
  }
  //loadAllSettings();
});

  
  
  
let isWebGLAvailable = function() {
  try {
    var canvas = document.createElement( 'canvas' );
    return !! (window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}






function saveSetting(setting, value) {
  window.localStorage.setItem(setting, JSON.stringify(value));
}

var bunny;

const renderer = new THREE.WebGLRenderer({canvas});

const camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.1, 100);
camera.position.set(0, 0, 30);

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');
{
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0x666666;  // black
  const intensity = 0.5;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}

{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-1,2,4);//-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}

//{
  //const objLoader = new OBJLoader();
  //objLoader.load('assets/bunny.obj', (root) => {
   // bunny = root;
    //scene.add(root);
  //});
//}
{
	//const scene = new THREE.Scene();
	var cubeGeometry = new THREE.BoxGeometry(12, 12,12);
	const material = new THREE.MeshBasicMaterial();
	const cube = new THREE.Mesh( cubeGeometry, material );
	bunny=cube;
	scene.add( bunny );
	
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (bunny != undefined) {
    
      bunny.rotation.x = THREE.Math.degToRad(pitch);//360 - orientation[2]);
      bunny.rotation.y = THREE.Math.degToRad(orientation[0]);
      bunny.rotation.z = THREE.Math.degToRad(roll);//orientation[1]);
   
  }

  renderer.render(scene, camera);
  //updateCalibration();
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
	

	