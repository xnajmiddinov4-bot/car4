/* Headless gameplay test. Stubs Three.js and runs the REAL car.js, map.js
   and parking.js. Run with: node test-gameplay.js  */
const fs = require('fs'), path = require('path'), vm = require('vm');

function V3(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
V3.prototype.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
V3.prototype.copy = function (v) { return this.set(v.x, v.y, v.z); };
V3.prototype.clone = function () { return new V3(this.x, this.y, this.z); };
V3.prototype.lerp = function (v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; this.z += (v.z - this.z) * t; return this; };

function Obj() {
  this.children = []; this.position = new V3(); this.rotation = { x: 0, y: 0, z: 0 };
  this.scale = new V3(1, 1, 1); this.isMesh = false; this.visible = true;
}
Obj.prototype.add = function () { for (const a of arguments) this.children.push(a); };
Obj.prototype.remove = function () {};
Obj.prototype.traverse = function (cb) { cb(this); this.children.forEach(c => c.traverse && c.traverse(cb)); };
Obj.prototype.updateMatrixWorld = function () {};
Obj.prototype.clone = function () { const c = new Obj(); c.position = this.position.clone(); c.material = this.material; c.isMesh = this.isMesh; return c; };

function Mesh(g, m) { Obj.call(this); this.geometry = g; this.material = m; this.isMesh = true; }
Mesh.prototype = Object.create(Obj.prototype); Mesh.prototype.constructor = Mesh;

function Mat(p) { Object.assign(this, p || {}); }
Mat.prototype.clone = function () { return new Mat(this); };

// BoxGeometry needs a real position attribute: taperBoxGeometry/slopeBoxEnd edit it.
function boxAttr(w, h, d) {
  const hx = w / 2, hy = h / 2, hz = d / 2;
  const pts = [];
  for (const sx of [-hx, hx]) for (const sy of [-hy, hy]) for (const sz of [-hz, hz]) pts.push([sx, sy, sz]);
  return {
    count: pts.length,
    needsUpdate: false,
    getX: i => pts[i][0], getY: i => pts[i][1], getZ: i => pts[i][2],
    setX: (i, v) => { pts[i][0] = v; }, setY: (i, v) => { pts[i][1] = v; }, setZ: (i, v) => { pts[i][2] = v; }
  };
}
function BoxGeometry(w = 1, h = 1, d = 1) { this.attributes = { position: boxAttr(w, h, d) }; }
BoxGeometry.prototype.computeVertexNormals = function () {};
function Plain() { this.attributes = { position: boxAttr(1, 1, 1) }; }
Plain.prototype.computeVertexNormals = function () {};

const THREE = {
  REVISION: '128',
  Vector3: V3, Group: Obj, Object3D: Obj, Mesh, Scene: Obj,
  Color: function () {}, Fog: function () {},
  BoxGeometry,
  PlaneGeometry: Plain, CircleGeometry: Plain, ConeGeometry: Plain,
  CylinderGeometry: Plain, SphereGeometry: Plain, RingGeometry: Plain, TorusGeometry: Plain,
  MeshStandardMaterial: Mat, MeshBasicMaterial: Mat,
  SpotLight: function () { const o = new Obj(); o.target = new Obj(); return o; },
  PointLight: Obj, DirectionalLight: Obj, HemisphereLight: Obj, AmbientLight: Obj,
  DoubleSide: 2, PCFSoftShadowMap: 1, sRGBEncoding: 3001,
  MathUtils: { clamp: (v, a, b) => Math.max(a, Math.min(b, v)) }
};

const sandbox = { window: {}, THREE, console, Math, Object, Array, String, Number, requestAnimationFrame: () => {} };
sandbox.window.THREE = THREE;
vm.createContext(sandbox);
for (const f of ['car.js', 'map.js', 'parking.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'js', f), 'utf8'), sandbox, { filename: f });
}

const { Car, VEHICLE_DEFS, buildKichikIttifoqMap, ParkingChecker } = sandbox.window;

let pass = 0, fail = 0;
const check = (n, c, x = '') => c ? (pass++, console.log('  PASS  ' + n)) : (fail++, console.log('  FAIL  ' + n + '   ' + x));

const scene = new Obj();
const map = buildKichikIttifoqMap(scene, { shadows: true });
const car = new Car(scene, 'cobalt');
const checker = new ParkingChecker(map.parkingZone);
const bay = map.parkingZone.center;

console.log('\n=== 1. WORLD ===');
check('map built with colliders', map.obstacles.length > 60, map.obstacles.length);
check('map exposes a parking zone and a spawn point', !!map.parkingZone && !!map.spawnPoint);
check('spawn point is clear of every obstacle', (() => {
  car.setPosition(map.spawnPoint.x, map.spawnPoint.z, map.spawnPoint.heading);
  return !car.update(0.016, { throttle: 0, steer: 0, brake: false }, map.obstacles).collided;
})());

console.log('\n=== 2. THE CAR (3D model) ===');
let meshCount = 0, shadowCasters = 0;
car.group.traverse(o => { if (o.isMesh) { meshCount++; if (o.castShadow) shadowCasters++; } });
check('Cobalt is built from many real 3D meshes', meshCount > 40, meshCount + ' meshes');
check('car casts shadows', shadowCasters > 30, shadowCasters);
check('car has 4 wheels', Object.keys(car.wheels).length === 4);
check('front wheels steer on their own pivots', Object.keys(car.steerPivots).length === 2);
check('car has headlights and beams', car.headlights.length === 2 && car.beams.length === 2);
check('car has brake lights', car.tailLights.length === 2);
check('all six Uzbek vehicles are defined', Object.keys(VEHICLE_DEFS).length === 6, Object.keys(VEHICLE_DEFS).join(','));
check('only the Cobalt starts unlocked',
  Object.keys(VEHICLE_DEFS).filter(k => VEHICLE_DEFS[k].unlocked).join() === 'cobalt');
check('every other vehicle also builds without error', (() => {
  try { Object.keys(VEHICLE_DEFS).forEach(k => new Car(new Obj(), k)); return true; }
  catch (e) { console.log('     ' + e.message); return false; }
})());

console.log('\n=== 3. DRIVING (W A S D) ===');
car.setPosition(0, -70, Math.PI);
const z0 = car.position.z;
for (let i = 0; i < 120; i++) car.update(1 / 60, { throttle: 1, steer: 0, brake: false }, map.obstacles);
check('W drives forward, toward the parking side of the map', car.position.z > z0 + 5, `z ${z0} -> ${car.position.z.toFixed(1)}`);
check('speed is capped at the vehicle limit', car.speed > 0 && car.speed <= car.maxSpeed + 0.01, car.speed.toFixed(2));
check('gear reads D when moving forward', car.gear === 'D');

for (let i = 0; i < 150; i++) car.update(1 / 60, { throttle: 0, steer: 0, brake: true }, map.obstacles);
check('Space brakes to a complete stop', car.speed === 0);

car.setPosition(0, -70, Math.PI);
for (let i = 0; i < 90; i++) car.update(1 / 60, { throttle: 1, steer: 1, brake: false }, map.obstacles);
const leftX = car.position.x;
car.setPosition(0, -70, Math.PI);
for (let i = 0; i < 90; i++) car.update(1 / 60, { throttle: 1, steer: -1, brake: false }, map.obstacles);
const rightX = car.position.x;
check('A and D steer to opposite sides', Math.sign(leftX) !== Math.sign(rightX) && Math.abs(leftX) > 0.5,
  `A->x=${leftX.toFixed(2)} D->x=${rightX.toFixed(2)}`);
check('front wheels visually turn with the steering', Math.abs(car.steerPivots.fl.rotation.y) > 0.1);

car.setPosition(0, -70, Math.PI);
for (let i = 0; i < 90; i++) car.update(1 / 60, { throttle: -1, steer: 0, brake: false }, map.obstacles);
check('S reverses', car.position.z < -70);
check('gear reads R in reverse', car.gear === 'R');
check('reverse is slower than forward', car.reverseMaxSpeed < car.maxSpeed);

console.log('\n=== 4. COLLISION ===');
car.damage = 0;
car.setPosition(4, 16, -Math.PI / 2);
let hit = false;
for (let i = 0; i < 400 && !hit; i++) hit = car.update(1 / 60, { throttle: 1, steer: 0, brake: false }, map.obstacles).collided;
check('car hits the roadside buildings', hit);
check('impact causes damage', car.damage > 0, car.damage.toFixed(1));
check('car does not pass through the building', car.position.x < 12, 'x=' + car.position.x.toFixed(2));

car.damage = 0;
car.setPosition(0, 100, Math.PI);
for (let i = 0; i < 2500; i++) car.update(1 / 60, { throttle: 1, steer: 0, brake: false }, map.obstacles);
check('car cannot leave the map', Math.abs(car.position.z) < 126, 'z=' + car.position.z.toFixed(1));

console.log('\n=== 5. PARKING DETECTION ===');
function tryPark(x, z, heading, speed, ticks = 120) {
  checker.reset();
  car.setPosition(x, z, heading);
  car.speed = speed || 0;
  let done = false, last = null;
  for (let i = 0; i < ticks; i++) { last = checker.update(car, 1 / 60); if (last.justCompleted) done = true; }
  return { done, last };
}
check('parked correctly -> COMPLETED', tryPark(bay.x, bay.z, Math.PI, 0).done);
check('parked crooked -> rejected', !tryPark(bay.x, bay.z, Math.PI + 1.1, 0).done);
check('outside the bay -> rejected', !tryPark(bay.x + 14, bay.z, Math.PI, 0).done);
check('rolling through the bay -> rejected', !tryPark(bay.x, bay.z, Math.PI, 8, 50).done);
check('reverse-parked -> COMPLETED', tryPark(bay.x, bay.z, 0, 0).done);
check('slightly off-centre but square -> COMPLETED', tryPark(bay.x + 1.4, bay.z - 1.5, Math.PI + 0.2, 0).done);
const neat = tryPark(bay.x, bay.z, Math.PI, 0);
const sloppy = tryPark(bay.x + 1.8, bay.z + 2.5, Math.PI + 0.4, 0);
check('accuracy rewards a neater park', neat.last.accuracy > sloppy.last.accuracy,
  neat.last.accuracy.toFixed(2) + ' vs ' + sloppy.last.accuracy.toFixed(2));

console.log('\n=== 6. FULL RUN: START -> DRIVE -> PARK ===');
car.setPosition(map.spawnPoint.x, map.spawnPoint.z, map.spawnPoint.heading);
car.damage = 0;
checker.reset();

const route = [
  { x: 0, z: -20 }, { x: 0, z: 40 }, { x: -2, z: 70 },
  { x: bay.x, z: bay.z - 9 }, { x: bay.x, z: bay.z }
];
let wp = 0, crashes = 0, seconds = 0;
for (let i = 0; i < 60 * 150; i++) {
  const t = route[wp];
  const dx = t.x - car.position.x, dz = t.z - car.position.z;
  const dist = Math.hypot(dx, dz);
  const last = wp === route.length - 1;
  if (!last && dist < 4) { wp++; continue; }

  let err = Math.atan2(-dx, -dz) - car.heading;
  while (err > Math.PI) err -= Math.PI * 2;
  while (err < -Math.PI) err += Math.PI * 2;

  const targetSpeed = last
    ? Math.min(2.5, Math.max(0, (dist - 0.25) * 1.6))
    : Math.min(Math.abs(err) > 0.5 ? 5 : 12, dist * 1.2);

  const r = car.update(1 / 60, {
    throttle: car.speed < targetSpeed - 0.2 ? 0.7 : 0,
    steer: Math.max(-1, Math.min(1, err * 2.5)),
    brake: car.speed > targetSpeed + 0.4
  }, map.obstacles);
  if (r.collided) crashes++;
  seconds += 1 / 60;
  if (checker.update(car, 1 / 60).justCompleted) break;
}
check('a normal driving route reaches the bay and completes', checker.completed,
  `x=${car.position.x.toFixed(1)} z=${car.position.z.toFixed(1)}`);
check('the route from START to PARKING is not blocked', crashes < 60, 'collision frames=' + crashes);
check('the run finishes in a sensible time', seconds > 5 && seconds < 120, seconds.toFixed(1) + 's');
check('a clean run takes no damage', car.damage < 5, car.damage.toFixed(1));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
