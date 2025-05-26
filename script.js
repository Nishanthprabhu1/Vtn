const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

const earringImg = new Image();
earringImg.src = 'earring.png';

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Simple smoothing buffer size
const SMOOTHING_FRAMES = 5;
let leftEarPositions = [];
let rightEarPositions = [];

// Smooth position helper
function smoothPositions(arr) {
  if (arr.length === 0) return null;
  const sum = arr.reduce((acc, pos) => {
    return { x: acc.x + pos.x, y: acc.y + pos.y };
  }, { x: 0, y: 0 });
  return { x: sum.x / arr.length, y: sum.y / arr.length };
}

// Set canvas size once when video metadata loaded
videoElement.addEventListener('loadedmetadata', () => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
});

faceMesh.onResults((results) => {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];

    // Get current left and right ear positions (in pixels)
    const leftEarRaw = {
      x: landmarks[234].x * canvasElement.width,
      y: landmarks[234].y * canvasElement.height,
    };
    const rightEarRaw = {
      x: landmarks[454].x * canvasElement.width,
      y: landmarks[454].y * canvasElement.height,
    };

    // Add to smoothing arrays
    leftEarPositions.push(leftEarRaw);
    rightEarPositions.push(rightEarRaw);

    if (leftEarPositions.length > SMOOTHING_FRAMES) leftEarPositions.shift();
    if (rightEarPositions.length > SMOOTHING_FRAMES) rightEarPositions.shift();

    // Calculate smoothed positions
    const leftEar = smoothPositions(leftEarPositions);
    const rightEar = smoothPositions(rightEarPositions);

    if (leftEar) {
      canvasCtx.drawImage(earringImg, leftEar.x - 20, leftEar.y, 40, 70);
    }
    if (rightEar) {
      canvasCtx.drawImage(earringImg, rightEar.x - 20, rightEar.y, 40, 70);
    }
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();
