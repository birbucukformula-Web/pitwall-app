import { useEffect } from "react";

export default function Game() {
  useEffect(() => {
    const wrapper = document.getElementById('f1-game-wrapper');
    const canvas = document.getElementById('f1-canvas') as HTMLCanvasElement;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext('2d')!;
    const scoreElement = document.getElementById('f1-score');
    const startScreen = document.getElementById('f1-start-screen');
    
    if (!ctx || !scoreElement || !startScreen) return;

    let frames = 0;
    let score = 0;
    let gameSpeed = 4.5;
    let isGameOver = false;
    let isPlaying = false;
    let obstacles: Obstacle[] = [];
    let groundParticles: any[] = [];
    let framesSinceLastObstacle = 0;
    let animationId: number;

    const car = {
        x: 50,
        y: 180,
        dy: 0,
        jumpPower: -9.5, 
        gravity: 0.38,   
        grounded: true,
        draw() {
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(this.x + 10, this.y + 10, 42, 12);
            ctx.fillRect(this.x + 52, this.y + 16, 12, 6);
            ctx.fillStyle = '#111';
            ctx.fillRect(this.x + 58, this.y + 20, 6, 2);
            ctx.fillRect(this.x - 2, this.y + 4, 12, 6);
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(this.x, this.y, 8, 4);
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(this.x + 28, this.y + 2, 10, 8);
            ctx.fillStyle = '#222';
            ctx.fillRect(this.x + 10, this.y + 12, 16, 16);
            ctx.fillRect(this.x + 44, this.y + 14, 14, 14);
            ctx.fillStyle = '#888';
            ctx.fillRect(this.x + 14, this.y + 16, 8, 8);
            ctx.fillRect(this.x + 47, this.y + 17, 8, 8);
        },
        update() {
            this.dy += this.gravity;
            this.y += this.dy;

            if (this.y >= 180) { 
                this.y = 180;
                this.dy = 0;
                this.grounded = true;
            } else {
                this.grounded = false;
            }
            
            this.draw();
        },
        jump() {
            if (this.grounded) {
                this.dy = this.jumpPower;
                this.grounded = false;
            }
        },
        getHitbox() {
            return { x: this.x + 18, y: this.y + 6, width: 24, height: 16 };
        }
    };

    class Obstacle {
        type: number;
        x: number;
        y: number = 0;
        width: number = 0;
        height: number = 0;
        markedForDeletion: boolean;

        constructor(type: number) {
            this.type = type;
            this.x = canvas.width;
            this.markedForDeletion = false;

            if (type === 0) { 
                this.y = 175;
                this.width = 28;
                this.height = 34;
            } else if (type === 1) { 
                this.y = 175;
                this.width = 24;
                this.height = 34;
            } else if (type === 2) { 
                this.y = 150;
                this.width = 32;
                this.height = 16;
            } else if (type === 3) { 
                this.y = 100;
                this.width = 32;
                this.height = 16;
            }
        }
        draw() {
            if (this.type === 0) { 
                ctx.fillStyle = '#222';
                ctx.fillRect(this.x + 2, this.y + 24, 24, 10); 
                ctx.fillRect(this.x + 4, this.y + 12, 20, 10); 
                ctx.fillRect(this.x + 6, this.y, 16, 10);      
                ctx.fillStyle = '#cc0000';
                ctx.fillRect(this.x + 4, this.y + 26, 20, 2);
                ctx.fillStyle = '#fff';
                ctx.fillRect(this.x + 6, this.y + 14, 16, 2);
                ctx.fillStyle = '#cc0000';
                ctx.fillRect(this.x + 8, this.y + 2, 12, 2);
            } else if (this.type === 1) { 
                ctx.fillStyle = '#ff6600';
                ctx.fillRect(this.x + 4, this.y + 18, 16, 16);
                ctx.fillRect(this.x + 8, this.y + 4, 8, 14);
                ctx.fillStyle = '#fff';
                ctx.fillRect(this.x + 7, this.y + 10, 10, 6);
                ctx.fillRect(this.x + 3, this.y + 24, 18, 4);
            } else if (this.type === 2 || this.type === 3) { 
                ctx.fillStyle = '#ddd';
                ctx.fillRect(this.x + 6, this.y + 4, 20, 8); 
                ctx.fillStyle = '#444';
                ctx.fillRect(this.x, this.y, 10, 4); 
                ctx.fillRect(this.x + 22, this.y, 10, 4); 
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(this.x + 14, this.y + 10, 4, 6);
            }
        }
        update() {
            this.x -= gameSpeed;
            if (this.x < -this.width) this.markedForDeletion = true;
            this.draw();
        }
        getHitbox() {
            if(this.type === 2 || this.type === 3) {
                return { x: this.x + 6, y: this.y + 4, width: 20, height: 8 };
            }
            return { x: this.x + 8, y: this.y + 8, width: this.width - 16, height: this.height - 12 };
        }
    }

    function checkCollision(rect1: any, rect2: any) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    function handleObstacles() {
        framesSinceLastObstacle++;
        let minGap = 75 + Math.random() * 60; 
        if (framesSinceLastObstacle > minGap) {
            let availableTypes = [0, 1]; 
            if (score > 150) availableTypes.push(2); 
            if (score > 350) availableTypes.push(3); 
            let type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            obstacles.push(new Obstacle(type));
            framesSinceLastObstacle = 0;
        }

        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].update();
            if (checkCollision(car.getHitbox(), obstacles[i].getHitbox())) {
                gameOver();
            }
        }
        obstacles = obstacles.filter(obs => !obs.markedForDeletion);
    }

    function drawEnvironment() {
        ctx.fillStyle = '#666';
        ctx.fillRect(0, 208, canvas.width, 2); 
        
        if(frames % 10 === 0 && isPlaying) {
            groundParticles.push({
                x: canvas.width, 
                y: 212 + Math.random() * 25, 
                w: 10 + Math.random() * 20, 
                h: 2
            });
        }
        ctx.fillStyle = '#aaa';
        for(let i = 0; i < groundParticles.length; i++){
            if(isPlaying) groundParticles[i].x -= gameSpeed;
            ctx.fillRect(groundParticles[i].x, groundParticles[i].y, groundParticles[i].w, groundParticles[i].h);
        }
        groundParticles = groundParticles.filter(p => p.x > -40);
    }

    function animate() {
        if (isGameOver) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawEnvironment();
        car.update();
        handleObstacles();
        
        score += 0.1;
        scoreElement!.innerText = Math.floor(score).toString().padStart(5, '0');
        
        if (frames % 120 === 0 && gameSpeed < 9) {
            gameSpeed += 0.04; 
        }
        
        frames++;
        animationId = requestAnimationFrame(animate);
    }

    function gameOver() {
        isGameOver = true;
        isPlaying = false;
        startScreen!.style.display = 'flex';
        startScreen!.innerHTML = `
            <h2 style="margin: 0 0 10px 0; color: #cc0000; font-size: 32px; font-weight: 800; text-transform: uppercase;">KAZA!</h2>
            <p style="margin: 0 0 15px 0; font-size: 20px; font-weight: bold; color: #333;">Skor: ${Math.floor(score)}</p>
            <p style="margin: 0; font-size: 16px; color: #555; background: #eee; padding: 8px 16px; border-radius: 20px;">Yeniden oynamak için tıkla veya Boşluk tuşuna bas</p>
        `;
    }

    function resetGame() {
        obstacles = [];
        groundParticles = [];
        score = 0;
        frames = 0;
        gameSpeed = 4.5; 
        isGameOver = false;
        isPlaying = true;
        car.y = 180;
        car.dy = 0;
        car.grounded = true;
        scoreElement!.innerText = '00000';
        startScreen!.style.display = 'none';
        framesSinceLastObstacle = 0;
        
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    function handleInput() {
        if (!isPlaying) {
            resetGame();
        } else {
            car.jump();
        }
    }

    const clickHandler = (_e: MouseEvent) => {
        handleInput();
    };

    const touchHandler = (e: TouchEvent) => {
        e.preventDefault(); 
        handleInput();
    };

    const keydownHandler = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault(); 
            handleInput();
        }
    };

    wrapper.addEventListener('click', clickHandler);
    wrapper.addEventListener('touchstart', touchHandler, {passive: false});
    window.addEventListener('keydown', keydownHandler);

    // Initial draw
    drawEnvironment();
    car.draw();

    return () => {
        if (animationId) cancelAnimationFrame(animationId);
        wrapper.removeEventListener('click', clickHandler);
        wrapper.removeEventListener('touchstart', touchHandler);
        window.removeEventListener('keydown', keydownHandler);
    };
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", padding: "2rem" }}>
      <div id="f1-game-wrapper" style={{ position: "relative", width: "100%", maxWidth: "800px", height: "250px", backgroundColor: "#fafafa", overflow: "hidden", border: "2px solid #ddd", borderRadius: "8px", margin: "0 auto", userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation", cursor: "pointer" }}>
          <div id="f1-score" style={{ position: "absolute", top: "15px", right: "20px", fontFamily: "'Courier New', Courier, monospace", fontSize: "24px", fontWeight: "bold", color: "#333", zIndex: 10 }}>00000</div>
          <canvas id="f1-canvas" width="800" height="250" style={{ display: "block", width: "100%", height: "100%" }}></canvas>
          
          <div id="f1-start-screen" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.85)", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", zIndex: 20 }}>
              <h2 style={{ margin: "0 0 10px 0", color: "#cc0000", fontSize: "32px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>F1 Run</h2>
              <p style={{ margin: 0, fontSize: "16px", color: "#555", fontWeight: 600 }}>Başlamak için tıkla veya Boşluk tuşuna bas</p>
          </div>
      </div>
    </div>
  );
}
