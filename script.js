const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

const earringImg = new Image();
earringImg.src = 'earring.png'; // Your transparent earring image

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
    
    // LEFT EAR (Landmark 234)
    const leftEar = landmarks[234];
    const lx = leftEar.x * canvasElement.width;
    const ly = leftEar.y * canvasElement.height;
    canvasCtx.drawImage(earringImg, lx - 15, ly, 30, 50); // Adjust position/size

    // RIGHT EAR (Landmark 454)
    const rightEar = landmarks[454];
    const rx = rightEar.x * canvasElement.width;
    const ry = rightEar.y * canvasElement.height;
    canvasCtx.drawImage(earringImg, rx - 15, ry, 30, 50); // Adjust position/size
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
