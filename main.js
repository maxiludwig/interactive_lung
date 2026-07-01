import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

import YAML from 'https://cdn.skypack.dev/js-yaml';

/* Which model is shown, and how its parts are named/textured/colored, is
   read from Config.yml at runtime -- swap the model by editing that file
   instead of this script. */
const CONFIG_PATH = './Config.yml';

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
    const aspect = window.innerWidth / window.innerHeight;
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

    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    this._mixers = [];
    this._previousRAF = null;

    this._LoadModel();
    this._RAF();
  }

  /* Loads Config.yml, then the model it points to, and builds one toggle
     button per configured part. */
  async _LoadModel() {
    try {
      const response = await fetch(CONFIG_PATH);
      const yamlText = await response.text();
      const config = YAML.load(yamlText);
      const modelConfig = config[0];

      const loader = new GLTFLoader();
      loader.load(modelConfig.path, (gltf) => {
        const model = gltf.scene;
        this._scene.add(model);

        const visibilityMap = {};
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50px';
        container.style.right = '10px';
        container.style.width = '200px';
        container.style.height = 'calc(100vh - 60px)';
        container.style.overflowY = 'scroll';
        document.body.appendChild(container);

        Object.keys(modelConfig.Parts).forEach((partKey) => {
          const partConfig = modelConfig.Parts[partKey];
          const partName = partConfig.name;
          const node = model.getObjectByName(partName);
          if (!node) {
            return;
          }

          // The model ships without authored normals (stripped to keep the
          // file small); recompute smooth shading normals in-browser.
          if (node.geometry && !node.geometry.attributes.normal) {
            node.geometry.computeVertexNormals();
          }

          if (partConfig.texture) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(partConfig.texture, (newTexture) => {
              newTexture.encoding = THREE.sRGBEncoding;
              newTexture.flipY = false;
              newTexture.wrapS = THREE.RepeatWrapping;
              newTexture.wrapT = THREE.RepeatWrapping;
              node.material = new THREE.MeshStandardMaterial({map: newTexture});
              if (partConfig.color) {
                node.material.color.setRGB(
                  partConfig.color.r / 255, partConfig.color.g / 255, partConfig.color.b / 255);
              }
              node.material.needsUpdate = true;
            });
          } else if (partConfig.color) {
            node.material = new THREE.MeshStandardMaterial();
            node.material.color.setRGB(
              partConfig.color.r / 255, partConfig.color.g / 255, partConfig.color.b / 255);
            node.material.needsUpdate = true;
          }

          visibilityMap[partName] = true;

          const button = document.createElement('button');
          button.textContent = partName;
          button.style.backgroundColor = '#a0e092';
          button.style.color = 'white';
          button.style.border = 'none';
          button.style.borderRadius = '20px';
          button.style.padding = '10px';
          button.style.width = '150px';
          button.style.marginBottom = '10px';
          container.appendChild(button);

          button.addEventListener('click', () => {
            visibilityMap[partName] = !visibilityMap[partName];
            node.visible = visibilityMap[partName];
            button.style.backgroundColor = visibilityMap[partName] ? '#a0e092' : '#a5c7d4';
          });

          node.visible = true;
        });

        const toggleContainerButton = document.createElement('button');
        toggleContainerButton.textContent = 'Hide Container';
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

        const scale = 60;
        model.scale.set(scale, scale, scale);
        model.position.set(0, 60, 0);
      });
    } catch (error) {
      console.error('Error loading model configuration:', error);
    }
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
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new LoadModelDemo();
});
