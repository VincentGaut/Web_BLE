
let orientation = [0, 0, 0];
let quaternion = [1, 0, 0, 0];
let calibration = [0, 0, 0, 0];

const canvas = document.querySelector('#canvas');

const angleType = document.getElementById('angle_type');


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
	  angleType.addEventListener('change', changeAngleType);
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

async function changeAngleType() {
  saveSetting('angletype', angleType.value);
}

function loadAllSettings() {
  // Load all saved settings or defaults

  angleType.value = loadSetting('angletype', 'quaternion');

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
  light.target.position.set(-5, 0, 0);
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
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	const cube = new THREE.Mesh( geometry, material );
	bunny=cube;
	scene.add( cube );
	
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
    if (angleType.value == "euler") {
      bunny.rotation.x = THREE.Math.degToRad(360 - orientation[2]);
      bunny.rotation.y = THREE.Math.degToRad(orientation[0]);
      bunny.rotation.z = THREE.Math.degToRad(orientation[1]);
    } else {
      let rotObjectMatrix = new THREE.Matrix4();
      let rotationQuaternion = new THREE.Quaternion(quaternion[1], quaternion[3], -1 * quaternion[2], quaternion[0]);
      rotObjectMatrix.makeRotationFromQuaternion(rotationQuaternion);
      bunny.quaternion.setFromRotationMatrix(rotObjectMatrix);
    }
  }

  renderer.render(scene, camera);
  //updateCalibration();
  requestAnimationFrame(render);
}

requestAnimationFrame(render);