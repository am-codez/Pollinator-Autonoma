let pollinators = [];
let flowers = [];
let hazardZones = [];
let safeZones = [];
const maxFlowers = 7;
const maxPollinators = 10;
const pollenRegenerationTime = 160;
const hazardDamage = 5;
let hazardExpandTimer = 0;
const hazardExpandInterval = 10 * 60;

function setup() {
  createCanvas(800, 600);

  // Initialize flowers
  for (let i = 0; i < maxFlowers; i++) {
    let flowerX = random(100, width - 100);
    let flowerY = random(50, height - 50); // Avoid text area
    flowers.push(new Flower(flowerX, flowerY));
  }

  // Initialize pollinators
  for (let i = 0; i < maxPollinators; i++) {
    pollinators.push(new Pollinator(random(width), random(height)));
  }

  // Initialize hazard zones
  hazardZones.push(
    new Zone(random(width), random(height), 100, color(255, 0, 0, 100))
  );

  // Initialize safe zones
  safeZones.push(
    new Zone(random(width), random(height), 150, color(0, 255, 0, 50))
  );
}

function draw() {
  background(50);

  // Display the population count
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Pollinator Population: ${pollinators.length}`, 10, 10);

  // Increase hazard radius every 10 seconds
  hazardExpandTimer++;
  if (hazardExpandTimer >= hazardExpandInterval) {
    for (let hz of hazardZones) {
      hz.radius += 10;
    }
    hazardExpandTimer = 0; // Reset the timer
  }

  // Draw and handle flowers
  for (let i = flowers.length - 1; i >= 0; i--) {
    let flower = flowers[i];

    // Check if the flower is inside any hazard zone
    for (let hz of hazardZones) {
      if (hz.contains(flower.position)) {
        flowers.splice(i, 1); // Remove flower if inside a hazard zone
        break;
      }
    }

    if (i < flowers.length) {
      flower.show();
      flower.regenerate();
    }
  }

  // Draw and handle zones
  for (let hz of hazardZones) hz.show();
  for (let sz of safeZones) sz.show();

  // Draw and handle pollinators
  for (let i = pollinators.length - 1; i >= 0; i--) {
    let pollinator = pollinators[i];

    // Check hazard zone interaction and steer away
    let inHazard = false;
    for (let hz of hazardZones) {
      if (hz.contains(pollinator.position)) {
        inHazard = true;
        pollinator.lifespan -= hazardDamage;

        // Steer away from hazard zone
        let steerAway = p5.Vector.sub(pollinator.position, hz.position);
        steerAway.setMag(0.8); // Strength of avoidance
        pollinator.applyForce(steerAway);
      }
    }

    // Check safe zone interaction
    let inSafeZone = false;
    for (let sz of safeZones) {
      if (sz.contains(pollinator.position)) {
        inSafeZone = true;
        pollinator.inSafeZone = true;
      }
    }

    // Update lifespan if not in a hazard zone
    if (!inHazard) {
      pollinator.lifespan += 0.3; // Small lifespan increase over time
    }

    // Stop movement in safe zone and reproduce when 3 pollen eaten
    if (inSafeZone && pollinator.readyToReproduce()) {
      pollinators.push(pollinator.reproduce());
      pollinator.velocity.set(0, 0);
    } else {
      pollinator.update();
      pollinator.show();
      pollinator.pollinateFlowers(flowers);
    }

    // Prevent overlap
    pollinator.preventOverlap(pollinators);

    if (pollinator.isDead()) {
      pollinators.splice(i, 1);
    }
  }
}

function mousePressed() {
  // Add pollinator upon mouse press
  pollinators.push(new Pollinator(mouseX, mouseY));
}


// Pollinator Class
class Pollinator {
  constructor(x, y, parentSize = random(7.5, 15), parentSpeed = random(2, 4)) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector(0, 0);
    this.size = parentSize * 1.5;
    this.speed = parentSpeed;
    this.lifespan = 500;
    this.hasEaten = 0; // Track pollen consumed
    this.inSafeZone = false;
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.speed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan--;

    // Leave safe zone after moving
    this.inSafeZone = false;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  pollinateFlowers(flowers) {
    let closest = null;
    let minDist = Infinity;

    for (let flower of flowers) {
      if (flower.nectar > 0) {
        let d = dist(
          this.position.x,
          this.position.y,
          flower.position.x,
          flower.position.y
        );
        if (d < minDist) {
          minDist = d;
          closest = flower;
        }
      }
    }

    if (closest && minDist < 50) {
      // Close enough to pollinate and collect nectar
      closest.nectar--; // Decrease nectar
      closest.pollinated = true;
      this.lifespan = 500; // Reset lifespan
      this.hasEaten++; // Increment pollen count
    } else if (closest) {
      // Move toward closest flower
      let desired = p5.Vector.sub(closest.position, this.position);
      desired.setMag(this.speed);
      let steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(0.1);
      this.applyForce(steer);
    }
  }

  readyToReproduce() {
    if (this.hasEaten >= 3) {
      this.hasEaten = 0; // Reset pollen count
      return true;
    }
    return false;
  }

  reproduce() {
    return new Pollinator(
      this.position.x,
      this.position.y,
      this.size / 1.5,
      this.speed
    );
  }

  preventOverlap(pollinators) {
    let desiredSeparation = this.size * 1.5;
    for (let other of pollinators) {
      if (other !== this) {
        let d = dist(
          this.position.x,
          this.position.y,
          other.position.x,
          other.position.y
        );
        if (d < desiredSeparation) {
          let steer = p5.Vector.sub(this.position, other.position);
          steer.setMag(0.5); // Strength of repulsion
          this.applyForce(steer);
        }
      }
    }
  }

  isDead() {
    return this.lifespan <= 0;
  }

  show() {
    // Transition color from blue to red over lifespan
    let lifespanRemaining = this.lifespan / 60;
    let redAmount = map(this.lifespan, 0, 400, 255, 0);
    let blueAmount = map(this.lifespan, 0, 400, 0, 255);
    fill(
      lifespanRemaining < 5 ? color(255, 0, 0) : color(redAmount, 0, blueAmount)
    );
    noStroke();
    ellipse(this.position.x, this.position.y, this.size);
  }
}


// Flower Class
class Flower {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.nectar = 5; // Initial nectar supply
    this.maxNectar = 5;
    this.pollinated = false; // Track if the flower is pollinated
    this.regenerationCounter = 0;
  }

  regenerate() {
    this.regenerationCounter++;
    if (this.regenerationCounter >= pollenRegenerationTime) {
      if (this.nectar < this.maxNectar) {
        this.nectar++;
        this.pollinated = false;
      }
      this.regenerationCounter = 0;
    }
  }

  show() {
    // Draw flower petals - yellow if pollinated, pink otherwise
    fill(this.pollinated ? color(255, 200, 0) : color(255, 0, 150));
    noStroke();
    for (let i = 0; i < 6; i++) {
      let angle = (TWO_PI / 6) * i;
      let petalX = this.position.x + cos(angle) * 10;
      let petalY = this.position.y + sin(angle) * 10;
      ellipse(petalX, petalY, 10, 20);
    }

    // Draw flower center with nectar count
    fill(0, 255, 0);
    ellipse(this.position.x, this.position.y, 15);
    fill(255);
    textAlign(CENTER, CENTER);
    text(this.nectar, this.position.x, this.position.y - 20);
  }
}


// Zone Class
class Zone {
  constructor(x, y, radius, color) {
    this.position = createVector(x, y);
    this.radius = radius;
    this.color = color;
  }

  contains(position) {
    let d = dist(this.position.x, this.position.y, position.x, position.y);
    return d < this.radius;
  }

  show() {
    fill(this.color);
    noStroke();
    ellipse(this.position.x, this.position.y, this.radius * 2);
  }
}
