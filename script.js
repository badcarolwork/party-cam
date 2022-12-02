(() => {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  let width; // We will scale the photo width to this
  let height; // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  let streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = null;
  let canvas = null;
  let frameCanvas = null;
  let photoCanvas = null;
  let photo = null;
  let photoData = null;
  let takePhotoBtn = null;
  let downloadbutton = null;
  let defaultFrame = document.querySelector(".default");
  let outputPhoto = document.querySelector(".output");

  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // Ensure that if our document is in a frame, we get the user
      // to first open it in its own tab or window. Otherwise, it
      // won't be able to request permission for camera access.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = "View live result of the example code above";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  function startup() {
    if (showViewLiveResultButton()) {
      return;
    }

    defaultFrame.style.display = "none";
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    frameCanvas = document.getElementById("frameCanvas");
    photoCanvas = document.getElementById("vidcanvas");
    photo = document.getElementById("photo");
    photoData = photo.getAttribute("src");
    // takePhotoBtn = document.getElementById("takePhotoBtn");
    downloadbutton = document.getElementById("picDownload");

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          // height = (video.videoHeight / video.videoWidth) * video.videoWidth;
          width = video.videoWidth;
          height = Math.round((video.videoWidth * 16) / 9);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.

          if (isNaN(height)) {
            width = video.videoWidth;
            height = Math.round((video.videoWidth * 16) / 9);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          setFrameCanvas();
        }
      },
      false
    );

    // takePhotoBtn.addEventListener(
    //   "click",
    //   (ev) => {
    //     takepicture();
    //     ev.preventDefault();
    //   },
    //   false
    // );

    downloadbutton.addEventListener(
      "click",
      (ev) => {
        download(photo.getAttribute("src"));
        ev.preventDefault();
      },
      false
    );

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  function download(url) {
    if (url !== null) {
      const a = document.createElement("a");
      a.href = url;
      a.download = "pfx.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      console.log("can't found url");
    }
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    const context = canvas.getContext("2d"); // main canvas
    if (width && height) {
      canvas.width = width;
      canvas.height = height;

      drawCameraPhoto();
      setTimeout(() => {
        context.drawImage(
          photoCanvas,
          0,
          80,
          video.videoWidth,
          video.videoHeight
        );
        setTimeout(() => {
          context.drawImage(frameCanvas, 0, 0, width, height);
          const data = canvas.toDataURL("image/png");
          photo.setAttribute("src", data);
          showPic(data);
        }, 500);
      }, 500);
    } else {
      clearphoto();
    }
  }

  function showPic() {
    if (photo.src !== "" || photo.src !== null) {
      downloadbutton.style.display = "block";
      outputPhoto.style.display = "block";
      outputPhoto.style.zIndex = 99;
      document.querySelector(".camera").style.display = "none";
    }
  }

  function setFrameCanvas() {
    const ctx = frameCanvas.getContext("2d");
    frameCanvas.width = width;
    frameCanvas.height = height;
    const image = new Image();
    image.src = "final.png";

    image.onload = function () {
      ctx.drawImage(image, 0, 0, width, height);
    };
  }

  function drawCameraPhoto() {
    const ctxVid = photoCanvas.getContext("2d");
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    ctxVid.translate(video.videoWidth, 0);
    ctxVid.scale(-1, 1);
    ctxVid.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const cameraData = photoCanvas.toDataURL("image/png");
    document.getElementById("vidphoto").setAttribute("src", cameraData);
  }

  // Set up our event listener to run the startup process
  startCamera.addEventListener("click", startup, false);
})();
