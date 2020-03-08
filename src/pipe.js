import * as THREE from 'three';
import { STLLoader } from './STLLoader.js';

const teapot_url = require('./utah_teapot.stl');

let teapot_geometry = null;

const teapot_loader = new THREE.STLLoader();
teapot_loader.load( teapot_url, function ( geometry ) {
	console.log(geometry)
	teapot_geometry = geometry;
});

const rand = (max) => {
	if (typeof max === 'object') {
		return max[Math.floor(Math.random()*max.length)];
	} else {
		return Math.floor(Math.random()*max);
	}
}
const removeTarget = (array, target) => {
	for (let index = 0; index < array.length; index++) {
		if (array[index] == target) {
			array.splice(index, 1);
		}
	}
}

class Pipe {
	constructor (scene, config = {}) {
		this.config = Object.assign({
			color: 0x888888*Math.random()+0x888888,
			tickDistance: 7,
			pipeWidth: 2,
			pipeTickInterval: 4,
			maximumTicks: 340,
			maximumDistance: 100,
		}, config);

		this.scene = scene;

		this.pos = [
			rand(10)-5, // x
			rand(10)-5, // y
			rand(10)-5, // z
		];

		this.meshes = [];
		this.activePipe = null;
		
		this.ticks = 0;
		this.realTicks = 0;

		// x+, x-, y+, y-, z+, z-
		this.direction = rand(6);

		this.cylinder_geometry = new THREE.CylinderBufferGeometry( this.config.pipeWidth, this.config.pipeWidth, this.config.tickDistance, 12 );
		this.cylinder_material = new THREE.MeshPhongMaterial( {color: this.config.color} );
		this.cylinder_material.shininess = 100;

		this.sphere_geometry = new THREE.SphereBufferGeometry( this.config.pipeWidth*1.1, 12, 12 );
		this.sphere_geometry2 = new THREE.SphereBufferGeometry( this.config.pipeWidth*1.25, 12, 12 );
		

	}

	changeDirection () {
		// Don't go in the opposite direction
		// Don't go too far off screen

		let options = [0,1,2,3,4,5];

		for (let index = 0; index < 5; index++) {
			options.push(this.direction);
		}

		removeTarget(options, (this.direction % 2 === 0) ? this.direction + 1 : this.direction - 1 );

		for (let index = 0; index < this.pos.length; index++) {
			// x+, x-, y+, y-, z+, z-
			if (this.pos[index] >= this.config.maximumDistance) {
				removeTarget(options, index*2);
			}
			if (this.pos[index] <= -this.config.maximumDistance) {
				removeTarget(options, index*2+1);
			}
		}

		this.direction = rand(options);
	}

	tick () {
		this.ticks++;

		this.lastPos = [...this.pos];
		this.lastDirection = this.direction;

		if (this.ticks % this.config.pipeTickInterval == 0 && this.realTicks < this.config.maximumTicks) {
			this.realTicks++;
			this.changeDirection();

			this.pos[Math.floor(this.direction/2)] += (this.direction % 2 === 0) ? this.config.tickDistance : -this.config.tickDistance;

			if (this.direction === this.lastDirection && this.activePipe) {
				this.activePipe.scale.y++;
				this.activePipe.position.z = (this.config.tickDistance/2)*this.activePipe.scale.y;
			} else {
				const group = new THREE.Group();
				this.scene.add(group);

				group.position.x = this.lastPos[0];
				group.position.y = this.lastPos[1];
				group.position.z = this.lastPos[2];
				group.lookAt(this.pos[0], this.pos[1], this.pos[2]);

				const cylinder = new THREE.Mesh( this.cylinder_geometry, this.cylinder_material );
				cylinder.castShadow = true;
				cylinder.receiveShadow = true;
				this.activePipe = cylinder;
				cylinder.rotation.x += Math.PI/2;
				cylinder.position.z += this.config.tickDistance/2;
				group.add(cylinder);
				
				
				const temp_geometry = Math.random() < 0.75 ? this.sphere_geometry : this.sphere_geometry2;
				let sphere = new THREE.Mesh( (this.direction === this.lastDirection) ? this.sphere_geometry : temp_geometry, this.cylinder_material );

				if (teapot_geometry && Math.random()*1000 < 1) {
					sphere = new THREE.Mesh( teapot_geometry, this.cylinder_material );
					sphere.rotation.x = -Math.PI/2
					sphere.scale.x = 0.75;
					sphere.scale.y = 0.75;
					sphere.scale.z = 0.75;
					sphere.position.y -= this.config.pipeWidth/1.5;
				}

				sphere.castShadow = true;
				sphere.receiveShadow = true;
				sphere.position.x += this.lastPos[0];
				sphere.position.y += this.lastPos[1];
				sphere.position.z += this.lastPos[2];
				this.scene.add( sphere );
			}
		}

		if (this.realTicks > this.config.maximumTicks) {
			window.location.reload();
		}
	}
}

module.exports = Pipe;