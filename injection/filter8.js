const backgrounds = [
  "assets/8bit_night.jpg",
  "assets/factory_8bit.png",
  "assets/alive_city_8bit.png",
];

let index = Math.random() < 0.5 ? 0 : 1;
let scalar = 4;
let filtering = false;
let funPixies = false;
let funOverlay = true;

function toggleFiltering() {
  filtering = !filtering;

  if (filtering) filterOn(funPixies, funOverlay);
  else filterOff(funPixies, funOverlay);
}

let styleObject = undefined;
let overlay = undefined;
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

function crush(imageCrusher, img) {
  try {
    imageCrusher.width = img.clientWidth / scalar;
    imageCrusher.height = img.clientHeight / scalar;

    const context = imageCrusher.getContext("2d");
    context.imageSmoothingEnabled = false;
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
    img.setAttribute("original_source", img.src);
    img.src = url;
    img.style.imageRendering = "pixelated";

    img.style.width = imageCrusher.width * scalar + "px";
    img.style.height = imageCrusher.height * scalar + "px";

    return true;
  } catch (error) {
    if (error.name != "SecurityError") console.log("err: " + error);
    return false;
  }
}

const clean = (ensure, obj) => {
  if (ensure && obj) {
    obj.remove();
    return undefined;
  }
  return obj;
}

function shadd() {
  let imageCrusher = document.createElement("canvas");
  const allImages = document.querySelectorAll("img");
  allImages.forEach((img) => {
    if (!img.complete) {
      //console.log("recovering from what would be a failure");
      img.addEventListener(
        "load",
        () => {
          const innerCrusher = document.createElement("canvas");
          crush(innerCrusher, img);
          innerCrusher.remove();
          //console.log("recovered!");
        },
        { once: true }
      );
    } else {
      if (!crush(imageCrusher, img)) {
        imageCrusher.remove();
        imageCrusher = document.createElement("canvas");
      }
    }
  });
  imageCrusher.remove();
}

function clearPixies() {
  funObjects.forEach((obj) => obj.ref.remove());
  funObjects = [];
}

function filterOn(pixies, bg, snap, crackle, pop) {
  shadd()

  styleObject = clean(true, styleObject);
  styleObject = document.createElement("style");
  styleObject.innerHTML = `
  @font-face {
    font-family: 'PixelifySans';
    font-style: normal;
    src: url('${chrome.runtime.getURL(
      "assets/PixelifySans-Regular.woff2"
    )}') format('woff2');
  }

  * {
    font-family: 'PixelifySans' !important;
    border-radius: 0 !important;
  }
  #inject_overlay_filter8 {${bg ? `\nbackground-image: url('${chrome.runtime.getURL(backgrounds[index])}');` : ""}
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: 100vw;
    position: fixed;
    z-index: 9999;
    user-select: none;
    pointer-events: none;
    opacity: 25%;
    background-size: contain;
    background-blend-mode: normal;
    overflow: hidden;
    image-rendering: pixelated;
  }`;

  document.body.appendChild(styleObject);

  overlay = document.createElement("div");
  overlay.id = "inject_overlay_filter8";
  document.body.appendChild(overlay);

  if (pixies) {
    const possibleAssets = ["orion.png", "ryan.png", "sahand.png"];
    for (let i = 0; i < 5; i++) {
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
      funObjects.forEach((obj) => updateSpringChar(obj));
      if (filtering) requestAnimationFrame(frame);
      else clearPixies();
    };

    requestAnimationFrame(frame);
  }
}

function filterOff(pixies, bg) {
  styleObject = clean(pixies, styleObject)
  overlay = clean(true, overlay)

  document.querySelectorAll("img").forEach((img) => {
    if (original = img.getAttribute("original_source")) img.src = original;
  });
}

function cycle() {
  filterOff(true, true);
  filterOn(funPixies, funOverlay);
}

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // if the popup is asking for state to update its rendering state
  if (request.action === "status") {
    sendResponse({ status: filtering, scale: scalar, pixiesVal: funPixies, overlayVal: funOverlay });
  }
  if (request.action === "toggle") {
    index = (index + 1) % 3;
    toggleFiltering();
    sendResponse({ status: filtering });
  }
  if (request.action === "slider") {
    scalar = request.scale;
    if (filtering) cycle();
    sendResponse({ scale: scalar });
  }
  if (request.action === "pixies") {
    funPixies = request.pixiesVal;
    if (filtering) cycle();
    sendResponse({ pixiesVal: funPixies });
  }
  if (request.action === "overlay") {
    funOverlay = request.overlayVal;
    if (filtering) cycle();
    sendResponse({ overlayVal: funOverlay });
  }
});
