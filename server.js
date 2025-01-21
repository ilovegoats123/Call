// WebRTC: Start Video Call
startCallButton.addEventListener('click', async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(servers);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("webrtc-signaling", {
                type: "candidate",
                target: "remote-user-id",
                payload: event.candidate
            });
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("webrtc-signaling", {
        type: "offer",
        target: "remote-user-id",
        payload: offer
    });
});

// Mute/Unmute microphone functionality
muteButton.addEventListener("click", () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        muteButton.textContent = audioTrack.enabled ? "Mute" : "Unmute";
    }
});
