import * as THREE from 'three';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050811);
scene.fog = new THREE.FogExp2(0x060914, 0.035);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 5.4, 8.5);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
$('#game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x5577aa, 0x08080d, 1.15));
const keyLight = new THREE.DirectionalLight(0xb8d7ff, 2.2); keyLight.position.set(-3, 8, 4); keyLight.castShadow = true; scene.add(keyLight);
const blueLight = new THREE.PointLight(0x1677ff, 45, 9, 2); blueLight.position.set(3, 2.4, -2.8); scene.add(blueLight);
const pinkLight = new THREE.PointLight(0xb126ff, 22, 7, 2); pinkLight.position.set(-4, 3, 0); scene.add(pinkLight);

const mat = (color, roughness=.55, metalness=.08) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const box = (name,size,pos,material,cast=true) => {const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m};

box('floor',[12,.2,12],[0,-.1,0],mat(0x111622,.75,.25));
box('backWall',[12,6,.18],[0,3,-5.9],mat(0x111521,.82));
box('leftWall',[.18,6,12],[-5.9,3,0],mat(0x0b101a,.85));
box('rightWall',[.18,6,12],[5.9,3,0],mat(0x0b101a,.85));
const grid = new THREE.GridHelper(12,24,0x1d67be,0x172238); grid.position.y=.015; scene.add(grid);

// Bed and lounge corner
box('bedBase',[3.3,.55,2.1],[-3.8,.35,-4.25],mat(0x141824));
box('bed',[3.15,.28,2],[-3.8,.75,-4.25],mat(0x26334e));
box('pillow',[.95,.2,.55],[-4.65,1,-4.5],mat(0xdce5ef));

// Gaming desk and monitor
box('deskTop',[4,.18,1.45],[2.8,1.65,-4.75],mat(0x121722,.32,.6));
box('deskLeg',[.18,1.7,1.2],[1.08,.8,-4.75],mat(0x11131a,.35,.7));
box('deskLeg',[.18,1.7,1.2],[4.52,.8,-4.75],mat(0x11131a,.35,.7));
const monitor=box('pc',[2.45,1.45,.12],[2.8,2.65,-5.04],mat(0x05080e,.22,.35));
const screen=box('pcScreen',[2.25,1.24,.035],[2.8,2.65,-4.965],new THREE.MeshBasicMaterial({color:0x0a4fae}));
box('monitorStand',[.18,.75,.16],[2.8,1.98,-4.93],mat(0x141821,.25,.7));
box('keyboard',[1.65,.08,.48],[2.8,1.8,-4.3],mat(0x090c12,.25,.55));

// VR display table and headset
box('vrTable',[2.3,.16,1.4],[-2.15,1.18,1.25],mat(0x181e2a,.35,.55));
box('vrTableLeg',[.16,1.25,.16],[-3.05,.58,.75],mat(0x11151e,.35,.7));
box('vrTableLeg',[.16,1.25,.16],[-1.25,.58,1.75],mat(0x11151e,.35,.7));
const headsetGroup=new THREE.Group();headsetGroup.name='vr';headsetGroup.position.set(-2.15,1.55,1.25);scene.add(headsetGroup);
const visor=new THREE.Mesh(new THREE.BoxGeometry(1,.48,.5),mat(0x10141d,.2,.65));visor.castShadow=true;headsetGroup.add(visor);
const lens=new THREE.Mesh(new THREE.BoxGeometry(.75,.12,.015),new THREE.MeshBasicMaterial({color:0x1b85ff}));lens.position.set(0,0,.257);headsetGroup.add(lens);
const band=new THREE.Mesh(new THREE.TorusGeometry(.55,.055,8,24,Math.PI),mat(0x252c38,.4,.35));band.rotation.x=Math.PI/2;band.position.z=-.18;headsetGroup.add(band);

// Wall panels, neon and wardrobe
for(let i=0;i<5;i++) box('panel',[1.7,.04,.45],[-3.7+i*.55,3.8,-5.75],new THREE.MeshBasicMaterial({color:i%2?0x1f5db9:0x25344e}),false).rotation.z=-.18;
box('wardrobe',[2.25,3.4,.75],[-4.35,1.7,-1.55],mat(0x151b27,.5,.2));
box('wardrobeGlow',[1.9,2.95,.02],[-4.35,1.7,-1.16],new THREE.MeshBasicMaterial({color:0x142b50}),false);

function humanoid(){
 const g=new THREE.Group();g.name='player';
 const skin=mat(0xb97958,.7); const cloth=mat(0x1c75ff,.5); const dark=mat(0x10141d,.65);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.75,5,10),cloth);torso.position.y=1.35;torso.castShadow=true;torso.name='shirt';g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.31,20,16),skin);head.position.y=2.15;head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.32,16,8,0,Math.PI*2,0,Math.PI*.52),mat(0x16100d,.9));hair.position.y=2.25;g.add(hair);
 for(const x of [-.21,.21]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.68,4,8),dark);leg.position.set(x,.5,0);leg.castShadow=true;g.add(leg)}
 for(const x of [-.53,.53]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.62,4,8),skin);arm.position.set(x,1.38,0);arm.rotation.z=x>0?-.1:.1;arm.castShadow=true;g.add(arm)}
 g.position.set(0,0,3.2);g.rotation.y=Math.PI;scene.add(g);return g;
}
const player=humanoid();

// First playable EARTHVERSE zone. It remains hidden while the player is in the room.
const roomObjects=scene.children.filter(o=>o!==player&&!o.isLight);
const worldGroup=new THREE.Group();worldGroup.visible=false;scene.add(worldGroup);
const worldMat=(color,roughness=.6,metalness=.1)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const worldBox=(size,pos,material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;worldGroup.add(m);return m};
const worldGround=new THREE.Mesh(new THREE.PlaneGeometry(90,90),worldMat(0x101b28,.9));worldGround.rotation.x=-Math.PI/2;worldGround.receiveShadow=true;worldGroup.add(worldGround);
const worldGrid=new THREE.GridHelper(90,45,0x157de0,0x193047);worldGrid.position.y=.02;worldGroup.add(worldGrid);
for(let i=0;i<26;i++){
 const side=i%2===0?-1:1;const z=-8-Math.floor(i/2)*6;const height=3+(i*7%10);
 const building=worldBox([5+(i%3),height,4],[side*(7+(i%4)*2),height/2,z],worldMat(i%3===0?0x152d4b:0x182231,.5,.25));
 const strip=new THREE.Mesh(new THREE.BoxGeometry(.08,height*.7,4.02),new THREE.MeshBasicMaterial({color:i%2?0x1677ff:0x55d6ff}));strip.position.set(building.position.x+(side<0?2.54:-2.54),height/2,z);worldGroup.add(strip);
}
const portal=new THREE.Mesh(new THREE.TorusGeometry(2.2,.16,16,64),new THREE.MeshBasicMaterial({color:0x43c5ff}));portal.position.set(0,2.4,-9);worldGroup.add(portal);
const core=new THREE.Mesh(new THREE.CircleGeometry(2.05,48),new THREE.MeshBasicMaterial({color:0x0a3b85,transparent:true,opacity:.58,side:THREE.DoubleSide}));core.position.set(0,2.4,-9.03);worldGroup.add(core);
const worldBeacon=new THREE.PointLight(0x35adff,65,22,2);worldBeacon.position.set(0,4,-8);worldGroup.add(worldBeacon);

let modalOpen=true, currentTarget=null, autoMove=null, yaw=0, bodyType='male', outfit=0x1c75ff, worldMode=false, transitionTimer=null;
const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e'&&!modalOpen&&currentTarget) interact(currentTarget)});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('mousemove',e=>{if(!modalOpen&&document.pointerLockElement===renderer.domElement) yaw-=e.movementX*.0025});
renderer.domElement.addEventListener('click',()=>{if(!modalOpen) renderer.domElement.requestPointerLock?.()});

const show=(id)=>{modalOpen=true;document.exitPointerLock?.();$$('.modal-shell').forEach(x=>x.classList.remove('active'));$(id).classList.add('active')};
const closeModals=()=>{$$('.modal-shell').forEach(x=>x.classList.remove('active'));modalOpen=false};
const walkTo=(target,done)=>{closeModals();autoMove={target:new THREE.Vector3(...target),done};};

function interact(target){
 if(target==='pc') walkTo([2.8,0,-3.5],()=>show('#auth'));
 if(target==='vr') walkTo([-2.15,0,2.15],()=>show('#guestConfirm'));
 if(target==='wardrobe'){ const profile=JSON.parse(localStorage.getItem('earthverse_profile')||'null'); if(profile) show('#customizer'); else toast('Create an Official Gamer identity first.'); }
}
function toast(message){const t=$('#toast');t.textContent=message;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2800)}

$$('[data-action]').forEach(b=>b.addEventListener('click',()=>{
 const a=b.dataset.action;
 if(a==='guest') walkTo([-2.15,0,2.15],()=>show('#guestConfirm'));
 if(a==='official') walkTo([2.8,0,-3.5],()=>show('#auth'));
 if(a==='explore'||a==='cancel') closeModals();
 if(a==='enterGuest') enterWorld('GUEST');
 if(a==='saveIdentity') saveIdentity();
 if(a==='returnRoom') returnToRoom();
}));

$$('[data-tab]').forEach(t=>t.addEventListener('click',()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===t));$$('.form').forEach(x=>x.classList.remove('active'));$('#'+t.dataset.tab+'Form').classList.add('active')}));
$('#loginForm').addEventListener('submit',e=>{e.preventDefault();const p=localStorage.getItem('earthverse_profile');if(!p)return toast('No local identity found. Choose “This is my first time”.');closeModals();enterWorld(JSON.parse(p).name)});
$('#registerForm').addEventListener('submit',e=>{e.preventDefault();if($('#password').value!==$('#confirmPassword').value)return toast('Passwords do not match.');startProcessing()});

function startProcessing(){
 show('#processing');let elapsed=0;const tips=['Synchronizing your Earthverse profile…','Use WASD to move and your mouse to look around.','Press E when an interaction prompt appears.','Every new player begins with basic interaction abilities.','Your choices shape your reputation and future.'];
 const interval=setInterval(()=>{elapsed+=.1;const pct=Math.min(100,Math.round(elapsed/15*100));$('#percent').textContent=pct+'%';$('.progress i').style.width=pct+'%';$('#tip').textContent=tips[Math.min(4,Math.floor(elapsed/3))];if(elapsed>=15){clearInterval(interval);show('#customizer')}},100);
}

$$('[data-body]').forEach(b=>b.addEventListener('click',()=>{bodyType=b.dataset.body;$$('[data-body]').forEach(x=>x.classList.toggle('active',x===b));player.scale.x=bodyType==='female'?.9:1}));
$$('[data-color]').forEach(b=>b.addEventListener('click',()=>{outfit=Number(b.dataset.color);$$('[data-color]').forEach(x=>x.classList.toggle('active',x===b));player.getObjectByName('shirt').material.color.setHex(outfit)}));
function saveIdentity(){
 const old=JSON.parse(localStorage.getItem('earthverse_profile')||'null');const name=$('#playerName').value||old?.name||'OFFICIAL GAMER';const now=Date.now();
 if(old&&old.body!==bodyType&&now<old.bodyChangeAvailableAt){const left=Math.ceil((old.bodyChangeAvailableAt-now)/86400000);return toast(`Body change locked for ${left} more day(s).`)}
 localStorage.setItem('earthverse_profile',JSON.stringify({name,body:bodyType,outfit,bodyChangeAvailableAt:old?.body===bodyType?old.bodyChangeAvailableAt:now+7*86400000}));enterWorld(name);
}
function enterWorld(name){
 closeModals();player.visible=false;$('#transition').classList.add('active');$('.transition p').textContent=`WELCOME ${name.toUpperCase()} · ENTERING THE WORLD BEYOND REALITY`;
 clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>activateWorld(name),3200);
}
function activateWorld(name){
 worldMode=true;roomObjects.forEach(o=>o.visible=false);worldGroup.visible=true;player.visible=true;player.position.set(0,0,5);player.rotation.y=Math.PI;yaw=0;
 $('#transition').classList.remove('active');$('.location').innerHTML='<span></span> EARTHVERSE · ARRIVAL DISTRICT';modalOpen=false;
 toast(`Welcome to Arrival District, ${name}. Explore with WASD.`);
}
function returnToRoom(){
 clearTimeout(transitionTimer);worldMode=false;worldGroup.visible=false;roomObjects.forEach(o=>o.visible=true);player.visible=true;player.position.set(0,0,3.2);player.rotation.y=Math.PI;yaw=0;
 $('#transition').classList.remove('active');$('.location').innerHTML='<span></span> GAMING ROOM · LOCAL REALITY';modalOpen=false;toast('Returned to your gaming room.');
}

const clock=new THREE.Clock();
function updatePlayer(dt){
 if(autoMove){const delta=autoMove.target.clone().sub(player.position);if(delta.length()<.12){const done=autoMove.done;autoMove=null;done();}else{delta.normalize();player.position.addScaledVector(delta,dt*2.1);player.rotation.y=Math.atan2(delta.x,delta.z);bob(dt,true)}return}
 if(modalOpen)return;
 const move=new THREE.Vector3((keys.d?1:0)-(keys.a?1:0),0,(keys.s?1:0)-(keys.w?1:0));
 if(move.length()){move.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);player.position.addScaledVector(move,dt*(worldMode?4.2:2.7));player.position.x=THREE.MathUtils.clamp(player.position.x,worldMode?-42:-5.2,worldMode?42:5.2);player.position.z=THREE.MathUtils.clamp(player.position.z,worldMode?-42:-5.2,worldMode?42:5.2);player.rotation.y=Math.atan2(move.x,move.z);bob(dt,true)}else bob(dt,false);
 if(worldMode){currentTarget=null;$('#interaction').classList.add('hidden');return}
 const targets=[['pc',new THREE.Vector3(2.8,0,-4.2),'Use Gaming PC'],['vr',new THREE.Vector3(-2.15,0,1.3),'Use VR Headset'],['wardrobe',new THREE.Vector3(-4.35,0,-1.2),'Open Wardrobe']];
 let nearest=null,min=1.75,label='';for(const [n,p,l] of targets){const d=player.position.distanceTo(p);if(d<min){min=d;nearest=n;label=l}}currentTarget=nearest;$('#interaction').classList.toggle('hidden',!nearest);$('#interactionText').textContent=label;
}
let step=0;function bob(dt,moving){step+=dt*(moving?9:3);player.position.y=moving?Math.abs(Math.sin(step))*.035:0}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);updatePlayer(dt);headsetGroup.rotation.y=Math.sin(performance.now()*.001)*.06;portal.rotation.z+=dt*.25;const desired=player.position.clone().add(new THREE.Vector3(0,4.1,6.3).applyAxisAngle(new THREE.Vector3(0,1,0),yaw));camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.position.x,1.25,player.position.z);renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
