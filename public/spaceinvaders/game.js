// ─────────────────────────────────────────────
//  Space Invaders — game.js
//  Streaming enemies · XP leveling · Bosses · 20 levels
// ─────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const GAME_W = 800, GAME_H = 600;

function resizeCanvas() {
  const wrapper = document.getElementById('game-wrapper');
  const hudH    = document.getElementById('hud').offsetHeight + 16;
  const xpH     = 14;
  const touchH  = window.matchMedia('(hover:none) and (pointer:coarse)').matches ? 104 : 0;
  const maxW    = wrapper.clientWidth - 16;
  const maxH    = window.innerHeight - hudH - xpH - touchH - 32;
  const scale   = Math.min(maxW / GAME_W, maxH / GAME_H);
  canvas.width  = GAME_W; canvas.height = GAME_H;
  canvas.style.width  = Math.floor(GAME_W * scale) + 'px';
  canvas.style.height = Math.floor(GAME_H * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ═══════════════════════════════════════════
//  SOUND
// ═══════════════════════════════════════════
let _ac = null;
function ac() {
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  if (_ac.state === 'suspended') _ac.resume();
  return _ac;
}
function tone(freq, dur, type='square', vol=0.15, freqEnd=null) {
  const a=ac(), o=a.createOscillator(), g=a.createGain();
  o.connect(g); g.connect(a.destination); o.type=type;
  o.frequency.setValueAtTime(freq, a.currentTime);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, a.currentTime+dur);
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime+dur);
  o.start(); o.stop(a.currentTime+dur);
}
const sndShoot    = ()=> tone(880,0.07,'square',0.1,200);
const sndDie      = ()=> tone(180,0.28,'sawtooth',0.2,28);
const sndPlayer   = ()=> [400,300,200,100].forEach((f,i)=>setTimeout(()=>tone(f,0.1,'sawtooth',0.2),i*100));
const sndLevelUp  = ()=> [330,440,550,660,880].forEach((f,i)=>setTimeout(()=>tone(f,0.09,'square',0.14),i*70));
const sndBossHit  = ()=> tone(120,0.15,'sawtooth',0.25,60);
const sndBossDie  = ()=> [220,180,140,100,60].forEach((f,i)=>setTimeout(()=>tone(f,0.15,'sawtooth',0.3),i*90));
const sndPickup   = ()=> [440,660,880].forEach((f,i)=>setTimeout(()=>tone(f,0.07,'square',0.15),i*50));
const sndCoin     = ()=> tone(660,0.05,'square',0.1,900);
const sndUpgrade  = ()=> [440,550,660].forEach((f,i)=>setTimeout(()=>tone(f,0.08,'square',0.16),i*55));
const sndCantBuy  = ()=> tone(180,0.12,'sawtooth',0.18,140);

const MARCH_FREQS=[160,130,110,95]; let marchNote=0;
const sndMarch = ()=> tone(MARCH_FREQS[marchNote++%4],0.06,'square',0.12);

let ufoOsc=null, ufoGain=null;
function startUfoDrone(){
  if(ufoOsc) return;
  const a=ac(); ufoGain=a.createGain(); ufoGain.gain.setValueAtTime(0.07,a.currentTime);
  ufoGain.connect(a.destination); ufoOsc=a.createOscillator(); ufoOsc.type='sawtooth';
  ufoOsc.frequency.setValueAtTime(80,a.currentTime);
  const lfo=a.createOscillator(),lg=a.createGain(); lfo.frequency.value=8; lg.gain.value=18;
  lfo.connect(lg); lg.connect(ufoOsc.frequency); lfo.start(); ufoOsc.connect(ufoGain); ufoOsc.start();
}
function stopUfoDrone(){
  if(!ufoOsc) return;
  try{ufoGain.gain.exponentialRampToValueAtTime(0.001,ac().currentTime+0.1);}catch(e){}
  setTimeout(()=>{try{ufoOsc.stop();}catch(e){} ufoOsc=null; ufoGain=null;},150);
}

// ═══════════════════════════════════════════
//  PERSISTENCE  (meta coins only)
// ═══════════════════════════════════════════
function load(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

let metaCoins  = load('si_coins', 0);
let highScore  = load('si_highscore', 0);

// ═══════════════════════════════════════════
//  IN-RUN XP + UPGRADES
// ═══════════════════════════════════════════
let xp=0, xpMax=60, playerLv=0, score=0;
const RUN_UPG = { rapidFire:0, doubleShot:0, speedBoost:0, piercing:0, shieldDrop:0, ironSkin:0, tripleShot:0, homingShot:0 };

const UPG_DEFS = [
  { id:'rapidFire',   name:'Rapid Fire',    icon:'⚡', desc:'Shoot 25% faster',            max:4 },
  { id:'doubleShot',  name:'Double Shot',   icon:'🔫', desc:'Fire two bullets at once',     max:1 },
  { id:'speedBoost',  name:'Speed Boost',   icon:'💨', desc:'Move 30% faster',              max:3 },
  { id:'piercing',    name:'Piercing',      icon:'🎯', desc:'Bullets pass through enemies', max:1 },
  { id:'shieldDrop',  name:'Shield Drop',   icon:'🛡️', desc:'20% chance enemies drop shield',max:1},
  { id:'ironSkin',    name:'Iron Skin',     icon:'🦾', desc:'2× longer invincibility window',max:1},
  { id:'tripleShot',  name:'Triple Shot',   icon:'🌟', desc:'Fire three bullets',           max:1 },
  { id:'homingShot',  name:'Homing',        icon:'🔮', desc:'Bullets curve toward enemies', max:1 },
];

function runParams() {
  return {
    fireCooldown: Math.round(380 * Math.pow(0.75, RUN_UPG.rapidFire)),
    doubleShot:   RUN_UPG.doubleShot > 0,
    tripleShot:   RUN_UPG.tripleShot > 0,
    homing:       RUN_UPG.homingShot > 0,
    speed:        5 * (1 + 0.3 * RUN_UPG.speedBoost),
    piercing:     RUN_UPG.piercing > 0,
    shieldDrop:   RUN_UPG.shieldDrop > 0,
    invFrames:    RUN_UPG.ironSkin > 0 ? 240 : 120,
  };
}
let RP = runParams();

// Upgrade picker state
let pickOffers = [], pickFlash = null;

function pickUpgradeOffers() {
  const avail = UPG_DEFS.filter(u => RUN_UPG[u.id] < u.max).sort(()=>Math.random()-0.5);
  pickOffers = avail.slice(0, 3);
}

function applyUpgrade(idx) {
  const u = pickOffers[idx];
  if (!u) return;
  RUN_UPG[u.id]++;
  RP = runParams();
  sndUpgrade();
  pickFlash = { msg: u.name + ' unlocked!', color:'#00ff88', ttl:80 };
  gameState = STATE.PLAY;
  pickOffers = [];
}

// ═══════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════
const particles=[];
function spawnBurst(x,y,color,n=10,spread=3){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, s=0.8+Math.random()*spread;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:20+~~(Math.random()*20),maxLife:40,color,sz:2+Math.random()*3});
  }
}
function tickParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life--;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=p.life/p.maxLife; ctx.fillStyle=p.color;
    ctx.fillRect(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.sz);
  }
  ctx.globalAlpha=1;
}

// ═══════════════════════════════════════════
//  SHIELD PICKUPS
// ═══════════════════════════════════════════
const shields=[];
function spawnShield(x,y){ shields.push({x:x-8,y,w:16,h:16}); }
function tickShields(){
  for(let i=shields.length-1;i>=0;i--){
    const s=shields[i]; s.y+=0.7;
    if(s.y>GAME_H){shields.splice(i,1);continue;}
    if(rectsHit(s.x,s.y,s.w,s.h,player.x,player.y,PLAYER_W,PLAYER_H)){
      player.invincible=300; shields.splice(i,1); sndPickup();
      spawnBurst(player.x+PLAYER_W/2,player.y,'#00ccff',8,2);
    }
  }
}
function drawShields(){
  for(const s of shields){
    const p=0.55+0.45*Math.sin(Date.now()*0.008);
    ctx.fillStyle=`rgba(0,200,255,${p})`;
    ctx.fillRect(s.x+4,s.y,s.w-8,s.h); ctx.fillRect(s.x,s.y+4,s.w,s.h-8);
  }
}

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════
const PLAYER_W=48, PLAYER_H=24;
const BLTW=7, BLTH=18, BLT_SPD=11;
const EBLTW=5, EBLTH=13;
function ebltSpd() { return 1.2 + (level-1) * 0.14; } // lvl1≈1.2  lvl10≈2.5  lvl20≈3.9
const EN_W=36, EN_H=28;
const ENEMY_COLORS=['#ff4466','#ff8800','#00ccff'];
const ENEMY_XP    =[15,      10,       6       ];
const ENEMY_PTS   =[30,      20,       10      ];

// ═══════════════════════════════════════════
//  LEVEL CONFIG  (1-20)
// ═══════════════════════════════════════════
function levelCfg(lv) {
  const boss = lv % 5 === 0;
  const bossN= lv / 5; // 1-4
  if (boss) return {
    boss: true,
    bossHP:   20 + bossN*18,          // 38,56,74,92
    bossSpeed:1.2 + bossN*0.4,
    bossWays: bossN >= 2 ? 5 : 3,
    bossPhase2HP: Math.round((20+bossN*18)*0.5),
    prewaveKills: 8,                   // kill this many before boss appears
    quota: 8,                          // total regular kills for this level
    spawnInterval: 2200,
    groupSize:4, vy:1.2, hasType1:true, hasType2: bossN>=3,
  };
  return {
    boss: false,
    quota:       15 + lv*4,
    spawnInterval: Math.max(1000, 2800 - lv*100),
    groupSize:   Math.min(8, 3+Math.floor(lv/2)),
    maxEnemies:  Math.min(20, 6 + lv*1),  // level 1 → 7, level 10 → 16, level 20 → 20
    vy:          0.35 + lv*0.055,   // level 1 ≈ 0.4, level 10 ≈ 0.9, level 20 ≈ 1.45
    hasType1:    lv >= 3,
    hasType2:    lv >= 7,
    shootFreq:   Math.max(1400, 8000 - lv*200), // level 1 ≈ 7.8s, level 10 ≈ 6.0s, level 20 ≈ 4.0s
  };
}

// ═══════════════════════════════════════════
//  UFO
// ═══════════════════════════════════════════
const UFO_W=52,UFO_H=24,UFO_Y=40;
const ufo={active:false,x:0,dir:1};
let ufoSpawnTimer=0, ufoPopup=null;

function spawnUfo(ts){
  ufo.active=true; ufo.dir=Math.random()<0.5?1:-1;
  ufo.x=ufo.dir===1?-UFO_W:GAME_W;
  ufoSpawnTimer=ts; startUfoDrone();
}
function tickUfo(ts){
  if(!ufo.active){ if(ts-ufoSpawnTimer>10000+Math.random()*12000) spawnUfo(ts); return; }
  ufo.x+=ufo.dir*2.5;
  if(ufo.x>GAME_W+UFO_W||ufo.x<-UFO_W*2){ ufo.active=false; ufoSpawnTimer=ts; stopUfoDrone(); }
}
function drawUfo(){
  if(!ufo.active) return;
  const x=ufo.x,y=UFO_Y;
  ctx.fillStyle='#ff2255'; ctx.fillRect(x+12,y+8,UFO_W-24,UFO_H-8); ctx.fillRect(x+6,y+4,UFO_W-12,8);
  ctx.fillStyle='#ff88aa'; ctx.fillRect(x+18,y,UFO_W-36,6); ctx.fillRect(x+12,y+2,UFO_W-24,4);
  ctx.fillStyle='#ffddee'; ctx.fillRect(x+10,y+10,6,6); ctx.fillRect(x+23,y+10,6,6); ctx.fillRect(x+36,y+10,6,6);
  ctx.strokeStyle='#ff88aa'; ctx.lineWidth=1; ctx.strokeRect(x+6,y+4,UFO_W-12,UFO_H-4);
}
function drawUfoPopup(){
  if(!ufoPopup) return; ufoPopup.ttl--;
  ctx.globalAlpha=Math.min(1,ufoPopup.ttl/30);
  ctx.fillStyle='#ffdd00'; ctx.font='bold 20px "Courier New"'; ctx.textAlign='center';
  ctx.fillText(ufoPopup.text,ufoPopup.x,ufoPopup.y-(30-ufoPopup.ttl));
  ctx.textAlign='left'; ctx.globalAlpha=1;
  if(ufoPopup.ttl<=0) ufoPopup=null;
}

// ═══════════════════════════════════════════
//  BOSS
// ═══════════════════════════════════════════
let boss = null; // null when no boss active

function spawnBoss(lv) {
  const cfg = levelCfg(lv);
  boss = {
    x: GAME_W/2 - 54, y: 30,
    w: 108, h: 56,
    hp: cfg.bossHP, maxHp: cfg.bossHP,
    speed: cfg.bossSpeed, dir: 1,
    ways: cfg.bossWays,
    phase2HP: cfg.bossPhase2HP,
    phase: 1,         // 1 or 2
    shootTimer: 2000,
    hitFlash: 0,
    alive: true,
  };
}

function tickBoss(ts) {
  if (!boss || !boss.alive) return;
  boss.x += boss.dir * boss.speed;
  if (boss.x <= 20)              { boss.x=20;              boss.dir= 1; }
  if (boss.x+boss.w >= GAME_W-20){ boss.x=GAME_W-20-boss.w; boss.dir=-1; }
  if (boss.hp <= boss.phase2HP && boss.phase === 1) {
    boss.phase = 2; boss.speed *= 1.5; boss.ways = Math.min(boss.ways+2, 7);
  }
  if (boss.hitFlash > 0) boss.hitFlash--;
}

function bossFire() {
  if (!boss || !boss.alive) return;
  const cx = boss.x + boss.w/2;
  const cy = boss.y + boss.h;
  const ways = boss.ways;
  const spread = (ways-1) * 18;
  for (let i=0; i<ways; i++) {
    const angle = -Math.PI/2 + (i-(ways-1)/2) * (Math.PI/(4*(ways-1)+1));
    const bs=ebltSpd()*1.3; enemyBullets.push({ x:cx-EBLTW/2, y:cy, vx:Math.sin(angle)*bs, vy:Math.cos(angle)*bs, isBoss:true });
  }
}

function drawBoss() {
  if (!boss || !boss.alive) return;
  const {x,y,w,h,hp,maxHp,hitFlash,phase} = boss;
  const flash = hitFlash > 0;
  const col  = phase===2 ? (flash?'#ffffff':'#ff2200') : (flash?'#ffffff':'#dd00ff');
  const col2 = phase===2 ? '#ff8800' : '#aa44ff';

  // Body
  ctx.fillStyle = col;
  ctx.fillRect(x+16,y+h*0.4,w-32,h*0.6);
  ctx.fillRect(x+8, y+h*0.2,w-16,h*0.25);
  ctx.fillRect(x+24,y,       w-48,h*0.22);

  // Arms
  ctx.fillRect(x,   y+h*0.3,18,h*0.25);
  ctx.fillRect(x+w-18,y+h*0.3,18,h*0.25);
  ctx.fillRect(x-8, y+h*0.4,12,12);
  ctx.fillRect(x+w-4,y+h*0.4,12,12);

  // Eyes
  ctx.fillStyle = col2;
  ctx.fillRect(x+30,y+h*0.08,14,14);
  ctx.fillRect(x+w-44,y+h*0.08,14,14);
  ctx.fillStyle='#000';
  ctx.fillRect(x+34,y+h*0.1,6,6);
  ctx.fillRect(x+w-42,y+h*0.1,6,6);

  // Phase 2 extra details (glow outline)
  if (phase===2) {
    ctx.strokeStyle='#ff440066';
    ctx.lineWidth=3;
    ctx.strokeRect(x,y,w,h);
  }

  // HP bar
  const barW = 300, barH = 12;
  const barX = GAME_W/2 - barW/2, barY = 10;
  ctx.fillStyle='#330000'; ctx.fillRect(barX,barY,barW,barH);
  const pct = Math.max(0, hp/maxHp);
  ctx.fillStyle = pct>0.5 ? '#00ff44' : pct>0.25 ? '#ffaa00' : '#ff2200';
  ctx.fillRect(barX,barY,barW*pct,barH);
  ctx.strokeStyle='#ffffff44'; ctx.lineWidth=1; ctx.strokeRect(barX,barY,barW,barH);
  ctx.fillStyle='#fff'; ctx.font='10px "Courier New"'; ctx.textAlign='center';
  ctx.fillText(`BOSS  ${hp}/${maxHp}`, GAME_W/2, barY+barH-1);
  ctx.textAlign='left';
}

// ═══════════════════════════════════════════
//  STREAMING ENEMIES
// ═══════════════════════════════════════════
const enemies = []; // live streaming enemies
const enemyBullets = [];
let spawnTimer    = 0;
let killCount     = 0;   // kills this level
let bossSpawned   = false;
let bossPreKills  = 0;   // kills before boss appears (boss levels)
let levelActive   = false;

function getEnemyCfg(type) {
  // type 0=fast top, 1=sine mid, 2=slow aggressive bottom
  return [
    { vy:1.6, vxBase:0, amplitude:0,  shootFreq:3000 },
    { vy:1.2, vxBase:0, amplitude:90, shootFreq:2200 },
    { vy:0.9, vxBase:0, amplitude:50, shootFreq:1500 },
  ][type];
}

function spawnEnemyGroup(cfg) {
  const count = cfg.groupSize;
  const fromLeft = Math.random()<0.5;
  // Formation patterns: row, V, diagonal
  const pattern = Math.floor(Math.random()*3);
  const typePool = [0];
  if (cfg.hasType1) typePool.push(1);
  if (cfg.hasType2) typePool.push(2);
  const rowType = typePool[Math.floor(Math.random()*typePool.length)];
  const ec = getEnemyCfg(rowType);

  for (let i=0; i<count; i++) {
    let startX, startY;
    if (pattern===0) { // horizontal row from one side
      startX = fromLeft ? -EN_W - i*60 : GAME_W + i*60;
      startY = 50 + Math.random()*30;
    } else if (pattern===1) { // V from top
      startX = GAME_W/2 + (i-(count-1)/2)*55;
      startY  = -EN_H - i*30;
    } else { // diagonal
      startX = fromLeft ? -EN_W - i*45 : GAME_W + i*45;
      startY = 30 + i*18;
    }

    enemies.push({
      x: startX, y: startY,
      type: rowType,
      alive: true,
      hp: (rowType===0 && level > 6) ? 2 : 1,
      vy: cfg.vy + ec.vy * 0.25,
      amplitude: ec.amplitude,
      phase: Math.random()*Math.PI*2,
      phaseSpeed: 0.025 + Math.random()*0.015,
      shootTimer: 1500 + Math.random()*cfg.shootFreq,
      targetVx: fromLeft ? 1.2 : -1.2, // initial horizontal drift
      driftFrames: 40 + i*8, // frames before going to sine wave
    });
  }
}

function tickEnemies(ts) {
  const cfg = levelCfg(level);
  // Spawning
  if (levelActive && !bossSpawned) {
    spawnTimer -= 16;
    if (spawnTimer <= 0) {
      spawnTimer = cfg.spawnInterval;
      const cap = cfg.maxEnemies || 20;
      if ((killCount < cfg.quota || cfg.boss) && enemies.length < cap) spawnEnemyGroup(cfg);
    }
  }

  for (let i=enemies.length-1; i>=0; i--) {
    const e = enemies[i];
    if (!e.alive) { enemies.splice(i,1); continue; }

    // Horizontal drift → sine wave
    if (e.driftFrames > 0) {
      e.x += e.targetVx;
      e.driftFrames--;
    } else {
      e.phase += e.phaseSpeed;
      e.x += Math.sin(e.phase) * (e.amplitude / 60);
    }
    e.y += e.vy;

    // Clamp X
    e.x = Math.max(-EN_W*0.5, Math.min(GAME_W - EN_W*0.5, e.x));

    // Enemy bullet
    e.shootTimer -= 16;
    if (e.shootTimer <= 0) {
      e.shootTimer = 1500 + Math.random() * (cfg.boss ? 2000 : cfg.shootFreq || 2500);
      const cx = e.x + EN_W/2;
      // Aim roughly toward player
      const dx = (player.x + PLAYER_W/2) - cx;
      const dy = player.y - e.y;
      const dist = Math.sqrt(dx*dx+dy*dy) || 1;
      const es=ebltSpd(); enemyBullets.push({ x:cx-EBLTW/2, y:e.y+EN_H, vx:dx/dist*es*0.8, vy:dy/dist*es*0.8+es*0.4, isBoss:false });
    }

    // Reached bottom → loop back to top, keep shooting
    if (e.y > GAME_H - 28) {
      e.y = -EN_H;
      e.x = Math.random() * (GAME_W - EN_W);
      e.phase = Math.random() * Math.PI * 2;
      e.driftFrames = 0;
      continue;
    }
  }

  // Boss shoot timer
  if (boss && boss.alive) {
    boss.shootTimer -= 16;
    if (boss.shootTimer <= 0) {
      boss.shootTimer = boss.phase===2 ? 1000 : 1600;
      bossFire();
    }
    tickBoss(ts);
  }
}

function drawEnemyType(x,y,type,f){
  const col = ENEMY_COLORS[type];
  ctx.fillStyle=col;
  if(type===0){ // top — angular
    if(f===0){ctx.fillRect(x+12,y,12,6);ctx.fillRect(x+6,y+6,24,6);ctx.fillRect(x+2,y+12,32,8);ctx.fillRect(x,y+8,6,6);ctx.fillRect(x+30,y+8,6,6);ctx.fillRect(x+4,y+20,8,6);ctx.fillRect(x+24,y+20,8,6);}
    else{ctx.fillRect(x+12,y,12,6);ctx.fillRect(x+6,y+6,24,6);ctx.fillRect(x+2,y+12,32,8);ctx.fillRect(x+6,y+20,8,6);ctx.fillRect(x+22,y+20,8,6);ctx.fillRect(x,y+14,6,6);ctx.fillRect(x+30,y+14,6,6);}
  } else if(type===1){ // mid — round
    if(f===0){ctx.fillRect(x+10,y,16,8);ctx.fillRect(x+4,y+8,28,8);ctx.fillRect(x,y+16,36,6);ctx.fillRect(x+4,y+22,6,6);ctx.fillRect(x+26,y+22,6,6);}
    else{ctx.fillRect(x+10,y,16,8);ctx.fillRect(x+4,y+8,28,8);ctx.fillRect(x,y+16,36,6);ctx.fillRect(x+2,y+22,8,6);ctx.fillRect(x+26,y+22,8,6);}
  } else { // bottom — wide
    if(f===0){ctx.fillRect(x+8,y,20,6);ctx.fillRect(x+2,y+6,32,8);ctx.fillRect(x,y+14,36,8);ctx.fillRect(x+2,y+22,10,6);ctx.fillRect(x+14,y+22,8,6);ctx.fillRect(x+24,y+22,10,6);}
    else{ctx.fillRect(x+8,y,20,6);ctx.fillRect(x+2,y+6,32,8);ctx.fillRect(x,y+14,36,8);ctx.fillRect(x,y+22,10,6);ctx.fillRect(x+14,y+22,8,6);ctx.fillRect(x+26,y+22,10,6);}
  }
  // HP pip for 2-hp enemies
  if(type===0){ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillRect(x+15,y+1,6,2);}
}

let animFrame=0, animTimer=0;
function drawEnemies(){
  if(Date.now()-animTimer>400){animFrame^=1;animTimer=Date.now();}
  for(const e of enemies){
    if(!e.alive) continue;
    drawEnemyType(e.x,e.y,e.type,animFrame);
  }
}
function drawEnemyBullets(){
  for(const b of enemyBullets){
    ctx.fillStyle = b.isBoss ? '#ff8800' : '#ff4466';
    ctx.fillRect(b.x,b.y,EBLTW,EBLTH);
    if(b.isBoss){ctx.fillStyle='#ffcc00';ctx.fillRect(b.x+1,b.y,EBLTW-2,4);}
  }
}

// ═══════════════════════════════════════════
//  PLAYER
// ═══════════════════════════════════════════
const PLAYER_Y = GAME_H - 55;
const player={x:GAME_W/2-PLAYER_W/2, y:PLAYER_Y, w:PLAYER_W, h:PLAYER_H, invincible:0};

function drawPlayer(){
  if(player.invincible>0){
    const g=0.5+0.5*Math.sin(Date.now()*0.015);
    ctx.fillStyle=`rgba(0,200,255,${g*0.25})`;
    ctx.fillRect(player.x-5,player.y-5,player.w+10,player.h+10);
  }
  if(player.invincible>0&&Math.floor(player.invincible/5)%2===0) return;
  const{x,y,w,h}=player;
  ctx.fillStyle='#00ff00';
  ctx.fillRect(x+4,y+h*.5,w-8,h*.5); ctx.fillRect(x+10,y+h*.2,w-20,h*.35); ctx.fillRect(x+w/2-3,y,6,h*.25);
  ctx.fillStyle='#33ff66'; ctx.fillRect(x+8,y+h-4,6,4); ctx.fillRect(x+w-14,y+h-4,6,4);
}

// ═══════════════════════════════════════════
//  PLAYER BULLETS
// ═══════════════════════════════════════════
const playerBullets=[];
let lastFire=0;

function tryFire(ts){
  if(ts-lastFire<RP.fireCooldown) return;
  lastFire=ts;
  const cx=player.x+PLAYER_W/2-BLTW/2;
  const spawnBlt=(ox,vx=0)=>playerBullets.push({x:cx+ox,y:player.y-BLTH,vx,vy:-BLT_SPD});
  spawnBlt(0);
  if(RP.doubleShot)  spawnBlt(-12);                    // double: adds close-left
  if(RP.tripleShot){ spawnBlt(-22); spawnBlt(22); }    // triple: adds wide pair
  if(RP.doubleShot&&RP.tripleShot) spawnBlt(12);       // both: adds close-right too → 5 bullets
  sndShoot();
}

function tickPlayerBullets(){
  for(let i=playerBullets.length-1;i>=0;i--){
    const b=playerBullets[i];
    // Homing: nudge toward nearest enemy
    if(RP.homing){
      let nearest=null, minD=9999;
      for(const e of enemies){ if(!e.alive) continue; const d=Math.abs(e.x-b.x)+Math.abs(e.y-b.y); if(d<minD){minD=d;nearest=e;} }
      if(nearest){ const dx=(nearest.x+EN_W/2)-(b.x+BLTW/2); b.vx+=Math.sign(dx)*0.25; b.vx=Math.max(-4,Math.min(4,b.vx)); }
    }
    b.x+=b.vx; b.y+=b.vy;
    if(b.y<-BLTH){playerBullets.splice(i,1);continue;}

    // Hit UFO
    if(ufo.active&&rectsHit(b.x,b.y,BLTW,BLTH,ufo.x,UFO_Y,UFO_W,UFO_H)){
      const pts=[50,100,150,200,300][~~(Math.random()*5)];
      const ec=5+~~(Math.random()*8);
      score+=pts; metaCoins+=ec; save('si_coins',metaCoins);
      if(score>highScore){highScore=score;save('si_highscore',highScore);}
      ufoPopup={x:ufo.x+UFO_W/2,y:UFO_Y,text:`+${pts}pts 🪙${ec}`,ttl:70};
      spawnBurst(ufo.x+UFO_W/2,UFO_Y+UFO_H/2,'#ff2255',14,3);
      sndDie(); stopUfoDrone(); ufo.active=false; ufoSpawnTimer=performance.now();
      playerBullets.splice(i,1); continue;
    }

    // Hit Boss
    if(boss&&boss.alive&&rectsHit(b.x,b.y,BLTW,BLTH,boss.x,boss.y,boss.w,boss.h)){
      boss.hp--;  boss.hitFlash=8;
      sndBossHit();
      spawnBurst(b.x+BLTW/2,b.y,'#dd00ff',4,2);
      if(!RP.piercing) playerBullets.splice(i,1);
      if(boss.hp<=0){
        boss.alive=false;
        spawnBurst(boss.x+boss.w/2,boss.y+boss.h/2,'#dd00ff',30,5);
        spawnBurst(boss.x+boss.w/2,boss.y+boss.h/2,'#ff8800',20,4);
        sndBossDie();
        const bpts=500*(level/5);
        score+=bpts; gainXP(100);
        if(score>highScore){highScore=score;save('si_highscore',highScore);}
        // Check coins
        const bc=15+~~(level/5)*10;
        metaCoins+=bc; save('si_coins',metaCoins);
        setTimeout(()=>{ if(gameState===STATE.PLAY) winLevel(); },1200);
      }
      continue;
    }

    // Hit enemy
    let hit=false;
    for(const e of enemies){
      if(!e.alive) continue;
      if(rectsHit(b.x,b.y,BLTW,BLTH,e.x,e.y,EN_W,EN_H)){
        e.hp--;
        if(e.hp<=0){
          e.alive=false;
          score+=ENEMY_PTS[e.type];
          if(score>highScore){highScore=score;save('si_highscore',highScore);}
          gainXP(ENEMY_XP[e.type]);
          spawnBurst(e.x+EN_W/2,e.y+EN_H/2,ENEMY_COLORS[e.type],8,2.5);
          sndDie();
          // Coins from boss levels on kills
          if(Math.random()<0.12){ metaCoins++; save('si_coins',metaCoins); sndCoin(); }
          // Shield drop
          if(RP.shieldDrop&&Math.random()<0.2) spawnShield(e.x+EN_W/2,e.y);
          killCount++;
          if(levelCfg(level).boss) bossPreKills++;
          checkLevelProgress();
        } else {
          spawnBurst(e.x+EN_W/2,e.y+EN_H/2,'#ffffff',3,1.5);
        }
        if(!RP.piercing){ playerBullets.splice(i,1); hit=true; break; }
      }
    }
    if(hit) continue;
  }
}

function tickEnemyBullets(){
  for(let i=enemyBullets.length-1;i>=0;i--){
    const b=enemyBullets[i];
    b.x+=b.vx; b.y+=b.vy;
    if(b.y>GAME_H||b.x<-20||b.x>GAME_W+20){enemyBullets.splice(i,1);continue;}
    if(player.invincible===0&&rectsHit(b.x,b.y,EBLTW,EBLTH,player.x,player.y,PLAYER_W,PLAYER_H)){
      enemyBullets.splice(i,1); hitPlayer();
    }
  }
}

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════
function rectsHit(ax,ay,aw,ah,bx,by,bw,bh){ return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by; }

let lives=3, flashTimer=0;

function hitPlayer(){
  if(player.invincible>0) return;
  lives--;
  player.invincible=RP.invFrames;
  flashTimer=18;
  spawnBurst(player.x+PLAYER_W/2,player.y+PLAYER_H/2,'#00ff00',16,3);
  sndPlayer();
  if(lives<=0){
    gameState=STATE.OVER;
    stopUfoDrone();
    levelActive=false;
  }
}

function gainXP(amount){
  xp+=amount;
  while(xp>=xpMax){
    xp-=xpMax;
    playerLv++;
    xpMax=Math.round(xpMax*1.3);
    pickUpgradeOffers();
    if(pickOffers.length>0) gameState=STATE.PICK;
  }
  updateXPBar();
}

function updateXPBar(){
  const pct=(xp/xpMax*100).toFixed(1);
  document.getElementById('xp-bar').style.width=pct+'%';
  document.getElementById('xp-label').textContent=`${xp}/${xpMax}`;
}

function checkLevelProgress(){
  const cfg=levelCfg(level);
  if(cfg.boss){
    // Spawn boss after prewaveKills
    if(!bossSpawned&&bossPreKills>=cfg.prewaveKills){ bossSpawned=true; spawnBoss(level); }
  } else {
    // Win regular level when quota met AND no enemies on screen
    if(killCount>=cfg.quota&&enemies.length===0&&!bossSpawned){ bossSpawned=true; winLevel(); }
  }
}

function winLevel(){
  sndLevelUp();
  gameState=STATE.WIN_LV;
  stopUfoDrone();
}

// ═══════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════
const STATE={START:'start',PLAY:'play',PAUSED:'paused',PICK:'pick',WIN_LV:'win_lv',WIN_GAME:'win_game',OVER:'over'};
let gameState=STATE.START;
let level=1;
let winTimer=0;

function startLevel(lv){
  level=lv;
  enemies.length=0; enemyBullets.length=0; playerBullets.length=0;
  shields.length=0; particles.length=0;
  killCount=0; bossPreKills=0; bossSpawned=false; boss=null;
  spawnTimer=600; // short delay before first spawn
  levelActive=true;
  gameState=STATE.PLAY;
}

function startRun(){
  score=0; lives=3; level=1; xp=0; xpMax=60; playerLv=0;
  player.x=GAME_W/2-PLAYER_W/2; player.invincible=0;
  Object.keys(RUN_UPG).forEach(k=>RUN_UPG[k]=0);
  RP=runParams();
  ufoSpawnTimer=performance.now();
  ufo.active=false; ufoPopup=null; stopUfoDrone();
  pickOffers=[]; pickFlash=null;
  updateXPBar();
  startLevel(1);
}

function continueRun(){
  // Resume same level with 1 life
  lives=1; player.x=GAME_W/2-PLAYER_W/2; player.invincible=RP.invFrames*2;
  flashTimer=0;
  startLevel(level);
}

// ═══════════════════════════════════════════
//  UPGRADE PICKER DRAW
// ═══════════════════════════════════════════
const CW=190, CH=200, CGAP=25;
const CXS=[(GAME_W-3*CW-2*CGAP)/2, (GAME_W-3*CW-2*CGAP)/2+CW+CGAP, (GAME_W-3*CW-2*CGAP)/2+2*(CW+CGAP)];
const CY=180;

function drawPicker(){
  ctx.fillStyle='rgba(0,0,0,0.88)'; ctx.fillRect(0,0,GAME_W,GAME_H);
  ctx.textAlign='center';
  ctx.fillStyle='#ffdd00'; ctx.font='bold 34px "Courier New"';
  ctx.fillText('LEVEL UP!', GAME_W/2, 80);
  ctx.fillStyle='#aaa'; ctx.font='16px "Courier New"';
  ctx.fillText('Choose an upgrade  —  press 1 · 2 · 3', GAME_W/2, 115);

  pickOffers.forEach((u,i)=>{
    const cx=CXS[i], cy=CY;
    ctx.fillStyle='#0a180a'; ctx.fillRect(cx,cy,CW,CH);
    ctx.strokeStyle='#00ff44'; ctx.lineWidth=2; ctx.strokeRect(cx,cy,CW,CH);
    ctx.fillStyle='#00ff44'; ctx.font='bold 14px "Courier New"'; ctx.textAlign='left';
    ctx.fillText(`[${i+1}]`,cx+8,cy+20);
    ctx.font='32px serif'; ctx.textAlign='center';
    ctx.fillText(u.icon, cx+CW/2, cy+70);
    ctx.fillStyle='#fff'; ctx.font='bold 14px "Courier New"';
    ctx.fillText(u.name, cx+CW/2, cy+100);
    ctx.fillStyle='#888'; ctx.font='11px "Courier New"';
    const words=u.desc.split(' '); let line='',ly=cy+118;
    for(const w of words){ const t=line?line+' '+w:w; if(t.length>22&&line){ctx.fillText(line,cx+CW/2,ly);line=w;ly+=14;}else line=t; }
    ctx.fillText(line,cx+CW/2,ly);
    const lvl=RUN_UPG[u.id];
    for(let d=0;d<u.max;d++){ctx.beginPath();ctx.arc(cx+CW/2+(d-(u.max-1)/2)*12,cy+CH-22,4,0,Math.PI*2);ctx.fillStyle=d<lvl?'#ffdd00':'#333';ctx.fill();}
  });

  if(pickFlash){ pickFlash.ttl--;const a=Math.min(1,pickFlash.ttl/25);ctx.globalAlpha=a;ctx.fillStyle=pickFlash.color;ctx.font='18px "Courier New"';ctx.textAlign='center';ctx.fillText(pickFlash.msg,GAME_W/2,CY+CH+35);ctx.globalAlpha=1;if(pickFlash.ttl<=0)pickFlash=null;}
  ctx.textAlign='left';
}

// ═══════════════════════════════════════════
//  OVERLAY / HUD
// ═══════════════════════════════════════════
function drawStars(ts){
  ctx.fillStyle='rgba(255,255,255,0.55)';
  for(let i=0;i<80;i++){const sx=(i*2531+7919)%GAME_W,sy=(i*5381+3571)%GAME_H,tw=Math.sin(ts*.001+i)>.5?1.5:1;ctx.fillRect(sx,sy,tw,tw);}
}
function drawGround(){ ctx.fillStyle='#00ff0030'; ctx.fillRect(0,GAME_H-26,GAME_W,2); }
function drawFlash(){ if(flashTimer<=0)return; ctx.fillStyle=`rgba(255,50,50,${flashTimer/18*.35})`; ctx.fillRect(0,0,GAME_W,GAME_H); flashTimer--; }
function drawBullets(){ for(const b of playerBullets){ ctx.fillStyle='#00ffff';ctx.fillRect(b.x,b.y,BLTW,BLTH);ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y,BLTW,3); } }

function drawHud(){
  document.getElementById('score').textContent     = score;
  document.getElementById('level').textContent     = `${level}/20`;
  document.getElementById('highscore').textContent = highScore;
  document.getElementById('lives').textContent     = '❤️ '.repeat(Math.max(lives,0)).trim()||'💀';
  document.getElementById('coins').textContent     = metaCoins;
}

function drawOverlay(title,sub,hint,tc='#00ff00'){
  ctx.fillStyle='rgba(0,0,0,0.80)';ctx.fillRect(0,0,GAME_W,GAME_H);
  ctx.textAlign='center';
  ctx.fillStyle=tc; ctx.font='bold 58px "Courier New"'; ctx.fillText(title,GAME_W/2,GAME_H/2-50);
  if(sub){ctx.fillStyle='#fff';ctx.font='22px "Courier New"';ctx.fillText(sub,GAME_W/2,GAME_H/2+10);}
  ctx.fillStyle='#00ff0088';ctx.font='17px "Courier New"';ctx.fillText(hint,GAME_W/2,GAME_H/2+60);
  ctx.textAlign='left';
}

// ═══════════════════════════════════════════
//  KILL PROGRESS BAR (top of canvas)
// ═══════════════════════════════════════════
function drawKillProgress(){
  if(gameState!==STATE.PLAY&&gameState!==STATE.PAUSED) return;
  const cfg=levelCfg(level);
  if(cfg.boss) return; // boss levels show boss HP bar instead
  const pct=Math.min(1,killCount/cfg.quota);
  const bw=200,bh=6,bx=GAME_W/2-bw/2,by=3;
  ctx.fillStyle='#002200'; ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle='#00ff44'; ctx.fillRect(bx,by,bw*pct,bh);
  ctx.strokeStyle='#00ff0055';ctx.lineWidth=1;ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle='#888';ctx.font='9px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`${killCount}/${cfg.quota}`,GAME_W/2,by+bh+8);
  ctx.textAlign='left';
}

// ═══════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════
const keys={};
window.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(e.code==='Space') e.preventDefault();

  if((e.code==='KeyP'||e.code==='Escape')&&gameState===STATE.PLAY) { gameState=STATE.PAUSED; return; }
  if((e.code==='KeyP'||e.code==='Escape')&&gameState===STATE.PAUSED){ gameState=STATE.PLAY;   return; }

  if(gameState===STATE.PICK){
    if(e.code==='Digit1') applyUpgrade(0);
    if(e.code==='Digit2') applyUpgrade(1);
    if(e.code==='Digit3') applyUpgrade(2);
    return;
  }

  if(gameState===STATE.WIN_LV){
    if(e.code==='Space'||e.code==='Enter'){
      if(level>=20){ gameState=STATE.WIN_GAME; }
      else { startLevel(level+1); }
    }
    return;
  }

  if(gameState===STATE.OVER){
    if(e.code==='Space'||e.code==='Enter'||e.code==='KeyR') startRun();
    return;
  }

  if(e.code==='Space'||e.code==='Enter'){
    if(gameState===STATE.START)    startRun();
    if(gameState===STATE.WIN_GAME) startRun();
    if(gameState===STATE.PAUSED)   gameState=STATE.PLAY;
  }
});
window.addEventListener('keyup',e=>{ keys[e.code]=false; });

// Click cards in picker
canvas.addEventListener('click',e=>{
  if(gameState!==STATE.PICK) return;
  const r=canvas.getBoundingClientRect();
  const mx=(e.clientX-r.left)*(GAME_W/r.width), my=(e.clientY-r.top)*(GAME_H/r.height);
  CXS.forEach((cx,i)=>{ if(mx>=cx&&mx<=cx+CW&&my>=CY&&my<=CY+CH) applyUpgrade(i); });
});

// ═══════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════
function update(ts){
  if(gameState!==STATE.PLAY) return;

  if(player.invincible>0) player.invincible--;

  const spd=RP.speed;
  if((keys['ArrowLeft'] ||keys['KeyA'])&&player.x>0)                player.x-=spd;
  if((keys['ArrowRight']||keys['KeyD'])&&player.x+PLAYER_W<GAME_W)  player.x+=spd;
  if((keys['ArrowUp']   ||keys['KeyW'])&&player.y>GAME_H*0.25)      player.y-=spd;
  if((keys['ArrowDown'] ||keys['KeyS'])&&player.y+PLAYER_H<GAME_H-20) player.y+=spd;
  tryFire(ts); // auto-fire at cooldown rate; Space/Z also works

  tickPlayerBullets();
  tickEnemyBullets();
  tickEnemies(ts);
  tickShields();
  tickUfo(ts);
  tickParticles();

  // Non-boss level win: enough kills + no enemies left
  const cfg=levelCfg(level);
  if(!cfg.boss&&!bossSpawned&&killCount>=cfg.quota&&enemies.length===0){
    bossSpawned=true; winLevel();
  }
}

function gameLoop(ts){
  ctx.clearRect(0,0,GAME_W,GAME_H);
  ctx.fillStyle='#000';ctx.fillRect(0,0,GAME_W,GAME_H);

  drawStars(ts);

  if(gameState===STATE.PICK){
    drawEnemies(); drawBullets(); drawEnemyBullets(); drawPlayer();
    drawPicker(); drawHud();
    requestAnimationFrame(gameLoop); return;
  }

  update(ts);
  drawKillProgress();
  drawGround();
  drawUfo(); drawUfoPopup();
  drawBoss();
  drawEnemies();
  drawShields();
  drawParticles();
  drawBullets();
  drawEnemyBullets();
  drawPlayer();
  drawFlash();
  drawHud();

  if(gameState===STATE.START)
    drawOverlay('SPACE','INVADERS','Press SPACE to start');
  else if(gameState===STATE.PAUSED)
    drawOverlay('PAUSED',null,'P or SPACE to resume','#ffdd00');
  else if(gameState===STATE.WIN_LV)
    drawOverlay('LEVEL CLEAR!',`Level ${level} complete!  Score: ${score}`,'Press SPACE for next level','#ffdd00');
  else if(gameState===STATE.OVER)
    drawOverlay('GAME OVER',`Score: ${score}  |  Level ${level}  |  Best: ${highScore}`,'Press SPACE to play again','#ff4466');
  else if(gameState===STATE.WIN_GAME)
    drawOverlay('YOU WIN!',`All 20 levels cleared!  Final score: ${score}`,'Press SPACE to play again','#ffdd00');

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ═══════════════════════════════════════════
//  TOUCH
// ═══════════════════════════════════════════
document.getElementById('btn-left').addEventListener('touchstart', ()=>{keys['ArrowLeft']=true;},{passive:true});
document.getElementById('btn-left').addEventListener('touchend',   ()=>{keys['ArrowLeft']=false;},{passive:true});
document.getElementById('btn-right').addEventListener('touchstart',()=>{keys['ArrowRight']=true;},{passive:true});
document.getElementById('btn-right').addEventListener('touchend',  ()=>{keys['ArrowRight']=false;},{passive:true});
document.getElementById('btn-fire').addEventListener('touchstart',e=>{e.preventDefault();keys['Space']=true;},{passive:false});
document.getElementById('btn-fire').addEventListener('touchend',  ()=>{keys['Space']=false;},{passive:true});
document.getElementById('btn-fire').addEventListener('mousedown', ()=>{keys['Space']=true;});
document.getElementById('btn-fire').addEventListener('mouseup',   ()=>{keys['Space']=false;});
