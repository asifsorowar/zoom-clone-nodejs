const socket = io();

const videoGrid = document.querySelector(".video-grid");
const myVideo = document.createElement("video");

let myVideoStream;

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 112,
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    sendMessage();
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on(
    "stream",
    (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    },
    (err) => {
      console.log(err);
    }
  );
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;

  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const sendMessage = () => {
  //jquery
  let input = $("input");

  $("html").keydown((e) => {
    if (e.which === 13 && input.val().length !== 0) {
      socket.emit("message", input.val());
      input.val("");
    }
  });
  $(".message__button").click(() => {
    if (input.val().length !== 0) {
      socket.emit("message", input.val());
      input.val("");
    }
  });

  ///
  socket.on("createMessage", (message) => {
    $(".messages").append(
      `<li class='message'><b>user</b><br/>${message}</li>`
    );
    scrollToBottom();
  });
};

const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

// Mute video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setUnmuteButton = () => {
  const html = `
  <i class="fas fa-microphone-slash"></i>
  <span>Unmute</span>`;

  document.querySelector(".main__mute__button").innerHTML = html;
};

const setMuteButton = () => {
  const html = `
  <i class="fas fa-microphone"></i>
  <span>Mute</span>`;

  document.querySelector(".main__mute__button").innerHTML = html;
};

//Play video
const PlayPauseVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setPauseVideo();
  }
};

const setPlayVideo = () => {
  const html = `
  <i class="fas fa-video-slash"></i>
  <span>Play Video</span>`;

  document.querySelector(".main__video__button").innerHTML = html;
};

const setPauseVideo = () => {
  const html = `
  <i class="fas fa-video"></i>
  <span>Stop Video</span>`;

  document.querySelector(".main__video__button").innerHTML = html;
};

const leaveMeeting = () => {
  myVideoStream.getTracks().forEach(function (track) {
    if (track.readyState == "live") {
      track.stop();
    }
  });
};
