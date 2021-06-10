var bluetoothDevice;
var pressionLevelCharacteristic;
var tareCharacteristic;
var pressionCapteur_1;
var pressionCapteur_2;
const datalist = new Array();
const datalist_2= new Array();
var datacsv= new Array();
var flag=true;
let orientation = [0, 0, 0];
let quaternion = [1, 0, 0, 0];
let calibration = [0, 0, 0, 0];
var qx = 0;
var qy= 0;
var qz = 0;
var qw=0;
const canvas = document.querySelector('#canvas');
var myChar;
const labels= [];
var data;
let taille;



var g = new JustGage({
id: "gauge",
value: 0,
min: -1800,
max: 10000,
title: "Pression capteur 1"
});
	
	

var j = new JustGage({
	id: "gauge2",
	value: 0,
	min: -1800,
	max: 100000,
	title: "Pression capteur 1"
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
function storedata_csv(fich,a,b,c,d,e,f,g) {
	fich.push(a);
	fich.push(b);
	fich.push(c);
	fich.push(d);
	fich.push(e);
	fich.push(f);
	fich.push(g);
	fich.push('\n');		
}

	var j = new JustGage({
		id: "gauge2",
		value: 0,
		min: -1800,
		max: 100000,
		title: "Pression capteur 2"
		});
		
	function update(j,cap) {
		j.refresh(cap)
	}
		
	function storedata(fich_1,fich_2,a,b) {
		fich_1.push(a);
		fich_2.push(b);		
	}
	function storedata_csv(fich,a,b,c,d,e,f) {
		fich.push(a);
		fich.push(b);
		fich.push(c);
		fich.push(d);
		fich.push(e);
		fich.push(f);
		fich.push('\n');		
	}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////   Bluetooth Communication     /////////////////////////////////////////////////////


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
	return server.getPrimaryService('00001523-1212-efde-1523-785feabcd123');
  })
  .then(service=> {
	  log('Getting Characteristics...');
	  return service.getCharacteristics();
  })
  .then(characteristics =>{
	  let queue = Promise.resolve();
let decoder = new TextDecoder('utf-8');
characteristics.forEach(characteristic => {
  switch (characteristic.uuid) {

	case BluetoothUUID.getCharacteristic('00001524-1212-efde-1523-785feabcd123'):
	  queue = queue.then(_ => {
		pressionLevelCharacteristic = characteristic;
		pressionLevelCharacteristic.addEventListener('characteristicvaluechanged',
		handlePressionLevelChanged);
		document.querySelector('#startNotifications').disabled = false;
		document.querySelector('#stopNotifications').disabled = true;
	  });*/
	}

	/* This function will be called when `readValue` resolves and
	 * characteristic value changes since `characteristicvaluechanged` event
	 * listener has been added. */
	function handlePressionLevelChanged(event) {
	  pressionCapteur_1 = event.target.value.getInt16(0)*10;
	  pressionCapteur_2 = event.target.value.getInt16(2)*10;
	  qx = (event.target.value.getInt16(4))/10000;
	  qy = (event.target.value.getInt16(6))/10000;
	  qz = (event.target.value.getInt16(8))/10000;
	  qw = (event.target.value.getInt16(10))/10000;
	  //log('> Pression Capteur 1 = ' + pressionCapteur_1 + ' Pa');
	  //log('> Pression Capteur 2 = ' + pressionCapteur_2 + ' Pa');
	  //log('> Position x = ' + accelero_x + ' m.s-2');
	  //log('> Position y = ' + accelero_y + ' m.s-2');
	  //log('> Position z = ' + accelero_z + ' m.s-2');
	  update(g,pressionCapteur_1);
	  update(j,pressionCapteur_2);
	  storedata(datalist,datalist_2,pressionCapteur_1,pressionCapteur_2);
	  storedata_csv(datacsv,pressionCapteur_1,pressionCapteur_2,qx,qy,qz,qw);//accelero_x,accelero_y,accelero_z);
	  //log('> data = ' + datalist );
		//roll = Math.atan(accelero_y/Math.sqrt((accelero_x*accelero_x)+(accelero_z*accelero_z)))*180/Math.PI;//rotation X
		//pitch = Math.atan(-1*accelero_x/Math.sqrt((accelero_y*accelero_y)+(accelero_z*accelero_z)))*180/Math.PI;// rotation y
		//yaw =  Math.atan(((mag_y * Math.cos(roll)) - (mag_z * Math.sin(roll)))/((mag_x * Math.cos(pitch))+(mag_y * Math.sin(roll)*Math.sin(pitch)) + (mag_z * Math.cos(roll) * Math.sin(pitch))))*180/Math.PI;
	//log('>Roll = ' + qx );
	//log('> Pitch = ' + qy );	

	document.documentElement.style
    .setProperty('--Rotate_x', qx);
	document.documentElement.style
    .setProperty('--Rotate_y', qy);
	//log('>Roll = ' + qx );
	//log('> Pitch = ' + qy );
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
	  break;

	case BluetoothUUID.getCharacteristic('00001525-1212-efde-1523-785feabcd123'):
	  queue = queue.then(_ => {
		log('Writing Tare Characteristic...');
		tareCharacteristic=characteristic;
		tareCharacteristic.addEventListener('click',tareOnClick);
	  });
	  break;
	default: log('> Unknown Characteristic: ' + characteristic.uuid);
  }
});
return queue;
})
}

/* This function will be called when `readValue` resolves and
 * characteristic value changes since `characteristicvaluechanged` event
 * listener has been added. */
function handlePressionLevelChanged(event) {
  pressionCapteur_1 = event.target.value.getInt16(0);
  pressionCapteur_2 = event.target.value.getInt16(2);
  qx = (event.target.value.getInt16(4))/10000;
  qy = (event.target.value.getInt16(6))/10000;
  qz = (event.target.value.getInt16(8))/10000;
  qw = (event.target.value.getInt16(10))/10000;
  //log('> Pression Capteur 1 = ' + pressionCapteur_1 + ' Pa');
  //log('> Pression Capteur 2 = ' + pressionCapteur_2 + ' Pa');
  update(g,pressionCapteur_1);
  update(j,pressionCapteur_2);
  if (datalist == undefined) {
	  taille =0;
  }
  else {
	  taille = Math.round((0.1 * datalist.length)*10)/10;
  }
  labels.push(taille);
  storedata(datalist,datalist_2,pressionCapteur_1,pressionCapteur_2);
  storedata_csv(datacsv,pressionCapteur_1,pressionCapteur_2,qx,qy,qz,qw, taille);//accelero_x,accelero_y,accelero_z);	

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
		var header = "vide,Capteur 1,Capteur 2,qx,qy,qz,qw,x\n";
		var myCsv = header + tab;//"Capteur 1;Capteur 2;Accelerometre x;Accelerometre y;Accelerometre z\nval1;val2;val3;val4;val5";

		window.open('data:text/csv;charset=utf-8,' + escape(myCsv));
	}
	function exportToCsv() {
			var tab = datacsv.toString();
            var header = "vide,Capteur 1,Capteur 2,qx,qy,qz,qw\n";
			var myCsv = header + tab;

var button = document.getElementById('Resultat');
button.addEventListener('click', exportToCsv);



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////       Tracé du graph    ////////////////////////////////////////////////////////////////
var str = new Array();
function update_graph() {
	myChart.update()
}

data = {
	labels: labels,
	datasets: [{
		label: 'Capteur 1',
		backgroundColor: 'rgb(255, 99, 132)',
		borderColor: 'rgb(255, 99, 132)',
		data: datalist,
		hidden : true,
	},
	{
		label: 'Capteur 2 ',
		backgroundColor: 'rgb(66, 201, 255)',
		borderColor: 'rgb(66, 201, 255)',
		data: datalist_2,
		hidden :true,
	
	
	//////////////////////////////////////////////// Tracé du graph//////////////////////////////////////////////
	var str = new Array();
	function tracegraph() {
		for (let i = 0; i <= datalist.length; i++) {
			str.push(0.1*i);
		}
		//var chaine = str.toString();
		//var words = chaine.split(',');
		labels = str;
				data = {
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
				responsive: true,
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
	}]
};
var config = {
	type: 'line',
	data,
	options: {
		responsive: true,
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
		};

	myChart = new Chart(
	document.getElementById('myChart'),
	config
	);
		
		
		log('> data = ' + datalist.length );
	}

		
	var button = document.getElementById('tracer');
    button.addEventListener('click', tracegraph);
	
	function AddDataC1() {
		myChart.data.labels.push(labels);
		myChart.data.datasets.forEach((datalist) => {
			dataset.data.push(datalist);
		});
		myChart.update();
	}
	
	
	function AddDataC2() {
		myChart.data.labels.push(labels);
		myChart.data.datasets.forEach((datalist) => {
			dataset.data.push(datalist_2);
		});
		myChart.update();
	}
	
	function RemoveData() {
		myChart.data.labels.pop();
		myChart.data.datasets.forEach((datalist) => {
			dataset.data.pop();
		});
		myChart.update();
	}
	
	var button = document.getElementById('Add_data_C1');
    button.addEventListener('click', AddDataC1);
	
	var button = document.getElementById('Add_data_C2');
    button.addEventListener('click', AddDataC2);

		}

	
	}
};


	var button = document.getElementById('tare');
	//button.addEventListener('click', tareClick);
	
	function Reset_Graph() {
		datalist.length=0;
		datalist_2.length=0;
		log('Reset done');
		log('datalist: ' + datalist );
		
	}
	
	var button = document.getElementById('reset_graph');
    button.addEventListener('click', Reset_Graph);
myChart = new Chart(
document.getElementById('myChart'),
config
);
var button = document.getElementById('update_graph');
button.addEventListener('click', update_graph);

function AddDataC1() {
	data.datasets[0].hidden = false;
	myChart.update();

}

function AddDataC2() {
	data.datasets[1].hidden = false;
	myChart.update();
}
	
function RemoveData() {
	data.datasets[0].hidden = true;
	data.datasets[1].hidden = true;
	myChart.update();
}
function Remove_C1() {
	data.datasets[0].hidden = true;
	myChart.update();
}
function Remove_C2() {
	data.datasets[1].hidden = true;
	myChart.update();
}

var button = document.getElementById('Add_data_C1');
button.addEventListener('click', AddDataC1);

var button = document.getElementById('Add_data_C2');
button.addEventListener('click', AddDataC2);

var button = document.getElementById('Remove_Data');
button.addEventListener('click', RemoveData);

var button = document.getElementById('Remove_C1');
button.addEventListener('click', Remove_C1);

var button = document.getElementById('Remove_C2');
button.addEventListener('click', Remove_C2);

function tareOnClick(){
	
	log('Tare done');
	let tarage = Uint8Array.of(1);
	return tareCharacteristic.writeValue(tarage);
}

var button = document.getElementById('tare');



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////       Tracé 3D       //////////////////////////////////////////////////////////////


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
    //const webGLnotSupported = document.getElementById('webGLnotSupported');
    //webGLnotSupported.classList.add('hidden');
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
/*
const material = new THREE.MeshPhysicalMaterial({
    color: 0xb2ffc8,
    envMap: envTexture,
    metalness: .25,
    roughness: 0.1,
    transparent: true,
    transmission: 1.0,
    side: THREE.DoubleSide,
    clearcoat: 1.0,
    clearcoatRoughness: .25
});

const loader = new STLLoader()
loader.load(
    'C:\Users\Vincent Gaultier\Documents\Web_BLE\forceps_12.stl',
    function (geometry) {
        const mesh = new THREE.Mesh(geometry, material)
		bunny = mesh;
        scene.add(bunny)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    (error) => {
        console.log(error);
    }
);*/

{
	//const scene = new THREE.Scene();
	
	var cubeGeometry = new THREE.BoxGeometry(12, 8,8);
	const material = new THREE.MeshBasicMaterial({ color:0xffffff, vertexColors: THREE.FaceColors });
	const cube = new THREE.Mesh( cubeGeometry, material );
	cube.geometry.faces[ 5 ].color.setHex( 0x00ffff );
	cube.geometry.faces[ 4 ].color.setHex( 0x00ffff );
	cube.geometry.faces[ 6 ].color.setHex( 0x00ffff );
	cube.geometry.faces[ 7 ].color.setHex( 0x00ffff );
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
    
/*	
      bunny.rotation.x = THREE.Math.degToRad(pitch);//360 - orientation[2]);
      bunny.rotation.y = THREE.Math.degToRad(yaw);//orientation[0]);
      bunny.rotation.z = THREE.Math.degToRad(roll);//orientation[1]);
   */

	let rotObjectMatrix = new THREE.Matrix4();
    let rotationQuaternion = new THREE.Quaternion(qz, qy, qw,qx);//quaternion[1], quaternion[3], -1 * quaternion[2], quaternion[0]);
    rotObjectMatrix.makeRotationFromQuaternion(rotationQuaternion);
    bunny.quaternion.setFromRotationMatrix(rotObjectMatrix);
	
  }

  renderer.render(scene, camera);
  //updateCalibration();
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
	

	
	
	
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////// Button listener //////////////////////////////////////////////////////////////

function OrientationVisible() {
	
    oriente.style.display = "none";
	trace.style.display = "flex";
	document.querySelector('#orientation').disabled = true;
	document.querySelector('#graphique').disabled = false;
  
}
	
function GraphVisible() {
    trace.style.display = "none";
	oriente.style.display = "block";
	document.querySelector('#graphique').disabled = true;
	document.querySelector('#orientation').disabled = false;

}


let oriente = document.getElementById("oriented_canvas")
var button = document.getElementById('orientation');
button.addEventListener('click', OrientationVisible);

let trace = document.getElementById("graph_pressure")
var button = document.getElementById('graphique');
button.addEventListener('click', GraphVisible);
	