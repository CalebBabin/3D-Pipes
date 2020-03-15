import * as THREE from 'three';
const gifFrames = require('gif-frames');

class GIF_Instance {
	constructor(url) {
		this.url = url;
		this.gifTiming = 10;
		this.lastFrame = Date.now();
		this.currentFrame = 0;
		this.frameData = [];

		gifFrames({ url: url, frames: 'all', outputType: 'canvas', type: 'png' })
			.then(this.setFrameData.bind(this))
			.catch(this.imageFallback.bind(this));

		this.canvas = document.createElement('canvas');
		this.canvas.width = 128;
		this.canvas.height = 128;
		this.ctx = this.canvas.getContext('2d');

		this.texture = new THREE.CanvasTexture(this.canvas);
		this.material = new THREE.SpriteMaterial({ map: this.texture, transparent: true });
		this.rot_material = new THREE.SpriteMaterial({ map: this.texture, transparent: true, rotation: Math.PI / 2 });
	}

	imageFallback() {

		this.image = new Image();
		this.image.crossOrigin = "anonymous";
		this.image.addEventListener('load', this.imageFallbackListener.bind(this));

		this.image.src = this.url;
	}
	imageFallbackListener() {
		this.canvas.width = this.image.width;
		this.canvas.height = this.image.height;
		this.ctx.drawImage(this.image, 0, 0);
		this.texture.needsUpdate = true;
	}

	setFrameData(frameData) {
		this.gifTiming = frameData[0].frameInfo.delay;
		this.frameData = frameData;
		for (let index = 0; index < this.frameData.length; index++) {
			const frame = this.frameData[index];
			frame.image = frame.getImage();
		}
		this.loadListener();
	}

	loadListener() {
		//let pow = 2;
		//while (Math.pow(2, pow) < Math.max(this.image.width, this.image.height)) {
		//	pow++;
		//}
		//this.canvas.width = Math.pow(2, pow);
		//this.canvas.height = Math.pow(2, pow);
		this.canvas.width = 128;
		this.canvas.height = 128;

		this.update();
	}

	update() {
		window.requestAnimationFrame(this.update.bind(this));

		let timeDiff = Date.now() - this.lastFrame;
		while (timeDiff > this.gifTiming * 10) {
			this.currentFrame++;
			if (this.currentFrame >= this.frameData.length) this.currentFrame = 0;
			timeDiff -= this.gifTiming;
			this.lastFrame += timeDiff;
		}

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(this.frameData[this.currentFrame].image, 0, 0);
		this.texture.needsUpdate = true;
	}
}

module.exports = GIF_Instance;
