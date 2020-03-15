import * as THREE from 'three';
const Pipe = require('./pipe.js');

const chatIntegration = require('./chat.js');

const pipeMap = new Map();

const globalConfig = {
	emoteScale: 7,
	areaSize: 100,
}

window.addEventListener('DOMContentLoaded', () => {
	let camera, scene, renderer;
	let pipes = [];

	init();
	draw();

	function init() {
		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 10, 1000);
		camera.position.z = 100;
		camera.position.x = 100;
		camera.lookAt(0, 0, 0);

		scene = new THREE.Scene();

		const light = new THREE.AmbientLight(0x555555); // soft white light
		scene.add(light);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(0, 100, 0.25);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = Math.pow(2, 13);  // default
		directionalLight.shadow.mapSize.height = Math.pow(2, 13); // default
		directionalLight.shadow.camera.near = -100;
		directionalLight.shadow.camera.far = 1000;

		const shadowCameraSize = 300;
		directionalLight.shadow.camera.left = -shadowCameraSize;
		directionalLight.shadow.camera.bottom = -shadowCameraSize;
		directionalLight.shadow.camera.top = shadowCameraSize;
		directionalLight.shadow.camera.right = shadowCameraSize;


		scene.add(directionalLight);

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setSize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		})
		document.body.appendChild(renderer.domElement);

		const numberOfPipes = Math.random() * 4 + 1;
		for (let index = 0; index < numberOfPipes; index++) {
			pipes.push(new Pipe(scene, { map: pipeMap }));
		}
	}

	function draw() {
		requestAnimationFrame(draw);

		for (let index = 0; index < pipes.length; index++) {
			const pipe = pipes[index];
			pipe.tick();
		}

		for (let index = 0; index < chatIntegration.emotes.length; index++) {
			const emotes = chatIntegration.emotes[index];

			if (emotes.progress === 0) {
				const key = getRandomKey(pipeMap);
				const direction = pipeMap.get(key);
				const coord = key.split(',');
				for (let index = 0; index < coord.length; index++) {
					coord[index] = Number(coord[index]);
				};

				emotes.x = coord[0];
				emotes.y = coord[1];
				emotes.z = coord[2];
				emotes.direction = direction;
			}

			if (emotes.progress > 1) {
				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					scene.remove(emote.sprite);
				}
				chatIntegration.emotes.splice(index, 1);
			} else {
				emotes.progress += 0.001;

				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					if (emote) {
						if (!emote.sprite) {
							emote.sprite = (emotes.direction === 2 || emotes.direction === 3) ?
								new THREE.Sprite(emote.material.rot_material) :
								new THREE.Sprite(emote.material.material);

							emote.sprite.position.x = emotes.x;
							emote.sprite.position.y = emotes.y;
							emote.sprite.position.z = emotes.z;

							if (emotes.direction === 0 || emotes.direction === 1) {
								emote.sprite.position.x += 0;
								emote.sprite.position.y += 5;
								emote.sprite.position.z += 0;

								emote.sprite.position.x += i*globalConfig.emoteScale;
								emote.sprite.position.z -= i*globalConfig.emoteScale;
							}
							if (emotes.direction === 2 || emotes.direction === 3) {
								emote.sprite.position.x -= 4;
								emote.sprite.position.y += 0;
								emote.sprite.position.z += 4;
								
								emote.sprite.position.y += i*globalConfig.emoteScale;

								emote.sprite.rotation.z += Math.PI/2;
							}
							if (emotes.direction === 4 || emotes.direction === 5) {
								emote.sprite.position.x += 0;
								emote.sprite.position.y += 5;
								emote.sprite.position.z += 0;
								
								emote.sprite.position.x += i*globalConfig.emoteScale;
								emote.sprite.position.z -= i*globalConfig.emoteScale;
							}

							emote.sprite.scale.x = globalConfig.emoteScale;
							emote.sprite.scale.y = globalConfig.emoteScale;
							emote.sprite.scale.z = globalConfig.emoteScale;

							scene.add(emote.sprite);
							emote.sprite.lookAt(camera.position);
						}

					}

				}
			}
		}

		renderer.render(scene, camera);
	}
})

/*
setTimeout(()=>{
	window.location.reload();
}, 10000);*/



function getRandomKey(collection) {
    let index = Math.floor(Math.random() * collection.size);
    let cntr = 0;
    for (let key of collection.keys()) {
        if (cntr++ === index) {
            return key;
        }
    }
}