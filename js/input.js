/**
 * Registers canvas, keyboard and viewport input for Fortress Commander.
 * Mutable game state stays in main.js and is accessed through callbacks.
 */
export function attachGameInput({
  canvas,
  startScreen,
  instructionsScreen,
  getZoom,
  setZoom,
  getCamera,
  setCamera,
  centerCamera,
  clampCamera,
  screenToWorld,
  worldTap,
  getBuildMode,
  getSelected,
  clearSelectionModes,
  isPaused,
  setPaused,
  isGameOver,
  setLastFrameTime,
  showToast,
  startWave,
  showPauseMenu,
  hidePauseMenu,
  resetGame,
  enterGame,
  returnToTitle,
  handleOrientationChange,
  isPhoneLandscape,
  resizeCanvas
}) {
  let pointerDown = null;
  let dragged = false;
  const touches = new Map();
  let pinchStart = 0;
  let pinchZoom = getZoom();
  let pinchCenter = null;

  const onWheel = event => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    setZoom(
      getZoom() * (event.deltaY > 0 ? 0.9 : 1.1),
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  };

  const onPointerDown = event => {
    canvas.setPointerCapture(event.pointerId);
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const camera = getCamera();
    pointerDown = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      camX: camera.x,
      camY: camera.y
    };
    dragged = false;

    if (touches.size === 2) {
      const points = [...touches.values()];
      pinchStart = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );
      pinchZoom = getZoom();
      pinchCenter = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
    }
  };

  const onPointerMove = event => {
    if (!touches.has(event.pointerId)) return;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (touches.size === 2) {
      const points = [...touches.values()];
      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );
      const rect = canvas.getBoundingClientRect();
      if (pinchStart > 0 && pinchCenter) {
        setZoom(
          pinchZoom * distance / pinchStart,
          pinchCenter.x - rect.left,
          pinchCenter.y - rect.top
        );
      }
      dragged = true;
      return;
    }

    if (pointerDown && pointerDown.id === event.pointerId) {
      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      if (Math.hypot(dx, dy) > 8) dragged = true;
      const zoom = getZoom();
      setCamera(pointerDown.camX - dx / zoom, pointerDown.camY - dy / zoom);
      clampCamera();
    }
  };

  const onPointerEnd = event => {
    if (!touches.has(event.pointerId)) return;
    touches.delete(event.pointerId);

    if (pointerDown && pointerDown.id === event.pointerId && !dragged) {
      if (isPaused() && !isGameOver()) {
        setPaused(false);
        setLastFrameTime(performance.now());
        showToast("Spiel fortgesetzt");
        if (touches.size === 0) pointerDown = null;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const worldPoint = screenToWorld(
        event.clientX - rect.left,
        event.clientY - rect.top
      );
      worldTap(worldPoint.x, worldPoint.y);
    }

    if (touches.size === 0) pointerDown = null;
  };

  const onKeyDown = event => {
    if (
      !startScreen.classList.contains("hidden") ||
      !instructionsScreen.classList.contains("hidden")
    ) {
      if (
        event.key === "Escape" &&
        !instructionsScreen.classList.contains("hidden")
      ) {
        returnToTitle();
      }
      if (
        event.key === "Enter" &&
        !startScreen.classList.contains("hidden")
      ) {
        enterGame();
      }
      return;
    }

    const panKeys = {
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
    };
    const pan = panKeys[event.key];
    if (pan) {
      event.preventDefault();
      const camera = getCamera();
      const step = (event.shiftKey ? 230 : 115) / Math.max(0.1, getZoom());
      setCamera(camera.x + pan[0] * step, camera.y + pan[1] * step);
      clampCamera();
      return;
    }
    if (event.key === "Home" && typeof centerCamera === "function") {
      event.preventDefault();
      centerCamera();
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      startWave();
    }
    if (event.key === "Escape") clearSelectionModes();
    if (event.key.toLowerCase() === "p") {
      if (isPaused()) hidePauseMenu(true);
      else showPauseMenu();
    }
    if (event.key.toLowerCase() === "r" && isGameOver()) resetGame();
  };

  const onResize = () => {
    handleOrientationChange();
    if (!isPhoneLandscape()) setTimeout(resizeCanvas, 60);
  };

  const onOrientationChange = () => {
    setTimeout(handleOrientationChange, 100);
  };

  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerEnd);
  canvas.addEventListener("pointercancel", onPointerEnd);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onOrientationChange);

  return () => {
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerEnd);
    canvas.removeEventListener("pointercancel", onPointerEnd);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onOrientationChange);
  };
}
