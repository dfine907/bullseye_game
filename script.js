window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')
  canvas.width = 1280
  canvas.height = 720

  ctx.fillStyle = 'white'
  ctx.lineWidth = 3
  ctx.strokeStyle = 'white'

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
      this.speedModifier = 3
      this.spriteWidth = 255
      this.spriteHeight = 255
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
      if (this.collisionY < this.game.topMargin + this.collisionRadius) {
        this.collisionY = this.game.topMargin + this.collisionRadius
      } else if (this.collisionY > this.game.height - this.collisionRadius) {
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
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas
      this.width = this.canvas.width
      this.height = this.canvas.height
      this.topMargin = 260
      this.debug = true
      this.player = new Player(this)
      this.numberOfObstacles = 10
      this.obstacles = []
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
    render(context) {
      this.obstacles.forEach((obstacle) => obstacle.draw(context))
      this.player.draw(context)
      this.player.update()
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

    init() {
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

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.render(ctx)
    requestAnimationFrame(animate)
  }

  animate()
})

//ENDED VIDEO AT  1:18:00  / NEXT IS  LESSON 14-- Debug
