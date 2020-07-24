(function () {
  function init() {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    const img = document.getElementById('bg');
    img.style.backgroundPosition = 'center';
    img.style.backgroundSize = 'cover';
    let velocity = 100;
    let distance = 0;
    let lastFrameRepaintTime = 0;

    function calcOffset(time) {
      let frameGapTime = time - lastFrameRepaintTime;
      lastFrameRepaintTime = time;
      let translateX = velocity * (frameGapTime / 1000);
      return translateX;
    }

    function drawCanvas(time) {
      distance -= calcOffset(time);

      if (distance < -img.width) {
        distance = 0;
      }
      ctx.clearRect(img, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(distance, 1);
      ctx.drawImage(img, 1, 0);
      ctx.drawImage(img, img.width, 0);

      requestAnimationFrame(drawCanvas);
      ctx.restore();
    }

    function startCanvas() {
      lastFrameRepaintTime = window.performance.now();
      requestAnimationFrame(drawCanvas);
    }
    startCanvas();
  }

  window.addEventListener('load', init);
})();
