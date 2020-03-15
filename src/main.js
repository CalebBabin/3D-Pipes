import * as THREE from 'three';
const Pipe = require('./pipe.js');

const emotesArray = require('./chat.js');

const pipeMap = new Map();

const globalConfig = {
	emoteScale: 5,
	areaSize: 100,
}

window.addEventListener('DOMContentLoaded', () => {
	let camera, scene, renderer;
	let pipes = [];

	init();
	draw();

	function init() {
		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
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
			console.log('resizing', camera.aspect);
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

		for (let index = 0; index < emotesArray.length; index++) {
			const emotes = emotesArray[index];

			if (emotes.progress > 1) {
				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					scene.remove(emote.sprite);
				}
				emotesArray.splice(index, 1);
			} else {
				emotes.progress += 0.001;

				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					if (emote) {
						if (!emote.sprite) {
							emote.sprite = new THREE.Sprite(emote.material);
							emote.sprite.position.x = (emotes.x-0.5)*2*globalConfig.areaSize;
							emote.sprite.position.z = (emotes.y-0.5)*2*globalConfig.areaSize;

							emote.sprite.scale.x = globalConfig.emoteScale;
							emote.sprite.scale.y = globalConfig.emoteScale;
							emote.sprite.scale.z = globalConfig.emoteScale;

							scene.add(emote.sprite);
							console.log(emote);
						}

						emote.sprite.position.y = (emotes.progress-0.5)*2*globalConfig.areaSize*1.5;
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