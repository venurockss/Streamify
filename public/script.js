const userVideo = document.getElementById('user-video');
const startButton = document.getElementById('start-btn');
 
const socket = io();
const state = { media : null}
startButton.addEventListener('click',()=>{
  const mediaRecoder = new MediaRecorder(state.media,{
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
    framerate : 25,
  })

  mediaRecoder.ondataavailable = ev => {
    console.log("binary stram avilable",ev.data);
    socket.emit('binarystream',ev.data)
}
mediaRecoder.start(25);

})
window.addEventListener('load', async e => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    state.media =media;
    
    userVideo.srcObject = media;

})