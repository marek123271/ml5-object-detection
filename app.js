// declare global variable
let video = null; // video element
let detector = null; // detector object
let detections = []; // store detection result
let videoVisibility = true;
let detecting = false;
let timeoutId;

// global HTML element
const toggleVideoEl = document.getElementById('toggleVideoEl');
const toggleDetectingEl = document.getElementById('toggleDetectingEl');

// set cursor to wait until video elment is loaded
document.body.style.cursor = 'wait';

// The preload() function if existed is called before the setup() function
function preload() {
  // create detector object from "cocossd" model
  detector = ml5.objectDetector('cocossd');
  console.log('detector object is loaded');
}

// The setup() function is called once when the program starts.
function setup() {
  // create canvas element with 640 width and 480 height in pixel
  createCanvas(640, 480);
  // Creates a new HTML5 <video> element that contains the audio/video feed from a webcam.
  // The element is separate from the canvas and is displayed by default.
  video = createCapture(VIDEO);
  video.size(640, 480);
  console.log('video element is created');
  video.elt.addEventListener('loadeddata', function() {
    // set cursor back to default
    if (video.elt.readyState >= 2) {
      document.body.style.cursor = 'default';
      console.log('video element is ready! Click "Start Detecting" to see the magic!');
    }
  });
}

// the draw() function continuously executes until the noLoop() function is called
function draw() {
  if (!video || !detecting) return;
  // draw video frame to canvas and place it at the top-left corner
  image(video, 0, 0);
  // draw all detected objects to the canvas
  for (let i = 0; i < detections.length; i++) {
    drawResult(detections[i]);
  }
}

/*
Exaple of an detect object
{
    "label": "person",
    "confidence": 0.8013999462127686,
    "x": 7.126655578613281,
    "y": 148.3782720565796,
    "width": 617.7880859375,
    "height": 331.60210132598877,
}
*/
function drawResult(object) {
  drawBoundingBox(object);
  drawLabel(object);
}

// draw bounding box around the detected object
// Initialize an empty string to store the detected objects
// Initialize an empty array to store the detected object labels
let detectedLabels = [];

function drawBoundingBox(object) {
  // Sets the color used to draw lines.
  stroke('green');
  // width of the stroke
  strokeWeight(4);
  // Disables filling geometry
  noFill();
  // draw a rectangle
  // x and y are the coordinates of the upper-left corner, followed by width and height
  rect(object.x, object.y, object.width, object.height);

  const detectedLabel = object.label;

  // Check if the label is not already in the array before adding it
  if (!detectedLabels.includes(detectedLabel)) {
    // Append the new detected label to the array
    detectedLabels.push(detectedLabel);

    // Update the innerHTML of the <div> by joining the labels with line breaks
    document.getElementById('detected').innerHTML = detectedLabels.join('<br>');
  }
  
}



// draw label of the detected object (inside the box)
function drawLabel(object) {
  // Disables drawing the stroke
  noStroke();
  // sets the color used to fill shapes
  fill('white');
  // set font size
  textSize(24);
  // draw string to canvas
  text(object.label, object.x + 10, object.y + 24);
}

// callback function. it is called when object is detected
function onDetected(error, results) {
  if (error) {
    console.error(error);
  }
  detections = results;
  // keep detecting object
  if (detecting) {
    detect(); 
  }
}

function detect() {
  // instruct "detector" object to start detect object from video element
  // and "onDetected" function is called when object is detected
  detector.detect(video, onDetected);
}

function toggleVideo() {
  if (!video) return;
  if (videoVisibility) {
    video.hide();
    toggleVideoEl.innerText = 'Show Video';
  } else {
    video.show();
    toggleVideoEl.innerText = 'Hide Video';
  }
  videoVisibility = !videoVisibility;
}

function toggleDetecting() {
  if (!video || !detector) return;
  if (!detecting) {
    detect();
    toggleDetectingEl.innerText = 'Stop Detecting';
  } else {
    toggleDetectingEl.innerText = 'Start Detecting';
  }
  detecting = !detecting;
}



// Callback function to display "CELLPHONE in list" and set a timeout
function showCellphoneMessage() {
  document.getElementById('detected').innerHTML = "CELLPHONE in list";
  
  // Set a timeout to clear the message after 5 seconds
  timeoutId = setTimeout(() => {
    document.getElementById('detected').innerHTML = detectedLabels.join('<br>');
  }, 5000);
}

// In the onDetected function, check if "cell phone" is detected
function onDetected(error, results) {
  if (error) {
    console.error(error);
  }
  
  detections = results;
  
  // Check if "cell phone" is detected
  const isCellphoneDetected = results.some(result => result.label === "cell phone");
  
  // If "cell phone" is detected, display the message and clear it after 5 seconds
  if (isCellphoneDetected) {
    showCellphoneMessage();
  }
  
  // Keep detecting objects
  if (detecting) {
    detect();
  }
}

// ...

// In the toggleDetecting function, clear the timeout before starting detection
function toggleDetecting() {
  if (!video || !detector) return;
  if (!detecting) {
    clearTimeout(timeoutId); // Clear any previous timeout
    detect();
    toggleDetectingEl.innerText = 'Stop Detecting';
  } else {
    toggleDetectingEl.innerText = 'Start Detecting';
  }
  detecting = !detecting;
}