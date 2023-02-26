window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')
  canvas.width = 1280
  canvas.height = 720

  ctx.fillStyle = 'white'
  ctx.lineWidth = 3
  ctx.strokeStyle = 'white'
  ctx.font = '40px Helvetica'
  ctx.textAlign = 'center'

  class Player {
    constructor(game) {
      this.game = game
      this.collisionX = this.game.width * 0.5
      this.collisionY = this.game.height * 0.5
      this.collisionRadius = 30
      this.speedX = 0
      this.speedY = 0
      this.dx = 0
      this.dy = 0
      this.speedModifier = 8
      this.spriteWidth = 256
      this.spriteHeight = 256
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.spriteX
      this.spriteY
      this.frameX = 0
      this.frameY = 5
      this.image = document.getElementById('bull')
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      )
      if (this.game.debug) {
        context.beginPath()
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        )
        context.save()
        context.globalAlpha = 0.5
        context.fill()
        context.restore()
        context.stroke()
        context.beginPath()
        context.moveTo(this.collisionX, this.collisionY)
        context.lineTo(this.game.mouse.x, this.game.mouse.y)
        context.stroke()
      }
    }

    update() {
      //sprite animation
      this.dx = this.game.mouse.x - this.collisionX
      this.dy = this.game.mouse.y - this.collisionY
      //use atan2 to get angle between player and mouse cursor
      const angle = Math.atan2(this.dy, this.dx)

      if (angle < -2.74 || angle > 2.74) {
        this.frameY = 6
      } else if (angle < -1.96) {
        this.frameY = 7
      } else if (angle < -1.17) {
        this.frameY = 0
      } else if (angle < -0.39) {
        this.frameY = 1
      } else if (angle < 0.39) {
        this.frameY = 2
      } else if (angle < 1.17) {
        this.frameY = 3
      } else if (angle < 1.96) {
        this.frameY = 4
      } else if (angle < 2.74) {
        this.frameY = 5
      }

      const distance = Math.hypot(this.dy, this.dx)
      if (distance > this.speedModifier) {
        this.speedX = this.dx / distance || 0
        this.speedY = this.dy / distance || 0
      } else {
        this.speedX = 0
        this.speedY = 0
      }

      this.collisionX += this.speedX * this.speedModifier
      this.collisionY += this.speedY * this.speedModifier

      this.spriteX = this.collisionX - this.width * 0.5
      this.spriteY = this.collisionY - this.height * 0.5 - 100
      // horizontal boundaries
      if (this.collisionX < this.collisionRadius) {
        this.collisionX = this.collisionRadius
      } else if (
        this.collisionX >
        this.game.width - this.collisionRadius
      ) {
        this.collisionX = this.game.width - this.collisionRadius
      }

      // vertical boundaries
      if (
        this.collisionY <
        this.game.topMargin + this.collisionRadius
      ) {
        this.collisionY = this.game.topMargin + this.collisionRadius
      } else if (
        this.collisionY >
        this.game.height - this.collisionRadius
      ) {
        this.collisionY = this.game.height - this.collisionRadius
      }

      //collision with obstacles
      this.game.obstacles.forEach((obstacle) => {
        // [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        //use destructuring from line 162
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, obstacle)
        //let collision = game.checkCollision(this, obstacle)[0]
        if (collision) {
          const unit_x = dx / distance
          const unit_y = dy / distance
          this.collisionX =
            obstacle.collisionX + (sumOfRadii + 1) * unit_x
          this.collisionY =
            obstacle.collisionY + (sumOfRadii + 1) * unit_y
        }
      })
    }
  }

  class Obstacle {
    constructor(game) {
      this.game = game
      this.collisionX = Math.random() * this.game.width
      this.collisionY = Math.random() * this.game.height
      this.collisionRadius = 40
      this.image = document.getElementById('obstacles')
      this.spriteWidth = 250
      this.spriteHeight = 250
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.spriteX = this.collisionX - this.width * 0.5
      this.spriteY = this.collisionY - this.height * 0.5 - 70
      this.frameX = Math.floor(Math.random() * 4)
      this.frameY = Math.floor(Math.random() * 3)
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      )
      if (this.game.debug) {
        context.beginPath()
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        )
        context.save()
        context.globalAlpha = 0.5
        context.fill()
        context.restore()
        context.stroke()
      }
    }

    update() {}
  }

  class Egg {
    constructor(game) {
      this.game = game
      this.collisionRadius = 40
      this.margin = this.collisionRadius * 2
      this.collisionX =
        this.margin +
        Math.random() * (this.game.width - this.margin * 2)

      this.collisionY =
        this.game.topMargin +
        Math.random() *
          (this.game.height - this.game.topMargin - this.margin)
      this.collisionRadius = 40
      this.image = document.getElementById('egg')
      this.spriteWidth = 110
      this.spriteHeight = 135
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.spriteX
      this.spriteY
      this.hatchTimer = 0
      this.hatchInterval = 3000
      this.markedForDeletion = false
    }

    draw(context) {
      context.drawImage(this.image, this.spriteX, this.spriteY)
      if (this.game.debug) {
        context.beginPath()
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        )
        context.save()
        context.globalAlpha = 0.5
        context.fill()
        context.restore()
        context.stroke()
        const displayTimer = (this.hatchTimer * 0.001).toFixed(0)
        context.fillText(
          displayTimer,
          this.collisionX,
          this.collisionY - this.collisionRadius * 2.5
        )
      }
    }

    update(deltaTime) {
      this.spriteX = this.collisionX - this.width * 0.5
      this.spriteY = this.collisionY - this.height * 0.5 - 30
      // collisions
      let collisionObjects = [
        this.game.player,
        ...this.game.obstacles,
        ...this.game.enemies,
      ]
      collisionObjects.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object)
        if (collision) {
          const unit_x = dx / distance
          const unit_y = dy / distance
          this.collisionX =
            object.collisionX + (sumOfRadii + 1) * unit_x
          this.collisionY =
            object.collisionY + (sumOfRadii + 1) * unit_y
        }
      })
      //hatching
      if (
        this.hatchTimer > this.hatchInterval ||
        this.collisionY < this.game.topMargin
      ) {
        this.game.hatchlings.push(
          new Larva(this.game, this.collisionX, this.collisionY)
        )
        this.markedForDeletion = true
        this.game.removeGameObjects()
      } else {
        this.hatchTimer += deltaTime
      }
    }
  }

  class Larva {
    constructor(game, x, y) {
      this.game = game
      this.collisionX = x
      this.collisionY = y
      this.collisionRadius = 30
      this.image = document.getElementById('larva')
      this.spriteWidth = 150
      this.spriteHeight = 150
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.spriteX
      this.spriteY
      this.speedY = 1 + Math.random()
      this.frameX = 0
      this.frameY = Math.floor(Math.random() * 2)
    }

    draw(context) {
      context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)
      if (this.game.debug) {
        context.beginPath()
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        )
        context.save()
        context.globalAlpha = 0.5
        context.fill()
        context.restore()
        context.stroke()
      }
    }

    update() {
      this.collisionY -= this.speedY
      this.spriteX = this.collisionX - this.width * 0.5
      this.sprtieY = this.collisionY - this.height * 0.5 - 50
      //move to safety (top Margin)
      if (this.collisionY < this.game.topMargin) {
        this.markedForDeletion = true
        this.game.removeGameObjects()
        this.game.score+=1
      }
      //collisions with objects:
      let collisionObjects = [
        this.game.player,
        ...this.game.obstacles
      ]
      collisionObjects.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object)
        if (collision) {
          const unit_x = dx / distance
          const unit_y = dy / distance
          this.collisionX =
            object.collisionX + (sumOfRadii + 1) * unit_x
          this.collisionY =
            object.collisionY + (sumOfRadii + 1) * unit_y
        }
      })

      //collsion with enemies:
      this.game.enemies.forEach(enemy => {
        if(this.game.checkCollision(this, enemy)[0]) {
          this.markedForDeletion = true
          this.game.removeGameObjects()
          this.game.lostHatchlings +=1
        }
      })

    }
  }
  class Enemy {
    constructor(game) {
      this.game = game
      this.collisionRadius = 30
      this.speedX = Math.random() * 3 + 0.5
      this.image = document.getElementById('toad')
      this.spriteWidth = 140
      this.spriteHeight = 260
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.collisionX =
        this.game.width +
        this.width +
        Math.random() * this.game.width * 0.5
      this.collisionY =
        this.game.topMargin +
        Math.random() * (this.game.height - this.game.topMargin)
      this.spriteX
      this.spriteY
    }

    draw(context) {
      context.drawImage(this.image, this.spriteX, this.spriteY)
      if (this.game.debug) {
        context.beginPath()
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        )
        context.save()
        context.globalAlpha = 0.5
        context.fill()
        context.restore()
        context.stroke()
      }
    }

    update() {
      this.spriteX = this.collisionX - this.width * 0.5
      this.spriteY = this.collisionY - this.height * 0.5 - 100
      this.collisionX -= this.speedX

      if (this.spriteX + this.width < 0) {
        this.collisionX =
          this.game.width +
          this.width +
          Math.random() * this.game.width * 0.5
        this.collisionY =
          this.game.topMargin +
          Math.random() * (this.game.height - this.game.topMargin)
      }
      let collisionObjects = [
        this.game.player,
        ...this.game.obstacles,
      ]
      collisionObjects.forEach((object) => {
        //destructure: [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object)
        if (collision) {
          const unit_x = dx / distance
          const unit_y = dy / distance
          this.collisionX =
            object.collisionX + (sumOfRadii + 1) * unit_x
          this.collisionY =
            object.collisionY + (sumOfRadii + 1) * unit_y
        }
      })
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas
      this.width = this.canvas.width
      this.height = this.canvas.height
      this.topMargin = 260
      this.debug = true
      this.player = new Player(this)
      this.fps = 70
      this.timer = 0
      this.interval = 1000 / this.fps

      this.eggTimer = 0
      this.eggInterval = 1000
      this.numberOfObstacles = 10
      this.maxEggs = 20
      this.obstacles = []
      this.eggs = []
      this.enemies = []
      this.hatchlings = []
      this.gameObjects = []
      this.score = 0
      this.lostHatchlings = 0
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      }

      //Event listeners:
      canvas.addEventListener('mousedown', (event) => {
        this.mouse.x = event.offsetX
        this.mouse.y = event.offsetY
        this.mouse.pressed = true
      })

      canvas.addEventListener('mouseup', (event) => {
        this.mouse.x = event.offsetX
        this.mouse.y = event.offsetY
        this.mouse.pressed = false
      })

      canvas.addEventListener('mousemove', (event) => {
        if (this.mouse.pressed) {
          this.mouse.x = event.offsetX
          this.mouse.y = event.offsetY
        }
      })

      window.addEventListener('keydown', (event) => {
        if (event.key === 'd') {
          this.debug = !this.debug
        }
      })
    }
    render(context, deltaTime) {
      if (this.timer > this.interval) {
        context.clearRect(0, 0, this.width, this.height)
        this.gameObjects = [
          this.player,
          ...this.eggs,
          ...this.obstacles,
          ...this.enemies,
          ...this.hatchlings,
        ]
        //sort by verticle position
        this.gameObjects.sort((a, b) => {
          return a.collisionY - b.collisionY
        })
        this.gameObjects.forEach((object) => {
          object.draw(context)
          object.update(deltaTime)
        })

        this.timer = 0
      }
      this.timer += deltaTime

      //add eggs periodically:
      if (
        this.eggTimer > this.eggInterval &&
        this.eggs.length < this.maxEggs
      ) {
        this.addEgg()
        this.eggTimer = 0
      } else {
        this.eggTimer += deltaTime
      }
        //draw game status text:
        context.save()
        context.textAlign = 'left'
        context.fillText('Score: ' + this.score, 25, 50)
        if(this.debug) {
          context.fillText('Lost: ' + this.lostHatchlings, 25, 100)
        }
        context.restore()

    }

    checkCollision(a, b) {
      //a, b are Ojects.  Checking if they collide Video 55:00
      const dx = a.collisionX - b.collisionX
      const dy = a.collisionY - b.collisionY
      const distance = Math.hypot(dy, dx)
      const sumOfRadii = a.collisionRadius + b.collisionRadius
      return [distance < sumOfRadii, distance, sumOfRadii, dx, dy]
      //return an array with distance < sumOfRadii rtn true or false
    }

    addEgg() {
      this.eggs.push(new Egg(this))
    }

    addEnemy() {
      this.enemies.push(new Enemy(this))
    }

    removeGameObjects() {
      this.eggs = this.eggs.filter(
        (object) => !object.markedForDeletion
      )

      this.hatchlings = this.hatchlings.filter(
        (object) => !object.markedForDeletion
      )
     
    }

    init() {
      for (let i = 0; i < 3; i += 1) {
        this.addEnemy()
      }
      let attempts = 0
      while (
        this.obstacles.length < this.numberOfObstacles &&
        attempts < 50
      ) {
        let testObstacle = new Obstacle(this)
        let overlap = false
        this.obstacles.forEach((obstacle) => {
          const dx = testObstacle.collisionX - obstacle.collisionX
          const dy = testObstacle.collisionY - obstacle.collisionY
          const distance = Math.hypot(dy, dx)
          const distanceBuffer = 150
          const sumOfRadii =
            testObstacle.collisionRadius +
            obstacle.collisionRadius +
            distanceBuffer
          if (distance < sumOfRadii) {
            overlap = true
          }
        })
        const margin = testObstacle.collisionRadius * 3
        if (
          !overlap &&
          testObstacle.spriteX > 0 &&
          testObstacle.spriteX < this.width - testObstacle.width &&
          testObstacle.collisionY > this.topMargin + margin &&
          testObstacle.collisionY < this.height - margin
        ) {
          this.obstacles.push(testObstacle)
        }
        attempts += 1
      }
    }
  }

  const game = new Game(canvas)
  game.init()
  console.log(game)

  let lastTime = 0
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    //above would flash because we did not clear this. Move to above
    game.render(ctx, deltaTime)
    requestAnimationFrame(animate)
  }

  animate(0)
})

// Start at Gaining Score points. 
