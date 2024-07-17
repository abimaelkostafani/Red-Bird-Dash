// JAVASCRIPT CODE //

// select canvas
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// LOAD SPRITE
const sprite = new Image();
sprite.src = "img/sprite.png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

// GAME VARIABLES AND CONSTANTS
let frames = 0;
const DEGREE = Math.PI/180;

// GAME STATE
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

// START BUTTON POSITION
const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

// CONTROL GAME (KLIK)
cvs.addEventListener("click", function(evt){

    switch (state.current){
        case state.getReady:
            SWOOSHING.play();
            state.current = state.game;
            break;

        case state.game:
            FLAP.play();
            bird.flap();
            break;

        case state.over:
            //WE GET THE EXACT X & Y POSITION OF CLICK EVENT, EVEN WHEN SCROLLING 
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            // CHECK IF WE CLICK START BUTTON
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h ){
                pipes.reset();
                bird.speedReset();
                score.reset();

                state.current = state.getReady;
            }
            break;     
    }
});

// CONTROL GAME (SPACE)
document.addEventListener("keydown", function(evt){
    if(evt.key === " "){ // Check if the key pressed is the spacebar
        switch (state.current){
            case state.getReady:
                SWOOSHING.play();
                state.current = state.game;
                break;
            case state.game:
                FLAP.play();
                bird.flap();
                break;
            case state.over:
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
                break;     
        }
    }
});
// GET READY
const getReady = {
    xs : 0,
    ys : 228,
    ws : 173,
    hs : 152,
    x : cvs.width/2 - 173/2,
    y : 80,

    draw : function(){
        // WHEN ONLY DRAW THIS ON GET READY STATE
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.xs, this.ys, this.ws, this.hs, this.x, this.y, this.ws, this.hs)
        }
    }
}

// FOREGROUND
const fg = {
    x : 276,
    y : 0,
    w : 224,
    h : 112,
    xpos : 0,
    dx : 2,

    draw : function(){
        ctx.drawImage(sprite, this.x, this.y, this.w, this.h, this.xpos, cvs.height - this.h, this.w, this.h);
        ctx.drawImage(sprite, this.x, this.y, this.w, this.h, this.xpos + this.w, cvs.height - this.h, this.w, this.h);
    },

    update : function(){
        // WE ONLY MOVE THE FORGROUND WHEN IT'S GAME STATE
        if(state.current == state.game){
            // console.log((this.xpos - 2)%15);
            this.xpos = (this.xpos - this.dx)% (this.w/2);   
        }
    }
}

// THE BIRD
const bird = {
    // WE HAVE 3 BIRD IMAGES, WE SHOW ONE BY ONE SO WE GET THE BIRD FLAPPING
    animation : [
        { x : 277, y : 113 },
        { x : 277, y : 139 },
        { x : 277, y : 166 },
        { x : 277, y : 139 }
    ],
    x : 50,
    y : 150,
    w : 33,
    h : 29.9,

    frame : 0,
    frequency : 10,
    rotation : 0,   

    jump : 3.8,
    gravity : 0.20,
    speed : 0,

    // WE CONSIDER THE BIRD IS A BALL, SO IT WILL BE EASY TO DETECT COLLISIONS
    radius : 10,

    draw : function(){

        let bird = this.animation[this.frame];

        // Save the default state
        ctx.save();

        // translate the canvas
        ctx.translate(this.x, this.y);
        // Rotate the canvas
        ctx.rotate(this.rotation);

        // draw the bird
        ctx.drawImage(sprite, bird.x, bird.y, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h);

        // Restore the default state
        ctx.restore();
    },
    update : function(){

        // WHEN IT'S GETREADY STATE, THE FREQUENCY IS 10, OTHERWISE IT'S 5
        // HIGH FREQUENCY => LESS FLAPPING
        this.frequency = state.current == state.getReady ? 10 : 5;

        // WE INCREMENT THE FRAME BY 1 EVERY FREQUENCY.
        this.frame += frames % this.frequency == 0 ? 1 : 0;
        // AFTER THE LAST FRAME WHEN TO GO BACK TO THE FIRST ONE.
        this.frame =  this.frame%this.animation.length;


        if(state.current === state.getReady){

            this.y = 150; // RESET Y POSITION TO DEFAULT
            this.rotation = 0 * DEGREE;

        }else{ // IF IT'S THE GAME STATE

            // THE SPEED INCREASES CONTINUOUSLY
            this.speed += this.gravity;
            // THE BIRD GOES DOWN WITH A SPEED
            this.y += this.speed;

            // WHEN THE BIRD HIT THE GROUND
            if(this.y + this.h/2 >= cvs.height-fg.h){

                // THE BIRD MUST STAY DEAD ON THE GROUND.
                this.y = cvs.height - fg.h- this.h/2;

                // DETEKSI TABRAKAN KE ATAS (LANGIT)
                if ( this.y - this.h/2 <= 0) {
                    HIT.play();
                    state.current = state.over;
                }

                // WE GAME STATE IS GAME OVER STATE
                if(state.current == state.game){
                    state.current = state.over;
                    DIE.play();
                }
                
                if (state.current === state.over) {
                    if (score.value > score.best) {
                        score.best = score.value;
                        localStorage.setItem("best", score.best);
                    }
                }
            }

            // IF THE SPEED IS GREATER THAN THE JUMP, MEANS THE BIRD IS FALLING DOWN
            if (this.speed >= this.jump) {
                // THE BIRD DOESN'T FLAP ANYMORE
                this.frame = 1;
                // THE BIRD'S HEAD IS LOOKING DOWN
                this.rotation = 75 * DEGREE;
            }else{
                // ESLE IF THE BIRD IS FLAPPING, KEEP THE HEAD UP BY 25 DEGREE
                this.rotation = 0 * DEGREE;
            }
        }
    },

    flap : function(){
      bird.speed = - bird.jump;  
    },
    speedReset : function(){
        // WE RESET THE SPEED TO 0, WHEN IT'S GET READY STATE
        this.speed = 0;
    }
}

// BACKGROUND
const bg = {
    xs : 0,
    ys : 0,
    ws : 275,
    hs : 226,
    x : 0,
    y : cvs.height - 300,
    w : 275,
    h : 226,

    draw : function(){
        ctx.drawImage(sprite, this.xs, this.ys, this.ws, this.hs, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.xs, this.ys, this.ws, this.hs, this.x + this.w, this.y, this.w, this.h);
    }
}

// SCRORE
const score = {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    x : cvs.width/2.25,
    y : 50,

    draw : function(){
        if(state.current !== state.game) return;
        ctx.lineWidth = 2;
        ctx.fillStyle = "#FFF";
        ctx.font = "35px Teko";
        ctx.fillText(this.value, this.x, this.y);
    },

    reset : function(){
        this.value = 0;
    }
}

// ADDITIONAL CODE FOR MEDALS

// MEDALS
const medals = {
    bronze: { xs: 359, ys: 157, ws: 44, hs: 44 },
    silver: { xs: 359, ys: 112, ws: 44, hs: 44 },
    gold: { xs: 312, ys: 112, ws: 44, hs: 44 },
    platinum: { xs: 312, ys: 157, ws: 44, hs: 44 }
};

// FUNCTION TO DETERMINE MEDAL
function getMedal(score) {
    if (score >= 10 && score < 50) return medals.bronze;
    if (score >= 50 && score < 500) return medals.silver;
    if (score >= 500 && score < 1000) return medals.gold;
    if (score >= 1000) return medals.platinum;
    return null;
}

// PIPES
const pipes = {
    _pipes : [],
    w : 53,
    h : 400,
    gap : 120
,
    bottom : {
        xs : 502,
        ys : 0
    },
    top : {
        xs : 553,
        ys : 0
    },

    _maxYPos : -150,

    dx : 2,
    update : function(){

        if(state.current !== state.game) return;

        if(frames%100 == 0){
            this._pipes.push({
                x : cvs.width,
                y : this._maxYPos * ( Math.random() + 1 )
            });
        }

        for(let i  = 0; i < this._pipes.length; i++){
            let p = this._pipes[i];

            // COLLISION DETECTION
            // WITH NORTH PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + pipes.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + pipes.h){
                HIT.play();
                state.current = state.over;
            }
            // WITH SOUTH PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + pipes.w && bird.y + bird.radius > p.y + pipes.gap + pipes.h && bird.y - bird.radius < p.y + pipes.h*2 + pipes.gap){
                HIT.play();
                state.current = state.over;
            }


            // Update posisi pipa
            p.x -= this.dx;

            // Pengecekan jika burung melewati pipa
            if (p.x + this.w < bird.x - bird.radius && !p.passed) {
                p.passed = true; // Tandai pipa sebagai sudah dilewati
                score.value += 1;
                SCORE_S.play();
            }

            // Hapus pipa dari array ketika sudah keluar layar
            if (p.x + this.w <= 0) {
                this._pipes.shift();
            }

        } 
    },

    draw : function(){

        for(let i  = 0; i < this._pipes.length; i++){
            let p = this._pipes[i];
        

            let topYPos = p.y;
            let bottomYPos = p.y + this.gap + this.h;

            let top = this.top;
            ctx.drawImage(sprite, top.xs, top.ys, this.w, this.h, p.x, topYPos, this.w, this.h);

            let bottom = this.bottom;
            ctx.drawImage(sprite, bottom.xs, bottom.ys, this.w, this.h, p.x, bottomYPos, this.w, this.h);

        }
        for(let i  = 0; i < this._pipes.length; i++){
            let p = this._pipes[i];

            if (bird.y - bird.h/2 <= 0) {
                HIT.play();
                state.current = state.over;
            }
        }
    },

    reset : function(){
        this._pipes = [];
    }
}


// GAME OVER
const gameOver = {
    xs: 175,
    ys: 228,
    ws: 225,
    hs: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,
    scoreX: 210,
    scoreY: 186,
    bestScoreX:210,
    bestScoreY: 228,
    medalX: 72,
    medalY: 175,

    draw: function () {
        if (state.current !== state.over) return;
        ctx.drawImage(sprite, this.xs, this.ys, this.ws, this.hs, this.x, this.y, this.ws, this.hs)

        ctx.fillStyle = "#fff";
        ctx.font = "25px Teko";

        ctx.fillText(score.value, this.scoreX, this.scoreY);

        ctx.fillText(score.best, this.bestScoreX, this.bestScoreY);

        // Draw Medal
        const medal = getMedal(score.value);
        if (medal) {
            ctx.drawImage(sprite, medal.xs, medal.ys, medal.ws, medal.hs, this.medalX, this.medalY, medal.ws, medal.hs);
        }
    }
}

// TEFA STUDIO
const TefaStudio = {
    xs: 417,
    ys: 112,
    ws: 58,
    hs: 35,
    x: 10,
    y: 540,
    w: 58,
    h: 35,

    draw: function() {
        ctx.drawImage(sprite, this.xs, this.ys, this.ws, this.hs, this.x, this.y, this.w, this.h);
    }
};


// UPDATE GAME
function update(){
    pipes.update();
    fg.update();
    bird.update();
}

function draw(){
    // CLEAR CANVAS
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    pipes.draw();
    bird.draw();
    fg.draw();
    score.draw();
    getReady.draw();
    gameOver.draw();
    TefaStudio.draw();
    
    // Menambahkan kalimat "Created by" di bagian bawah tengah canvas
    ctx.fillStyle = "#FFF";
    ctx.font = "10px Times New Roman Bold";
    const createdByText = "Created by Abimael Putra Kostafani";
    const createdByTextWidth = ctx.measureText(createdByText).width;

    // Menggambar teks "Created by"
    ctx.fillText(createdByText, (cvs.width - createdByTextWidth) / 2, cvs.height - 10);
}


// GAME LOOP
function loop(){

    update();
    draw();

    frames++;

    requestAnimationFrame(loop);
}

loop();