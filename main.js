import * as THREE from 'three';

/* ---------- Scene Setup ---------- */
const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 40, 120);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 18, 40);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* ---------- Lights ---------- */
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const keyLight = new THREE.PointLight(0xffffff, 1.4);
keyLight.position.set(0, 0, 0);
scene.add(keyLight);

/* ---------- Materials ---------- */
const mat = (color) =>
new THREE.MeshPhongMaterial({
color,
flatShading: true
});

/* ---------- Content Data ---------- */
const CONTENT = {
sun: {
title: 'About Me',
text: 'Aaron Lad: Ambitious CS student at UofA. Passionate about end-to-end product building, technical execution, and UX strategy.'
},
edu: {
title: 'Education & Certifications',
text: 'BSc in Computing Science (Economics Minor) at University of Alberta. Certifications from Coursera: Management Skills (UofLondon), Marketing Mix (IE University), Python Programming (Rice), Strategic Management (Copenhagen Business School).'
},
work: {
title: 'Work Experience',
text: 'Partner & Head of Web Development at Unconventional Media (Led 10+ business projects). Line Cook at Earls Kitchen + Bar (Workflow optimization). Associate at Hydrotec International.'
},
skills: {
title: 'Skills & Hobbies',
text: 'Technical Skills: Python, JS, HTML/CSS, Git, Streamlit, AI/ML Prototyping. Interests: Economics, Finance, Product Design, Content Creation, Cooking, Sports.'
},
projects: {
title: 'Projects',
text: 'Algorithm Visual Playground, Gitabot (Bhagavad Gita AI), AI Text-to-Audio Tool, ASL Learning Prototype, AI YouTube Channel (30k+ views).'
},
connect: {
title: 'Connect',
text: 'LinkedIn | GitHub | Email: ladaaron15@gmail.com'
}
};

/* ---------- Objects ---------- */
const clickable = [];

// Sun
const sun = new THREE.Mesh(new THREE.SphereGeometry(4, 6, 6), mat(0xffaa33));
sun.userData = CONTENT.sun;
scene.add(sun);
clickable.push(sun);

// Planets
const planets = [
{ r: 1.6, d: 10, c: 0x3399ff, data: CONTENT.edu },
{ r: 1.8, d: 15, c: 0xff4444, data: CONTENT.work },
{ r: 1.7, d: 20, c: 0x44cc66, data: CONTENT.skills },
{ r: 1.9, d: 26, c: 0xaa66ff, data: CONTENT.projects }
];

const planetMeshes = planets.map((p) => {
const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 6, 6), mat(p.c));
mesh.userData = p.data;
scene.add(mesh);
clickable.push(mesh);
return mesh;
});

/* ---------- Rocket ---------- */
const rocket = new THREE.Group();
rocket.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2, 6), mat(0xffffff)));
const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 6), mat(0xff5722));
nose.position.y = 1.4;
rocket.add(nose);
rocket.userData = CONTENT.connect;
scene.add(rocket);
clickable.push(rocket);

/* ---------- Starfield ---------- */
const starGeo = new THREE.BufferGeometry();
const starCount = 600;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 400;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6 })));

/* ---------- Meteors ---------- */
const meteors = [];
for (let i = 0; i < 6; i++) {
const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), mat(0x888888));
m.position.set(Math.random() * 80 - 40, Math.random() * 40, -60);
scene.add(m);
meteors.push(m);
}

/* ---------- Interaction ---------- */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const overlay = document.getElementById('overlay');
const titleEl = document.getElementById('modal-title');
const contentEl = document.getElementById('modal-content');
const resetBtn = document.getElementById('resetCamera');

let targetCam = null;

window.addEventListener('click', (e) => {
mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
raycaster.setFromCamera(mouse, camera);
const hit = raycaster.intersectObjects(clickable)[0];
if (hit) {
titleEl.textContent = hit.object.userData.title;
contentEl.textContent = hit.object.userData.text;
overlay.classList.remove('hidden');
targetCam = hit.object.position.clone().add(new THREE.Vector3(0, 2, 6));
}
});

resetBtn.onclick = () => {
overlay.classList.add('hidden');
targetCam = new THREE.Vector3(0, 18, 40);
};

/* ---------- Animation ---------- */
const clock = new THREE.Clock();

function animate() {
const t = clock.getElapsedTime();

planetMeshes.forEach((p, i) => {
const d = planets[i].d;
p.position.set(Math.cos(t * 0.4 + i) * d, 0, Math.sin(t * 0.4 + i) * d);
p.rotation.y += 0.01;
});

rocket.position.set(Math.cos(t * 2) * 18, Math.sin(t) * 6, Math.sin(t * 2) * 18);
rocket.lookAt(0, 0, 0);

meteors.forEach((m) => {
m.position.z += 0.8;
if (m.position.z > 20) m.position.z = -80;
});

if (targetCam) camera.position.lerp(targetCam, 0.05);
camera.lookAt(0, 0, 0);

renderer.render(scene, camera);
requestAnimationFrame(animate);
}

animate();

/* ---------- Resize ---------- */
window.addEventListener('resize', () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});
