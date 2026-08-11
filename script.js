const video = document.getElementById('video');
const scanBtn = document.getElementById('scan-btn');
const controls = document.getElementById('controls');
const popup = document.getElementById('payment-popup');
const friendNameDisplay = document.getElementById('friend-name');

// 1. YOUR DATABASE
const friendsDB = [
    { name: "Ashish", images: ["Aashish1.jpeg","Aashish2.jpeg","Aashish3.jpeg",], upiId: "6261195422@ptsbi",upiId: "6261668746@pthdfc"}
];
//lol
let faceMatcher;

// 🌟 TWEAK 1: FACE DETECTION SENSITIVITY
// Lowering minConfidence to 0.4 (default is 0.5) helps the AI find faces even in bad lighting or slight angles.
const detectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 });

// 1. Start Camera IMMEDIATELY when page loads
function startVideo() {
    scanBtn.innerText = "Requesting Camera...";
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }) 
        .then(stream => { 
            video.srcObject = stream; 
            scanBtn.innerText = "Loading AI Brain... Please wait.";
            scanBtn.disabled = true; // Keep button locked while AI loads
            
            // Now that we can see the camera, start loading the heavy models
            initializeAI(); 
        })
        .catch(err => alert("Camera access required!"));
}

// 2. Initialize AI (Wrapped in a function)
function initializeAI() {
    Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models')
    ]).then(async () => {
        scanBtn.innerText = "Memorizing Faces...";
        faceMatcher = await createFaceMatcher(); // Make sure this matches your function name!
        
        // Everything is ready! Unlock the button.
        scanBtn.innerText = "TAP TO SCAN FACE";
        scanBtn.disabled = false;
    });
}

// 3. Kick off the whole chain immediately
startVideo();

// 4. Memorize Faces (Now supports multiple photos!)
async function createFaceMatcher() {
    const labeledDescriptors = [];
    
    // Loop through each friend in the database
    for (const friend of friendsDB) {
        const friendVectors = []; // We will store all the different angles here
        
        // Loop through every photo name in their specific array
        for (const imageName of friend.images) {
            try {
                // Fetch the image from the friends folder
                const img = await faceapi.fetchImage(`./friends/${imageName}`);
                const detection = await faceapi.detectSingleFace(img, detectionOptions)
                                               .withFaceLandmarks()
                                               .withFaceDescriptor();
                
                if (detection) {
                    // Success! Save the 128 numbers for this specific angle
                    friendVectors.push(detection.descriptor); 
                } else {
                    console.warn(`Warning: Could not detect a clear face in ${imageName}.`);
                }
            } catch (e) {
                console.error(`Failed to load ${imageName}. Make sure the file name matches exactly!`, e);
            }
        }
        
        // If we successfully scanned at least one photo for this friend, add them to the AI's brain
        if (friendVectors.length > 0) {
            labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(friend.name, friendVectors));
        }
    }
    
    // 🌟 THE STRICTNESS THRESHOLD
    // Since we now have multiple angles, we can tighten the security.
    // 0.45 is very strict. It will only match if it is highly confident.
    return new faceapi.FaceMatcher(labeledDescriptors, 0.45);
}
// 5. Scan & Match Logic
scanBtn.addEventListener('click', async () => {
    scanBtn.innerText = "Analyzing Face...";
    scanBtn.disabled = true;

    try {
        // Apply the loosened detection options to the live camera
        const liveDetection = await faceapi.detectSingleFace(video, detectionOptions).withFaceLandmarks().withFaceDescriptor();
        
        if (!liveDetection) {
            alert("No face detected! Make sure you are in a well-lit area and looking near the camera.");
            scanBtn.innerText = "TAP TO SCAN FACE";
            scanBtn.disabled = false;
            return;
        }

        const bestMatch = faceMatcher.findBestMatch(liveDetection.descriptor);

        if (bestMatch.label !== 'unknown') {
            const matchedFriend = friendsDB.find(f => f.name === bestMatch.label);
            
            // Switch UI
            friendNameDisplay.innerText = `PAY ${matchedFriend.name.toUpperCase()}`;
            controls.style.display = "none";
            popup.style.display = "flex";
            
            // Setup Links
            document.getElementById('gpay-btn').onclick = () => window.location.href = `gpay://upi/pay?pa=${matchedFriend.upiId}&pn=${matchedFriend.name}`;
            document.getElementById('phonepe-btn').onclick = () => window.location.href = `phonepe://pay?pa=${matchedFriend.upiId}&pn=${matchedFriend.name}`;
            document.getElementById('paytm-btn').onclick = () => window.location.href = `paytmmp://pay?pa=${matchedFriend.upiId}&pn=${matchedFriend.name}`;
        } else {
            alert("Face not recognized! Are you registered in UR?");
            scanBtn.innerText = "TAP TO SCAN FACE";
            scanBtn.disabled = false;
        }
    } catch (error) {
        console.error("Scan error:", error);
        scanBtn.innerText = "TAP TO SCAN FACE";
        scanBtn.disabled = false;
    }
});

// 6. Reset UI
document.getElementById('reset-btn').addEventListener('click', () => {
    popup.style.display = "none";
    controls.style.display = "block";
    scanBtn.innerText = "TAP TO SCAN FACE";
    scanBtn.disabled = false;
});
