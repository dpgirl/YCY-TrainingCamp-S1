class BrakeBanner{
	constructor(selector){
		// 1、创建画布
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xffffffff,
			resizeTo: window
		})
		console.log('app', this.app, this.app.view)
		document.querySelector(selector).appendChild(this.app.view)

		this.stage = this.app.stage
		// 2、加载资源
		this.loader = new PIXI.Loader()
		this.sourceList = ['btn.png', 'btn_circle.png', 'brake_bike.png', 'brake_handlerbar.png', 'brake_lever.png']
		// 自定义的key: btn.png, 资源：images/btn.png
		// this.loader.add('btn.png', "images/btn.png")
		// this.loader.add('btn_circle.png', "images/btn_circle.png")
		// this.loader.add('brake_bike.png', "images/brake_bike.png")
		// this.loader.add('brake_handlerbar.png', "images/brake_handlerbar.png")
		// this.loader.add('brake_lever.png', "images/brake_lever.png")
		this.sourceList.map(source => this.addSource(source))

		this.loader.load()
		// 资源加载完成
		this.loader.onComplete.add(() => {
			this.show()
		})
	} 

	show() {
		
		let { bikeContainer, bikeLeverImg } = this.createBike()
		bikeContainer.scale.x = bikeContainer.scale.y = 0.3

		let actionButton = this.creatActionButton()
		actionButton.scale.x = actionButton.scale.y = 0.45
		// actionButton.x = bikeContainer.x/2
		// actionButton.y = bikeContainer.y/2
		// actionButton.x = 430
		// actionButton.y = 400
		// actionButton.y = 440 // 父容器移动到400的位置
		actionButton.buttonMode = true // 移动上去箭头变为手
		actionButton.interactive = true // 可以交互
		actionButton.on('mousedown', () => { // 按下效果 pointerdown
			// 把手被按下的效果：逆时针30°
			// bikeLeverImg.rotation = Math.PI/180*-30
			gsap.to(bikeLeverImg, {duration: 0.6, rotation: Math.PI/180*-30})

			// 粒子暂停
			pause()
		})
		actionButton.on('mouseup', () => { // 松开效果 pointerdown
			// bikeLeverImg.rotation = 0
			gsap.to(bikeLeverImg, {duration: 0.6, rotation: 0})
			// 粒子启动
			start()
		})

		let resize = () => {
			console.log('resize')
			bikeContainer.x = window.innerWidth - bikeContainer.width
			bikeContainer.y = window.innerHeight - bikeContainer.height

			actionButton.x = window.innerWidth - bikeContainer.x + 420
			actionButton.y = window.innerHeight - bikeContainer.y - 160
		}
		window.addEventListener('resize', resize)
		resize()

		// 5、创建粒子
		let particleContainer = new PIXI.Container()
		this.stage.addChild(particleContainer)
		// 轴心为中心点
		particleContainer.pivot.x = window.innerWidth/2
		particleContainer.pivot.y = window.innerWidth/2

		particleContainer.x = window.innerWidth/2
		particleContainer.y = window.innerWidth/2
		// 粒子向35°旋转
		particleContainer.rotation = 35*Math.PI/180
		// 粒子有多个颜色
		let particles = []
		const colors = [0xf1cf54, 0xb5cea8, 0xf1cf54, 0xFF8C00]
		for(let i = 0; i<10; i++) { // 给10个粒子，随机给颜色和位置随机分布
			let gr = new PIXI.Graphics()
			gr.beginFill(colors[Math.floor(Math.random()*colors.length)])
			// 画圆，半径为6
			gr.drawCircle(0,0,4)
			gr.endFill()

			let pItem = {
				sx:  Math.random() * window.innerWidth,
				sy: Math.random() * window.innerHeight,
				gr: gr
			}
			gr.x = pItem.sx
			gr.y = pItem.sy
			particleContainer.addChild(gr)
			particles.push(pItem)
		}
		// 向某一个角度持续移动: 让容器一直往y轴向下移动, 容器旋转
		// 超出边界后回到顶部继续移动
		let speed = 0
		function loop() {
			speed += .5
			speed = Math.min(speed, 20) // 最大速度为20
			for(let i = 0; i<particles.length; i++) {
				let pItem = particles[i]
				pItem.gr.y += speed

				if (speed >= 20) { // 变成线, 由慢到快
					pItem.gr.scale.y = 30
					pItem.gr.scale.x = 0.03

				}
				if (pItem.gr.y > window.innerHeight) pItem.gr.y = 0 // 超出时回到原点
			}
		}

		function start() {
			speed = 0
			gsap.ticker.add(loop)
		}
		
		function pause() {
			gsap.ticker.remove(loop)
			for(let i = 0; i<particles.length; i++) {
				let pItem = particles[i]
				pItem.gr.scale.y = 1
				pItem.gr.scale.x = 1
				// 暂停回弹效果
				gsap.to(pItem.gr, {duration: .6, x:pItem.sx, y:pItem.sy, ease: 'elastic.out'})
			}
		}

		start()
		// 按住鼠标停止
		// 停止的时候还有一点回弹的效果
		// 松开鼠标继续
	}

	// 加载资源
	addSource(fileName, prefix = 'images') {
		this.loader.add(fileName, `${prefix}/${fileName}`)
	}

	// 初始化精灵图
	initSprite(key, stage = this.stage) {
		let source = new PIXI.Sprite(this.loader.resources[key].texture)
		stage.addChild(source)
		return source
	}

	// 按钮
	creatActionButton () {
		// 创建容器，用于按钮和圈的偏移
		let actionButton = new PIXI.Container()
		this.stage.addChild(actionButton)

		// let btnImg = new PIXI.Sprite(this.loader.resources['btn.png'].texture) // resources是复数
		// let btnCircle = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture)
		// let btnCircle2 = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture)
		// actionButton.addChild(btnImg)
		// actionButton.addChild(btnCircle)
		// actionButton.addChild(btnCircle2)
		let btnImg = this.initSprite('btn.png', actionButton)
		let btnCircle = this.initSprite('btn_circle.png', actionButton)
		let btnCircle2 = this.initSprite('btn_circle.png', actionButton)


		//  3、改变圆心， 原点为中心，而不是左上角[正方形]
		btnImg.pivot.x = btnImg.pivot.y = btnImg.width/2
		btnCircle.pivot.x = btnCircle.pivot.y = btnCircle.width/2
		btnCircle2.pivot.x = btnCircle2.pivot.y = btnCircle2.width/2

		// actionButton.x = actionButton.y = 400 // 父容器移动到400的位置

		// 4、添加动画 gsap.to从当前位置变换为其他位置， gasp.from从其他位置变换为当前位置
		// 缩放：从小到大 duration:1为1s， repeat: -1循环播放 alpha: 透明度
		btnCircle.scale.x = btnCircle.scale.y = 0.8
		gsap.to(btnCircle.scale, {duration: 1, x: 1.3, y: 1.3, repeat: -1})
		gsap.to(btnCircle, {duration: 1, alpha: 0, repeat: -1})

		return actionButton
	}
	
	// 自行车
	createBike() {
		const bikeContainer = new PIXI.Container()
		this.stage.addChild(bikeContainer)

		const bikeImg = this.initSprite('brake_bike.png', bikeContainer)
		const bikeLeverImg = this.initSprite('brake_lever.png', bikeContainer)
		
		bikeImg.alpha = 0.5
		// 中心点
		bikeLeverImg.pivot.x = 455
		bikeLeverImg.pivot.y = 455
		
		bikeLeverImg.x = 722
		bikeLeverImg.y = 900
		// 把手按下的效果：逆时针30°
		// bikeLeverImg.rotation = Math.PI/180*-30

		// 调整bikeLeverImg 和 bikeHandlerbarImg初始化的顺序， 从上往下执行
		const bikeHandlerbarImg = this.initSprite('brake_handlerbar.png', bikeContainer)
		return {
			bikeContainer,
			bikeLeverImg
		}
	}
}