import * as THREE from 'three';

class GIF_Instance {
	constructor(id) {
		this.id = id;
		this.gifTiming = 10;
		this.lastFrame = Date.now();
		this.currentFrame = 0;
		this.loadedImages = 0;
		this.frames = [];

		fetch(`https://gif-emotes.opl.io/gif/${id}`)
		.then(r => r.json())
		.then(frames => {
			if (frames.count === 0) {
				this.imageFallback();
			} else {
				
				this.gifTiming = frames[0].frameInfo.delay;
				this.frames = frames;
				for (let index = 0; index < this.frames.length; index++) {
					const frame = this.frames[index];
					frame.image = new Image(frame.width, frame.height);
					frame.image.crossOrigin = "anonymous";
					frame.image.addEventListener('load', ()=>{
						this.loadedImages++;
						if (this.loadedImages >= this.frames.length) {
							this.loadListener();
						}
					})
					frame.image.src = `https://gif-emotes.opl.io/static/${id}/${index}.png`;
				}
			}


		})


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

	loadListener() {
		let pow = 2;
		while (Math.pow(2, pow) < Math.max(this.image.width, this.image.height)) {
			pow++;
		}
		this.canvas.width = Math.pow(2, pow);
		this.canvas.height = Math.pow(2, pow);

		this.update();
	}

	update() {
		window.requestAnimationFrame(this.update.bind(this));

		let timeDiff = Date.now() - this.lastFrame;
		while (timeDiff > this.gifTiming * 10) {
			this.currentFrame++;
			if (this.currentFrame >= this.frames.length) this.currentFrame = 0;
			timeDiff -= this.gifTiming;
			this.lastFrame += timeDiff;
		}

		if (!this.frames[this.currentFrame].interlaced) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.ctx.drawImage(this.frames[this.currentFrame].image, this.frames[this.currentFrame].x, this.frames[this.currentFrame].y);
		this.texture.needsUpdate = true;
	}
}

module.exports = GIF_Instance;
