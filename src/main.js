import * as THREE from 'three';
import Chat from 'twitch-chat-emotes';

let channels = ['moonmoon'];
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

const ChatInstance = new Chat({
	channels,
	duplicateEmoteLimit: 1,
	duplicateEmoteLimit_pleb: 0,
})

const emoteTextures = {};
const pendingEmoteArray = [];
ChatInstance.on("emotes", (e) => {
	const output = { emotes: [] };
	for (let index = 0; index < e.emotes.length; index++) {
		const emote = e.emotes[index];
		if (!emoteTextures[emote.material.id]) {
			emoteTextures[emote.material.id] = new THREE.CanvasTexture(emote.material.canvas);
			emoteTextures[emote.material.id].anisotropy = 16;
			emoteTextures[emote.material.id].magFilter = THREE.LinearMipmapLinearFilter;
			emoteTextures[emote.material.id].minFilter = THREE.LinearMipmapLinearFilter;
		}
		emote.texture = emoteTextures[emote.material.id];
		output.emotes.push(emote);
	}
	pendingEmoteArray.push(output);
})


const Pipe = require('./pipe.js');



let pipeMap = {};

const globalConfig = {
	emoteScale: 2,
	areaSize: 15,
	straightness: 40 * 2,
	pipeWidth: 0.5,
	pipeLength: 0.4,
	cameraDistance: 25,
	cameraNear: 5,
	cameraFar: 1000,

	emotetimescale: 0.25,

	minPipes: 1,
	maxPipes: 6,
}

const plane_geometry = new THREE.PlaneBufferGeometry(globalConfig.emoteScale * globalConfig.pipeWidth, globalConfig.emoteScale * globalConfig.pipeWidth);
//const plane_geometry = new THREE.SphereBufferGeometry(globalConfig.pipeWidth/4, 20, 20);

window.addEventListener('DOMContentLoaded', () => {
	let camera, scene, renderer;
	let pipes = [];

	init();
	draw();

	function init() {
		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, globalConfig.cameraNear, globalConfig.cameraFar);
		camera.position.z = globalConfig.cameraDistance;
		camera.position.x = globalConfig.cameraDistance;
		camera.lookAt(0, 0, 0);

		scene = new THREE.Scene();

		const light = new THREE.AmbientLight(0x555555);
		scene.add(light);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(0, 100, 0.25);


		scene.add(directionalLight);

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		})
		document.body.appendChild(renderer.domElement);

		const numberOfPipes = Math.random() * (globalConfig.maxPipes - globalConfig.minPipes) + globalConfig.minPipes;
		for (let index = 0; index < numberOfPipes; index++) {
			pipes.push(new Pipe(scene, {
				map: pipeMap,
				tickDistance: globalConfig.pipeLength,
				pipeWidth: globalConfig.pipeWidth,
				chanceOfStraight: globalConfig.straightness,
				tickOffset: index / numberOfPipes,
			}));
		}
	}

	let lastFrame = Date.now();
	function draw() {
		requestAnimationFrame(draw);
		const delta = (Date.now() - lastFrame) / 1000;
		lastFrame = Date.now();

		for (const key in emoteTextures) {
			if (emoteTextures.hasOwnProperty(key)) {
				const element = emoteTextures[key];
				element.needsUpdate = true;
			}
		}

		for (let index = 0; index < pipes.length; index++) {
			const pipe = pipes[index];
			pipe.tick();
		}

		for (let index = 0; index < pendingEmoteArray.length; index++) {
			const emotes = pendingEmoteArray[index];


			if (!emotes.progress) {
				emotes.progress = 0;
				const key = getRandomKey(pipeMap);
				const direction = pipeMap[key][1];
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
				pendingEmoteArray.splice(index, 1);
			} else {
				emotes.progress += globalConfig.emotetimescale * delta;
				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					if (!emote.sprite) {
						const emoteOffset = globalConfig.pipeWidth + globalConfig.emoteScale / 2;

						emote.sprite = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({ map: emote.texture, transparent: true }));

						emote.sprite.position.x = emotes.x;
						emote.sprite.position.y = emotes.y;
						emote.sprite.position.z = emotes.z;

						if (emotes.direction === 0 || emotes.direction === 1) {
							emote.sprite.position.x += 0;
							emote.sprite.position.y += emoteOffset;
							emote.sprite.position.z += 0;

							emote.sprite.rotation.x = 0;
							emote.sprite.rotation.y = 0;
							emote.sprite.rotation.z = 0;

							emote.sprite.position.x += i * globalConfig.emoteScale;
						} else if (emotes.direction === 2 || emotes.direction === 3) {
							emote.sprite.position.x += 0;
							emote.sprite.position.y += 0;
							emote.sprite.position.z += emoteOffset;

							emote.sprite.position.y += i * globalConfig.emoteScale;

							emote.sprite.rotation.x = 0; //Math.PI/2;
							emote.sprite.rotation.y = Math.PI / 2;
							emote.sprite.rotation.z = Math.PI / 2;
						} else if (emotes.direction === 4 || emotes.direction === 5) {
							emote.sprite.position.x += 0;
							emote.sprite.position.y += emoteOffset;
							emote.sprite.position.z += 0;

							emote.sprite.rotation.x = 0;
							emote.sprite.rotation.y = Math.PI / 2;
							emote.sprite.rotation.z = 0;

							emote.sprite.position.z += i * globalConfig.emoteScale;
						}

						emote.sprite.scale.x = globalConfig.emoteScale;
						emote.sprite.scale.y = globalConfig.emoteScale;
						emote.sprite.scale.z = globalConfig.emoteScale;

						scene.add(emote.sprite);
						//emote.sprite.lookAt(camera.position);
					}

				}
			}
		}

		renderer.render(scene, camera);
	}
})



function getRandomKey(obj) {
	var keys = Object.keys(obj);
	return keys[keys.length * Math.random() << 0];
}