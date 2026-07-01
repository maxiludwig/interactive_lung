import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


class LoadModelDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(180, -40, 80);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(0, 10, 10);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);
    
    light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(0, 10, -10);
    this._scene.add(light);
    
    light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(10, 10, 0);
    this._scene.add(light);
    
    light = new THREE.AmbientLight(0xFFFFFF, 0.7);
    this._scene.add(light);
    
    // const controls = new THREE.OrbitControls(this._camera, this._threejs.domElement);


  
    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      /*/'./resources/posx.jpg',
      './resources/negx.jpg',
      './resources/posy.jpg',
      './resources/negy.jpg',
      './resources/posz.jpg',
      './resources/negz.jpg',/*/
    ]);
    this._scene.background = texture;

    /*/const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);
/*/
    this._mixers = [];
    this._previousRAF = null;

    this._LoadModel();
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'girl.fbx', 'dance.fbx', new THREE.Vector3(0, -1.5, 5));
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(12, 0, -10));
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(-12, 0, -10));
    this._RAF();
  }

  _LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./resources/Model/Brain_withtextures.gltf', (gltf) => {
      const model = gltf.scene;
      const nodes = gltf.parser.json.nodes;
      const meshNames = [
        'WhiteMatterRight',
        'WhiteMatterLeft',
        'Ventricle',
        'FalxTentorium',
        'Diencephalon',
        'CerebellumWhiteRight',
        'CerebellumWhiteLeft',
        'CerebellumGrey',
        'BrainStem',
        'CortexLeft',
        'CortexRight'
      ];
  
      const visibilityMap = {}; // Stores the visibility state of each mesh
  
      for (let i = 0; i < nodes.length; i++) {
        const node = model.getObjectById(nodes[i].mesh);
        if (node && meshNames.includes(nodes[i].name)) {
          visibilityMap[nodes[i].name] = true; // Initialize all parts as visible
        }
      }
  
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '50px';
      container.style.right = '10px';
      container.style.width = '200px';
      container.style.height = 'calc(100vh - 60px)';
      container.style.overflowY = 'scroll';
      document.body.appendChild(container);
  
      meshNames.forEach((meshName) => {
        const node = model.getObjectByName(meshName);
        if (node) {
          const box = new THREE.Box3().setFromObject(node);
          const center = box.getCenter(new THREE.Vector3());
          box.getCenter(center);

          const button = document.createElement('button');
          button.textContent = meshName;
          button.style.backgroundColor = '#a5c7d4';
          button.style.color = 'white';
          button.style.border = 'none';
          button.style.borderRadius = '20px';
          button.style.padding = '10px';
          button.style.width = '150px';
          button.style.marginBottom = '10px';
          container.appendChild(button);
  
          button.addEventListener('click', () => {
            const node = model.getObjectByName(meshName);
            if (node) {
              visibilityMap[meshName] = !visibilityMap[meshName];
              node.visible = visibilityMap[meshName];
              button.style.backgroundColor = visibilityMap[meshName] ? '#a0e092' : '#a5c7d4';
            }
          });
  
      
          node.userData = { button };
          node.visible = true; // Set initial visibility of the object to true

          // Set initial button color to green
          button.style.backgroundColor = '#a0e092';
        }
      });
  
      
      const toggleContainerButton = document.createElement('button');
      toggleContainerButton.textContent = 'Toggle Container';
      toggleContainerButton.style.backgroundColor = '#a5c7d4';
      toggleContainerButton.style.color = 'white';
      toggleContainerButton.style.border = 'none';
      toggleContainerButton.style.borderRadius = '10px';
      toggleContainerButton.style.padding = '10px';
      toggleContainerButton.style.position = 'fixed';
      toggleContainerButton.style.top = '10px';
      toggleContainerButton.style.right = '10px';
      document.body.appendChild(toggleContainerButton);
  
      toggleContainerButton.addEventListener('click', () => {
        if (container.style.display === 'none') {
          container.style.display = 'block';
          toggleContainerButton.textContent = 'Hide Container';
        } else {
          container.style.display = 'none';
          toggleContainerButton.textContent = 'Show Container';
        }
      });
  
      const scale = 60; // Adjust this value as per your requirement
      model.scale.set(scale, scale, scale);
      model.position.set(0, 60, 0);
      this._scene.add(model);
    });
    
 
  }


  
  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }
      if (this._mixers.length > 0) {
        this._mixers.forEach((mixer) => {
          mixer.update(0.016);
        });
      }
      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new LoadModelDemo();
});
