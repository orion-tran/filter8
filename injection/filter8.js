let scalar = 4;
let filtering = false;
//function that creates an On/Off Toggle
function toggleFiltering() {
  filtering = !filtering;

  if (filtering) filterOn(true);
  else filterOff();
}

let styleObject = undefined;
let urlMap = new Map();
let funObjects = [];

const newSpring = () => {
  return {
    position: Math.random(),
    target: Math.random(),
    velocity: 0.0,
    lastTime: new Date().getTime(),
    stiffness: 2.0,
    damping: 4.0,
  };
};
const epsilon = (a, b) => Math.abs(a - b) < 0.0001;

// spring type: {position, target, velocity, lastTime, stiffness, damping}
function updateSpring(spring) {
  const currentTime = new Date().getTime();
  const deltaTime = Math.min(currentTime - spring.lastTime, 100);
  if (deltaTime == 0) return spring;

  if (epsilon(spring.position, spring.target) && epsilon(0, spring.velocity)) {
    // the spring is not moving
    spring.position = spring.target;
    spring.velocity = 0;
    spring.lastTime = currentTime;
    return spring;
  }

  // scaled to reasonable units
  const delta = deltaTime / 40.0;
  spring.lastTime = currentTime;
  spring.velocity +=
    (1.0 / spring.stiffness) * (spring.target - spring.position) * delta;
  spring.velocity *= Math.pow(1.0 / spring.damping, delta);
  spring.position += spring.velocity * delta;

  return spring;
}

const newChar = (ref) => {
  return {
    springX: newSpring(),
    springY: newSpring(),
    springRot: newSpring(),
    ref: ref,
    updateAt: new Date().getTime(),
  };
};
// springyChar type: {springX, springY, springRot, ref, updateAt}
function updateSpringChar(char) {
  updateSpring(char.springX);
  updateSpring(char.springY);
  updateSpring(char.springRot);

  char.springRot.target = Math.sign(char.springX.velocity);
  char.ref.style.left = char.springX.position * window.innerWidth + "px";
  char.ref.style.top = char.springY.position * window.innerHeight + "px";
  char.ref.style.transform = `rotate3d(0, 1, 0, ${
    180 * char.springRot.position
  }deg)`;

  const currentTime = new Date().getTime();
  if (currentTime > char.updateAt) {
    char.updateAt = currentTime + Math.random() * 500 + 200;
    char.springX.target = Math.random();
    char.springY.target = Math.random();
  }
}

function filterOn(fun) {
  console.log("filtering ON!");

  styleObject = document.createElement("style");
  styleObject.innerHTML = `
  @font-face {
    font-family: 'PixelifySans';
    font-style: normal;
    src: url('${chrome.runtime.getURL(
      "popup/PixelifySans-Regular.woff2"
    )}') format('woff2');
  }

  * {
    font-family: 'PixelifySans' !important;
    border-radius: 0 !important;
  }
  
  #inject_overlay_filter8 {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: 100vw;
    position: fixed;
    z-index: 9999;
    select: none;
    pointer-events: none;
    opacity: 25%;
    background-image: url('${chrome.runtime.getURL("assets/8bit_night.jpg")}');
    background-size: cover;
    background-blend-mode: normal;
    overflow: none;
  }`;

  document.body.appendChild(styleObject);

  overlay = document.createElement("div");
  overlay.id = "inject_overlay_filter8";
  document.body.appendChild(overlay);

  const allImages = document.querySelectorAll("img");
  try {
    allImages.forEach((img) => {
      const imageCrusher = document.createElement("canvas");
      imageCrusher.width = img.clientWidth / scalar;
      imageCrusher.height = img.clientHeight / scalar;

      const context = imageCrusher.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, imageCrusher.width, imageCrusher.height);
      context.drawImage(
        img,
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
        0,
        0,
        imageCrusher.width,
        imageCrusher.height
      );

      const url = imageCrusher.toDataURL();
      urlMap.set(url, img.src);
      img.src = url;
      img.style.imageRendering = "pixelated";

      img.style.width = imageCrusher.width * scalar + "px";
      img.style.height = imageCrusher.height * scalar + "px";

      imageCrusher.remove();
    });
  } catch (e) {
    if (e.name != "SecurityError") {
      console.log(e.name);
    }
  }

  if (fun) {
    const possibleAssets = ["orion.png", "ryan.png", "sahand.png"];
    for (let i = 0; i < 10; i++) {
      const square = document.createElement("div");
      square.style.position = "absolute";
      square.style.width = "100px";
      square.style.height = "100px";
      square.style.background = `url("${chrome.runtime.getURL(
        "assets/" +
          possibleAssets[Math.floor(Math.random() * possibleAssets.length)]
      )}")`;
      square.style.zIndex = "999999";
      square.style.backgroundSize = "cover";
      overlay.appendChild(square);

      funObjects.push(newChar(square));
    }

    const frame = () => {
      funObjects.forEach((obj) => {
        updateSpringChar(obj);
      });
      if (filtering) requestAnimationFrame(frame);
      else {
        funObjects.forEach((obj) => {
          obj.ref.remove();
        });
        funObjects = [];
      }
    };

    requestAnimationFrame(frame);
  }
}

function filterOff() {
  console.log("filtering OFF!");

  if (styleObject) {
    styleObject.remove();
    styleObject = undefined;
  }

  document.querySelectorAll("img").forEach((img) => {
    if ((original = urlMap.get(img.src))) img.src = original;
  });

  urlMap = new Map();
}

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // if the popup is asking for state to update its rendering state
  if (request.action === "status") {
    sendResponse({ status: filtering });
  }
  if (request.action === "toggle") {
    toggleFiltering();
    sendResponse({ status: filtering });
  }
  if (request.action === "slider") {
    scalar = request.scale ? request.scale : scalar;
    if (filtering) {
      filterOff();
      filterOn(false);
    }
    sendResponse({ scale: scalar });
  }
});
