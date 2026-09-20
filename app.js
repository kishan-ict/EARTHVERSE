import * as THREE from 'three';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050811);
scene.fog = new THREE.FogExp2(0x060914, 0.035);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 160);
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

const ambientLight=new THREE.HemisphereLight(0x5577aa,0x08080d,1.15);scene.add(ambientLight);
const keyLight = new THREE.DirectionalLight(0xb8d7ff, 2.2); keyLight.position.set(-3, 8, 4); keyLight.castShadow = true; scene.add(keyLight);
const blueLight = new THREE.PointLight(0x1677ff, 45, 9, 2); blueLight.position.set(3, 2.4, -2.8); scene.add(blueLight);
const pinkLight = new THREE.PointLight(0xb126ff, 22, 7, 2); pinkLight.position.set(-4, 3, 0); scene.add(pinkLight);

const mat = (color, roughness=.55, metalness=.08) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const box = (name,size,pos,material,cast=true) => {const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m};

function canvasTexture(kind,size=1024){
 const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');
 if(kind==='wood'){
   x.fillStyle='#2b211c';x.fillRect(0,0,size,size);const plankH=128;
   for(let row=0;row<size/plankH;row++){
     const offset=row%2?160:0;
     for(let col=-1;col<5;col++){
       const px=col*260+offset,py=row*plankH;const tone=31+((row*19+col*13)%14);
       const grad=x.createLinearGradient(px,py,px,py+plankH);grad.addColorStop(0,`rgb(${tone+16},${tone+7},${tone+2})`);grad.addColorStop(.55,`rgb(${tone+5},${tone},${tone-3})`);grad.addColorStop(1,`rgb(${tone+14},${tone+6},${tone})`);x.fillStyle=grad;x.fillRect(px+2,py+2,256,plankH-4);
       x.strokeStyle='rgba(9,5,3,.62)';x.lineWidth=3;x.strokeRect(px,py,260,plankH);
       for(let g=0;g<7;g++){x.beginPath();x.strokeStyle=`rgba(130,91,62,${.035+g*.008})`;x.lineWidth=1;x.moveTo(px,py+18+g*14+Math.sin(g+row)*5);for(let q=0;q<=260;q+=20)x.lineTo(px+q,py+18+g*14+Math.sin(q*.035+g+col)*5);x.stroke()}
     }
   }
 }else if(kind==='wall'){
   x.fillStyle='#353941';x.fillRect(0,0,size,size);const img=x.getImageData(0,0,size,size);for(let i=0;i<img.data.length;i+=4){const n=(Math.random()-.5)*13;img.data[i]+=n;img.data[i+1]+=n;img.data[i+2]+=n;img.data[i+3]=255}x.putImageData(img,0,0);x.fillStyle='rgba(255,255,255,.018)';for(let i=0;i<900;i++)x.fillRect(Math.random()*size,Math.random()*size,Math.random()*3+1,Math.random()*3+1);
 }else{
   x.fillStyle='#111827';x.fillRect(0,0,size,size);for(let i=0;i<size;i+=16){x.strokeStyle=i%32?'rgba(85,111,147,.09)':'rgba(25,117,240,.12)';x.beginPath();x.moveTo(i,0);x.lineTo(i,size);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(size,i);x.stroke()}
 }
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}

const woodTexture=canvasTexture('wood');woodTexture.repeat.set(2.8,3.2);
const wallTexture=canvasTexture('wall',512);wallTexture.repeat.set(3,2);
const rugTexture=canvasTexture('rug',512);rugTexture.repeat.set(2,2);
const floorMaterial=new THREE.MeshPhysicalMaterial({map:woodTexture,color:0xb59078,roughness:.38,metalness:.02,clearcoat:.35,clearcoatRoughness:.45});
const wallMaterial=new THREE.MeshStandardMaterial({map:wallTexture,color:0x8d95a3,roughness:.94,metalness:0});

box('floor',[12,.2,12],[0,-.1,0],floorMaterial);
box('backWall',[12,6,.18],[0,3,-5.9],wallMaterial);
box('leftWall',[.18,6,12],[-5.9,3,0],wallMaterial);
box('rightWall',[.18,6,12],[5.9,3,0],wallMaterial);
box('ceiling',[12,.16,12],[0,6,0],mat(0x6f747c,.95,0),false);
const trimMat=mat(0x15191f,.62,.03);
box('backSkirting',[12,.22,.12],[0,.11,-5.77],trimMat);
box('leftSkirting',[.12,.22,11.55],[-5.77,.11,0],trimMat);
box('rightSkirting',[.12,.22,11.55],[5.77,.11,0],trimMat);
const rug=box('gamingRug',[4.5,.035,3.5],[1.9,.035,-1.5],new THREE.MeshStandardMaterial({map:rugTexture,color:0x8ba9d1,roughness:.98,metalness:0}),false);

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
 const skin=mat(0xb97858,.72);const skinSoft=mat(0xc48664,.78);const cloth=mat(0x1c75ff,.48);const dark=mat(0x111621,.68);const shoeMat=mat(0x080b11,.4,.25);const white=mat(0xf0f3f7,.5);const iris=mat(0x253f58,.3);const hairMat=mat(0x15100e,.9);
 const part=(geo,material,name,pos,scale=[1,1,1])=>{const m=new THREE.Mesh(geo,material);m.name=name;m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};

 // Anatomical torso: broad shoulders taper naturally into waist and hips.
 const chest=part(new THREE.CapsuleGeometry(.35,.48,8,16),cloth,'shirt',[0,1.48,0],[1.18,1,.72]);
 const waist=part(new THREE.CapsuleGeometry(.27,.26,6,14),cloth,'waist',[0,1.13,0],[1,.9,.72]);
 const hips=part(new THREE.CapsuleGeometry(.3,.18,6,14),dark,'hips',[0,.94,0],[1.08,.8,.78]);
 part(new THREE.CylinderGeometry(.14,.16,.16,16),skin,'neck',[0,1.94,0],[1,1,.9]);

 // Head with a slightly longer human skull, jaw, ears and visible facial features.
 const head=part(new THREE.SphereGeometry(.29,28,22),skinSoft,'head',[0,2.24,0],[.88,1.08,.9]);
 part(new THREE.SphereGeometry(.055,12,10),skinSoft,'leftEar',[-.27,2.24,0],[.55,1,.45]);
 part(new THREE.SphereGeometry(.055,12,10),skinSoft,'rightEar',[.27,2.24,0],[.55,1,.45]);
 part(new THREE.ConeGeometry(.045,.13,10),skinSoft,'nose',[0,2.24,-.27],[1,1,1]).rotation.x=-Math.PI/2;
 for(const x of [-.095,.095]){
   part(new THREE.SphereGeometry(.034,12,8),white,'eyeWhite',[x,2.31,-.255],[1.15,.65,.4]);
   part(new THREE.SphereGeometry(.015,10,8),iris,'eye',[x,2.31,-.274],[1,.8,.45]);
 }
 const mouth=part(new THREE.BoxGeometry(.1,.012,.012),mat(0x733f3d,.7),'mouth',[0,2.12,-.27]);mouth.rotation.z=.02;
 const hair=part(new THREE.SphereGeometry(.3,22,14,0,Math.PI*2,0,Math.PI*.58),hairMat,'hair',[0,2.35,.008],[.9,1,.92]);

 // Arms are built from separate upper arms, elbow joints, forearms and hands.
 const limbs={arms:[],legs:[]};
 for(const side of [-1,1]){
   part(new THREE.SphereGeometry(.19,16,12),cloth,side<0?'leftShoulder':'rightShoulder',[side*.43,1.67,0],[1,.9,.78]);
   const upper=part(new THREE.CapsuleGeometry(.095,.36,6,12),cloth,side<0?'leftUpperArm':'rightUpperArm',[side*.5,1.43,0],[1,1,.85]);upper.rotation.z=side*.08;
   part(new THREE.SphereGeometry(.105,14,10),skin,side<0?'leftElbow':'rightElbow',[side*.53,1.17,0],[1,.9,.9]);
   const fore=part(new THREE.CapsuleGeometry(.085,.32,6,12),skin,side<0?'leftForearm':'rightForearm',[side*.54,.94,0],[1,1,.82]);fore.rotation.z=-side*.025;
   part(new THREE.SphereGeometry(.105,16,12),skinSoft,side<0?'leftHand':'rightHand',[side*.54,.68,-.01],[.72,1.12,.52]);
   limbs.arms.push({upper,fore,side});
 }

 // Separate thighs, knees, calves and forward-facing feet give a human silhouette.
 for(const side of [-1,1]){
   const thigh=part(new THREE.CapsuleGeometry(.145,.38,7,14),dark,side<0?'leftThigh':'rightThigh',[side*.19,.66,0],[1.05,1,.9]);
   part(new THREE.SphereGeometry(.135,14,10),dark,side<0?'leftKnee':'rightKnee',[side*.19,.39,-.015],[1,.88,.9]);
   const calf=part(new THREE.CapsuleGeometry(.115,.31,6,12),dark,side<0?'leftCalf':'rightCalf',[side*.19,.18,0],[1,1,.86]);
   part(new THREE.BoxGeometry(.25,.13,.42),shoeMat,side<0?'leftShoe':'rightShoe',[side*.19,.07,-.1],[1,1,1]);
   limbs.legs.push({thigh,calf,side});
 }
 g.userData.limbs=limbs;g.userData.baseY={arms:limbs.arms.map(a=>a.upper.rotation.x),legs:limbs.legs.map(l=>l.thigh.rotation.x)};
 g.position.set(0,0,3.2);g.rotation.y=Math.PI;scene.add(g);return g;
}
const player=humanoid();

// First playable EARTHVERSE zone. It remains hidden while the player is in the room.
const roomObjects=scene.children.filter(o=>o!==player&&!o.isLight);
const worldGroup=new THREE.Group();worldGroup.visible=false;scene.add(worldGroup);
const worldMat=(color,roughness=.6,metalness=.1)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const worldBox=(size,pos,material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;worldGroup.add(m);return m};
// A believable first street: grass, asphalt, sidewalks, buildings, trees and street furniture.
const grass=new THREE.Mesh(new THREE.PlaneGeometry(120,140),worldMat(0x557a3c,1,0));grass.rotation.x=-Math.PI/2;grass.position.z=-25;grass.receiveShadow=true;worldGroup.add(grass);
const road=worldBox([12,.08,120],[0,.035,-25],worldMat(0x303238,.96,.02));
worldBox([.16,.025,120],[0,.09,-25],worldMat(0xf0d45c,.75,0));
for(let z=25;z>-85;z-=8){worldBox([.13,.035,4.2],[-3,.1,z],worldMat(0xf1f1e8,.72,0));worldBox([.13,.035,4.2],[3,.1,z],worldMat(0xf1f1e8,.72,0))}
for(const side of [-1,1]){
 worldBox([3,.22,120],[side*7.4,.11,-25],worldMat(0xb7b7b2,.94,0));
 worldBox([.3,.34,120],[side*5.95,.17,-25],worldMat(0xd0cfca,.9,0));
}
for(const crossZ of [-18,-50]){
 worldBox([70,.085,10],[0,.045,crossZ],worldMat(0x303238,.96,.02));
 worldBox([70,.03,.14],[0,.095,crossZ],worldMat(0xf0d45c,.75,0));
 for(let x=-30;x<=30;x+=7)worldBox([3.5,.035,.13],[x,.1,crossZ-2.5],worldMat(0xf1f1e8,.72,0));
}
for(let z=19;z>-76;z-=6){worldBox([.42,.32,1.8],[0,.2,z],worldMat(0xd6c85c,.8,0));}
function addBuilding(side,z,index){
 const width=7+(index%3)*1.4,depth=6+(index%2)*2,height=8+(index*5%13),x=side*(12+(index%2)*2);
 const colors=[0xb1a99e,0xd0c8bc,0x9aa6ae,0xc5b49f,0xa99e94];
 const building=worldBox([width,height,depth],[x,height/2,z],worldMat(colors[index%colors.length],.82,.02));
 worldBox([width+.18,.3,depth+.18],[x,height+.15,z],worldMat(0x565b60,.88,0));
 const faceX=x-side*(width/2+.011);
 const floors=Math.max(2,Math.floor(height/2.3));
 for(let f=0;f<floors;f++)for(let w=-1;w<=1;w++){
   const window=worldBox([.025,1.05,1.15],[faceX,1.5+f*2.15,z+w*(depth*.25)],new THREE.MeshPhysicalMaterial({color:0x8fc1d8,roughness:.22,metalness:.1,transparent:true,opacity:.84}));
   window.rotation.y=0;
 }
 const door=worldBox([.035,2.2,1.25],[faceX,1.1,z-depth*.3],worldMat(0x4c3527,.58,.08));
 return building;
}
for(let i=0;i<14;i++){const z=18-i*8.2;addBuilding(-1,z,i);addBuilding(1,z,i+2)}

function addTree(x,z,scale=1){
 const tree=new THREE.Group();tree.position.set(x,0,z);tree.scale.setScalar(scale);worldGroup.add(tree);
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,2.25,10),worldMat(0x76513a,.98));trunk.position.y=1.12;trunk.castShadow=true;tree.add(trunk);
 for(const p of [[0,2.75,0],[-.45,2.55,.15],[.42,2.62,.05],[0,3.2,.05]]){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.72,2),worldMat(0x3f743d,.95));crown.position.set(...p);crown.castShadow=true;tree.add(crown)}
}
function addLamp(x,z){
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,3.6,10),worldMat(0x30343a,.4,.65));pole.position.set(x,1.8,z);pole.castShadow=true;worldGroup.add(pole);
 const head=new THREE.Mesh(new THREE.BoxGeometry(.6,.12,.22),worldMat(0x24282d,.35,.65));head.position.set(x+(x<0?.25:-.25),3.55,z);worldGroup.add(head);
}
for(let z=20;z>-75;z-=10){addTree(-8.2,z,.85);addTree(8.2,z,.85);addLamp(-5.45,z-2);addLamp(5.45,z+3)}
function addTrafficLight(x,z,rotation=0){
 const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;worldGroup.add(group);
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,3.8,10),worldMat(0x252a2f,.35,.7));pole.position.y=1.9;group.add(pole);
 const caseMesh=new THREE.Mesh(new THREE.BoxGeometry(.45,1.2,.32),worldMat(0x171b1e,.5,.45));caseMesh.position.set(0,3.45,0);group.add(caseMesh);
 for(const [y,c] of [[3.78,0xd72828],[3.45,0xe7b72f],[3.12,0x25b85b]]){const light=new THREE.Mesh(new THREE.SphereGeometry(.105,14,10),new THREE.MeshBasicMaterial({color:c}));light.position.set(0,y,-.17);group.add(light)}
}
for(const z of [-13,-23,-45,-55]){addTrafficLight(-5.35,z);addTrafficLight(5.35,z)}

// Parked vehicles establish a human scale without adding heavy external assets.
const movingCars=[];
function addCar(x,z,color,moving=false,direction=-1){
 const car=new THREE.Group();car.position.set(x,.18,z);worldGroup.add(car);
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.75,.52,3.7),new THREE.MeshPhysicalMaterial({color,roughness:.28,metalness:.55,clearcoat:.75}));body.position.y=.45;body.castShadow=true;car.add(body);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.48,.62,1.9),new THREE.MeshPhysicalMaterial({color:0x94afbe,roughness:.15,metalness:.15,transparent:true,opacity:.86}));cabin.position.set(0,.98,-.15);car.add(cabin);
 for(const sx of [-1,1])for(const sz of [-1,1]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.18,18),worldMat(0x151515,.9));wheel.rotation.z=Math.PI/2;wheel.position.set(sx*.9,.34,sz*1.15);car.add(wheel)}
 car.userData={moving,direction,speed:3+Math.random()*2};if(moving)movingCars.push(car);return car;
}
addCar(-4,9,0x9b1c20);addCar(4,-8,0xe1e4e8);addCar(-4,-28,0x244b7a);
addCar(-2.1,20,0x324f82,true,-1);addCar(2.1,-62,0xd1a02d,true,1);addCar(-2.1,-8,0xeeeeee,true,-1);addCar(2.1,-38,0x317052,true,1);

function signTexture(title,subtitle,color){
 const c=document.createElement('canvas');c.width=768;c.height=384;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,c.width,c.height);x.fillStyle='rgba(0,0,0,.2)';x.fillRect(18,18,732,348);x.textAlign='center';x.fillStyle='#fff';x.font='800 64px sans-serif';x.fillText(title,384,170);x.font='600 28px sans-serif';x.fillText(subtitle,384,225);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=6;x.strokeRect(30,30,708,324);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function addPoster(x,y,z,title,subtitle,color,side){
 const p=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.55),new THREE.MeshBasicMaterial({map:signTexture(title,subtitle,color),side:THREE.DoubleSide}));p.position.set(x,y,z);p.rotation.y=side<0?-Math.PI/2:Math.PI/2;worldGroup.add(p);
}
addPoster(-8.85,3.2,5,'NOVA FRONT','UNITY · WORK · FUTURE','#2358a6',-1);addPoster(8.85,3.2,-4,'CITY OF STARS','A NEW FILM · FRIDAY','#8e2045',1);addPoster(-8.85,3.2,-34,'PEOPLE FIRST','NOVA FRONT RALLY','#d77820',-1);addPoster(8.85,3.2,-61,'BEYOND MARS','IN CINEMAS NOW','#3c236f',1);

const npcs=[];
function createNPC(role,x,z,color=0x4b7ca8){
 const g=new THREE.Group();g.position.set(x,0,z);g.userData={role,state:'idle',health:role==='police'?140:100,baseX:x,baseZ:z,phase:Math.random()*6.28};worldGroup.add(g);
 const skinNpc=worldMat([0x8e5d43,0xb77955,0xd19a72][Math.floor(Math.random()*3)],.8);const uniform=worldMat(color,.65,.04);const pants=worldMat(role==='police'?0x182333:0x252a31,.8);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.58,5,10),uniform);torso.position.y=1.28;torso.castShadow=true;g.add(torso);
 const headNpc=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),skinNpc);headNpc.position.y=1.95;headNpc.castShadow=true;g.add(headNpc);
 for(const sx of [-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.085,.5,4,8),pants);leg.position.set(sx*.13,.47,0);g.add(leg);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.48,4,8),skinNpc);arm.position.set(sx*.34,1.24,0);g.add(arm)}
 if(role==='police'){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.11,16),worldMat(0x172c4d,.5));cap.position.y=2.15;g.add(cap)}
 if(role==='politician'){const sash=new THREE.Mesh(new THREE.BoxGeometry(.11,.82,.03),worldMat(0xff8a23,.55));sash.position.set(0,1.35,-.24);sash.rotation.z=-.36;g.add(sash)}
 g.userData.body=torso;npcs.push(g);return g;
}
for(let i=0;i<26;i++){const side=i%2?-1:1;createNPC('civilian',side*(6.8+Math.random()*1.2),17-i*3.4,[0x3c7bb5,0xa74646,0x5a8c55,0x8a5f9f][i%4])}
createNPC('police',-4,-15,0x1d4f8c);createNPC('police',4,-47,0x1d4f8c);createNPC('police',-6,-53,0x1d4f8c);
const politician=createNPC('politician',8,-31,0xf2eee6);
for(let i=0;i<12;i++){const supporter=createNPC('supporter',8+(i%4)*1.05,-34-Math.floor(i/4)*1.2,0xe08725);supporter.rotation.y=Math.PI}
worldBox([5,.55,3],[9,.28,-30],worldMat(0x55575b,.8));
const rallyBanner=new THREE.Mesh(new THREE.PlaneGeometry(5,1.5),new THREE.MeshBasicMaterial({map:signTexture('NOVA FRONT','PUBLIC RALLY · PEOPLE FIRST','#d66e1e'),side:THREE.DoubleSide}));rallyBanner.position.set(9,2.4,-31.55);worldGroup.add(rallyBanner);

const portal=new THREE.Mesh(new THREE.TorusGeometry(1.65,.11,16,64),new THREE.MeshBasicMaterial({color:0x43c5ff}));portal.position.set(0,1.8,-18);worldGroup.add(portal);
const core=new THREE.Mesh(new THREE.CircleGeometry(1.55,48),new THREE.MeshBasicMaterial({color:0x55baff,transparent:true,opacity:.25,side:THREE.DoubleSide}));core.position.set(0,1.8,-18.03);worldGroup.add(core);
const worldBeacon=new THREE.PointLight(0x35adff,18,13,2);worldBeacon.position.set(0,2.5,-17);worldGroup.add(worldBeacon);
const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(3,24,16),new THREE.MeshBasicMaterial({color:0xfff2c4}));sunDisc.position.set(-36,35,-70);worldGroup.add(sunDisc);

let modalOpen=true, currentTarget=null, autoMove=null, yaw=0, pitch=0, bodyType='male', outfit=0x1c75ff, worldMode=false, transitionTimer=null;
player.visible=false;
const keys={};
scene.add(camera);
const weapon=new THREE.Group();weapon.visible=false;camera.add(weapon);weapon.position.set(.42,-.4,-.72);weapon.rotation.set(-.08,-.05,0);
const gunBody=new THREE.Mesh(new THREE.BoxGeometry(.18,.22,.7),worldMat(0x232a33,.3,.7));weapon.add(gunBody);const gunBarrel=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,.48,12),worldMat(0x11151b,.22,.8));gunBarrel.rotation.x=Math.PI/2;gunBarrel.position.set(0,.03,-.5);weapon.add(gunBarrel);
const muzzle=new THREE.PointLight(0xffb13b,0,3,2);muzzle.position.set(0,.03,-.78);weapon.add(muzzle);
const raycaster=new THREE.Raycaster();let lastShot=0;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e'&&!modalOpen&&currentTarget) interact(currentTarget);if(e.key.toLowerCase()==='q'&&worldMode&&!modalOpen)forceWave()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('mousemove',e=>{if(!modalOpen&&document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0025;pitch-=e.movementY*.0022;pitch=THREE.MathUtils.clamp(pitch,-1.25,1.25)}});
renderer.domElement.addEventListener('click',()=>{if(!modalOpen) renderer.domElement.requestPointerLock?.()});
addEventListener('mousedown',e=>{if(e.button===0&&worldMode&&!modalOpen&&document.pointerLockElement===renderer.domElement)shoot()});

function gunSound(){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),gain=a.createGain();o.type='square';o.frequency.setValueAtTime(125,a.currentTime);o.frequency.exponentialRampToValueAtTime(45,a.currentTime+.09);gain.gain.setValueAtTime(.12,a.currentTime);gain.gain.exponentialRampToValueAtTime(.001,a.currentTime+.12);o.connect(gain).connect(a.destination);o.start();o.stop(a.currentTime+.12)}catch{}}
function bloodEffect(position){for(let i=0;i<10;i++){const drop=new THREE.Mesh(new THREE.SphereGeometry(.025+Math.random()*.025,6,5),new THREE.MeshBasicMaterial({color:0xa70d12}));drop.position.copy(position);drop.userData.velocity=new THREE.Vector3((Math.random()-.5)*2,Math.random()*1.7,(Math.random()-.5)*2);drop.userData.life=1;worldGroup.add(drop);effects.push(drop)}}
const effects=[];
function alertNPCs(origin){npcs.forEach(n=>{if(n.userData.state==='down')return;const d=n.position.distanceTo(origin);if(d<25){if(n.userData.role==='police')n.userData.state='respond';else n.userData.state=Math.random()<.3?'down':'flee'}})}
function shoot(){const now=performance.now();if(now-lastShot<240)return;lastShot=now;gunSound();muzzle.intensity=12;setTimeout(()=>muzzle.intensity=0,45);weapon.position.z=-.65;setTimeout(()=>weapon.position.z=-.72,70);alertNPCs(player.position);raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const hits=raycaster.intersectObjects(npcs,true);if(hits.length){let target=hits[0].object;while(target.parent&&!npcs.includes(target))target=target.parent;if(npcs.includes(target)){target.userData.health-=55;target.userData.state=target.userData.health<=0?'down':'flee';bloodEffect(hits[0].point)}}}
function forceWave(){const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.7,48),new THREE.MeshBasicMaterial({color:0x52c7ff,transparent:true,opacity:.75,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.copy(player.position);ring.position.y=.12;ring.userData.life=1;worldGroup.add(ring);effects.push(ring);npcs.forEach(n=>{if(n.position.distanceTo(player.position)<10&&n.userData.state!=='down'){n.userData.state='flee';const away=n.position.clone().sub(player.position).normalize();n.position.addScaledVector(away,2.5)}});toast('Force Wave activated');}

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
 worldMode=true;roomObjects.forEach(o=>o.visible=false);worldGroup.visible=true;player.visible=false;player.position.set(0,0,5);player.rotation.y=Math.PI;yaw=0;pitch=0;
 scene.background=new THREE.Color(0x91b9d5);scene.fog=new THREE.Fog(0xb9cedb,38,115);renderer.toneMappingExposure=1.18;
 ambientLight.color.setHex(0xd8ebff);ambientLight.groundColor.setHex(0x65704c);ambientLight.intensity=2.25;
 keyLight.color.setHex(0xffe4bd);keyLight.intensity=4.1;keyLight.position.set(-22,32,16);keyLight.shadow.mapSize.set(2048,2048);
 blueLight.visible=false;pinkLight.visible=false;
 weapon.visible=true;$('#combatHud').classList.remove('hidden');
 $('#transition').classList.remove('active');$('.location').innerHTML='<span></span> EARTHVERSE · ARRIVAL DISTRICT';modalOpen=false;
 toast(`Welcome to Arrival District, ${name}. Explore with WASD.`);
}
function returnToRoom(){
 clearTimeout(transitionTimer);worldMode=false;worldGroup.visible=false;roomObjects.forEach(o=>o.visible=true);player.visible=false;player.position.set(0,0,3.2);player.rotation.y=Math.PI;yaw=0;pitch=0;
 scene.background=new THREE.Color(0x050811);scene.fog=new THREE.FogExp2(0x060914,.035);renderer.toneMappingExposure=1.05;
 ambientLight.color.setHex(0x5577aa);ambientLight.groundColor.setHex(0x08080d);ambientLight.intensity=1.15;
 keyLight.color.setHex(0xb8d7ff);keyLight.intensity=2.2;keyLight.position.set(-3,8,4);blueLight.visible=true;pinkLight.visible=true;
 weapon.visible=false;$('#combatHud').classList.add('hidden');
 $('#transition').classList.remove('active');$('.location').innerHTML='<span></span> GAMING ROOM · LOCAL REALITY';modalOpen=false;toast('Returned to your gaming room.');
}

const clock=new THREE.Clock();
function updatePlayer(dt){
 if(autoMove){const delta=autoMove.target.clone().sub(player.position);if(delta.length()<.12){const done=autoMove.done;autoMove=null;done();}else{delta.normalize();player.position.addScaledVector(delta,dt*2.1);player.rotation.y=Math.atan2(delta.x,delta.z);yaw=Math.atan2(-delta.x,-delta.z);pitch=THREE.MathUtils.lerp(pitch,0,dt*4);bob(dt,true)}return}
 if(modalOpen)return;
 const move=new THREE.Vector3((keys.d?1:0)-(keys.a?1:0),0,(keys.s?1:0)-(keys.w?1:0));
 if(move.length()){move.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);player.position.addScaledVector(move,dt*(worldMode?4.2:2.7));player.position.x=THREE.MathUtils.clamp(player.position.x,worldMode?-42:-5.2,worldMode?42:5.2);player.position.z=THREE.MathUtils.clamp(player.position.z,worldMode?-42:-5.2,worldMode?42:5.2);player.rotation.y=Math.atan2(move.x,move.z);bob(dt,true)}else bob(dt,false);
 if(worldMode){currentTarget=null;$('#interaction').classList.add('hidden');return}
 const targets=[['pc',new THREE.Vector3(2.8,0,-4.2),'Use Gaming PC'],['vr',new THREE.Vector3(-2.15,0,1.3),'Use VR Headset'],['wardrobe',new THREE.Vector3(-4.35,0,-1.2),'Open Wardrobe']];
 let nearest=null,min=1.75,label='';for(const [n,p,l] of targets){const d=player.position.distanceTo(p);if(d<min){min=d;nearest=n;label=l}}currentTarget=nearest;$('#interaction').classList.toggle('hidden',!nearest);$('#interactionText').textContent=label;
}
function updateWorldLife(dt){
 if(!worldMode)return;
 movingCars.forEach(c=>{c.position.z+=c.userData.direction*c.userData.speed*dt;if(c.position.z<-82)c.position.z=28;if(c.position.z>28)c.position.z=-82});
 npcs.forEach(n=>{
   const u=n.userData;if(u.state==='down'){n.rotation.z=THREE.MathUtils.lerp(n.rotation.z,Math.PI/2,dt*5);return}
   let dir=new THREE.Vector3();
   if(u.state==='flee'){dir.copy(n.position).sub(player.position).setY(0).normalize();if(n.position.distanceTo(player.position)>32)u.state='idle'}
   else if(u.state==='respond'){dir.copy(player.position).sub(n.position).setY(0).normalize();if(n.position.distanceTo(player.position)<4)u.state='guard'}
   else if(u.state==='idle'&&u.role==='civilian'){dir.set(0,0,Math.sin(performance.now()*.00035+u.phase)>0?1:-1)}
   if(dir.lengthSq()){n.position.addScaledVector(dir,dt*(u.state==='flee'?3.5:u.state==='respond'?2.8:.55));n.rotation.y=Math.atan2(dir.x,dir.z)}
 });
 for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.userData.life-=dt;if(e.geometry.type==='RingGeometry'){e.scale.addScalar(dt*8);e.material.opacity=e.userData.life*.7}else{e.userData.velocity.y-=4.5*dt;e.position.addScaledVector(e.userData.velocity,dt)}if(e.userData.life<=0){worldGroup.remove(e);e.geometry.dispose();e.material.dispose();effects.splice(i,1)}}
}
let step=0;function bob(dt,moving){
 step+=dt*(moving?9:3);player.position.y=moving?Math.abs(Math.sin(step))*.026:0;
 const limbs=player.userData.limbs;if(!limbs)return;const swing=moving?Math.sin(step)*.52:0;
 limbs.arms.forEach((a,i)=>{a.upper.rotation.x=THREE.MathUtils.lerp(a.upper.rotation.x,(i?1:-1)*swing,.18);a.fore.rotation.x=THREE.MathUtils.lerp(a.fore.rotation.x,Math.max(0,(i?-1:1)*swing)*.32,.16)});
 limbs.legs.forEach((l,i)=>{l.thigh.rotation.x=THREE.MathUtils.lerp(l.thigh.rotation.x,(i?-1:1)*swing,.2);l.calf.rotation.x=THREE.MathUtils.lerp(l.calf.rotation.x,Math.max(0,(i?1:-1)*swing)*.28,.18)});
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);updatePlayer(dt);updateWorldLife(dt);headsetGroup.rotation.y=Math.sin(performance.now()*.001)*.06;portal.rotation.z+=dt*.25;const eyeHeight=2.08;const desired=player.position.clone().add(new THREE.Vector3(0,eyeHeight,0));camera.position.lerp(desired,1-Math.pow(.00001,dt));camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;camera.rotation.z=0;renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
