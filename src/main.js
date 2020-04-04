import * as THREE from 'three';
const Pipe = require('./pipe.js');

const chatIntegration = require('./chat.js');

let pipeMap = new Map();

const globalConfig = {
	emoteScale: 2,
	areaSize: 20,
	straightness: 40*2,
	pipeWidth: 0.5,
	pipeLength: 1/2,
	cameraDistance: 25,
	cameraNear: 5,
	cameraFar: 1000,

	minPipes: 1,
	maxPipes: 6,
}

const plane_geometry = new THREE.PlaneBufferGeometry(globalConfig.emoteScale*globalConfig.pipeWidth, globalConfig.emoteScale*globalConfig.pipeWidth);

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

		const numberOfPipes = Math.random() * (globalConfig.maxPipes-globalConfig.minPipes) + globalConfig.minPipes;
		for (let index = 0; index < numberOfPipes; index++) {
			pipes.push(new Pipe(scene, { 
				map: pipeMap, 
				tickDistance: globalConfig.pipeLength,
				pipeWidth: globalConfig.pipeWidth,
				chanceOfStraight: globalConfig.straightness, 
			}));
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
				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					if (emote) {
						if (!emote.sprite) {
							const emoteOffset = globalConfig.pipeWidth + globalConfig.emoteScale/2;

							emote.sprite = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({color: 0xffffff}));

							emote.sprite.position.x = emotes.x;
							emote.sprite.position.y = emotes.y;
							emote.sprite.position.z = emotes.z;

							if (emotes.direction === 0 || emotes.direction === 1) {
								emote.sprite.position.x += 0;
								emote.sprite.position.y += emoteOffset;
								emote.sprite.position.z += 0;

								emote.sprite.rotation.x = Math.PI/2;
								emote.sprite.rotation.y = 0;
								emote.sprite.rotation.z = 0;

								emote.sprite.position.x += i*globalConfig.emoteScale;
								emote.sprite.position.z -= i*globalConfig.emoteScale;
							}
							if (emotes.direction === 2 || emotes.direction === 3) {
								emote.sprite.position.x += 0;
								emote.sprite.position.y += 0;
								emote.sprite.position.z += emoteOffset;
								
								emote.sprite.position.y += i*globalConfig.emoteScale;

								emote.sprite.rotation.x = 0; //Math.PI/2;
								emote.sprite.rotation.y = Math.PI/2;
								emote.sprite.rotation.z = Math.PI/2;
							}
							if (emotes.direction === 4 || emotes.direction === 5) {
								emote.sprite.position.x += 0;
								emote.sprite.position.y += emoteOffset;
								emote.sprite.position.z += 0;

								emote.sprite.position.x += i*globalConfig.emoteScale;
								emote.sprite.position.z -= i*globalConfig.emoteScale;

								emote.sprite.rotation.x = Math.PI/2;
								emote.sprite.rotation.y = 0;
								emote.sprite.rotation.z = 0;
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