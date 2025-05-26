const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

const earringImg = new Image();
earringImg.src = 'earring.png'; // your earring image

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults((results) => {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  if (results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    
    // Left ear: landmark 234
    const leftEar = landmarks[234];

    const x = leftEar.x * canvasElement.width;
    const y = leftEar.y * canvasElement.height;

    canvasCtx.drawImage(earringImg, x - 15, y, 30, 50); // Adjust size/position
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 400,
  height: 300
});
camera.start();

