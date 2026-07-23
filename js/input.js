/**
 * Registers canvas, keyboard and viewport input for Fortress Commander.
 * Mutable game state stays in main.js and is accessed through callbacks.
 */
export function attachGameInput({
  canvas,
  startScreen,
  campaignMapScreen,
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
  cancelAction,
  hasBlockingPanelOpen,
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
  let dragActive = false;
  const touches = new Map();
  let pinchState = null;
  let pinchActive = false;

  const pointerPosition = event => ({
    x: event.clientX,
    y: event.clientY,
    pointerType: event.pointerType || "mouse"
  });

  const beginPinch = () => {
    if (touches.size < 2) return;
    const rect = canvas.getBoundingClientRect();
    const points = [...touches.values()].slice(0, 2);
    const centerX = (points[0].x + points[1].x) / 2 - rect.left;
    const centerY = (points[0].y + points[1].y) / 2 - rect.top;
    pinchState = {
      distance: Math.max(1, Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)),
      zoom: getZoom(),
      anchorWorld: screenToWorld(centerX, centerY)
    };
    pinchActive = true;
    dragged = true;
    dragActive = false;
    pointerDown = null;
  };

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
    try { canvas.setPointerCapture(event.pointerId); } catch {}
    touches.set(event.pointerId, pointerPosition(event));

    if (touches.size === 1) {
      const camera = getCamera();
      pointerDown = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        camX: camera.x,
        camY: camera.y,
        pointerType: event.pointerType || "mouse"
      };
      dragged = false;
      dragActive = false;
      pinchState = null;
      pinchActive = false;
      return;
    }

    if (touches.size === 2) beginPinch();
  };

  const onPointerMove = event => {
    if (!touches.has(event.pointerId)) return;
    touches.set(event.pointerId, pointerPosition(event));

    if (touches.size >= 2) {
      if (!pinchState) beginPinch();
      const points = [...touches.values()].slice(0, 2);
      const distance = Math.max(1, Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      ));
      const rect = canvas.getBoundingClientRect();
      const centerX = (points[0].x + points[1].x) / 2 - rect.left;
      const centerY = (points[0].y + points[1].y) / 2 - rect.top;

      if (pinchState) {
        setZoom(
          pinchState.zoom * distance / pinchState.distance,
          centerX,
          centerY
        );
        const actualZoom = Math.max(0.01, getZoom());
        setCamera(
          pinchState.anchorWorld.x - (centerX - rect.width / 2) / actualZoom,
          pinchState.anchorWorld.y - (centerY - rect.height / 2) / actualZoom
        );
        clampCamera();
      }
      dragged = true;
      pinchActive = true;
      return;
    }

    if (!pointerDown || pointerDown.id !== event.pointerId) return;

    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    const dragThreshold = pointerDown.pointerType === "touch" ? 14 : 8;

    if (!dragActive) {
      if (Math.hypot(dx, dy) <= dragThreshold) return;
      const camera = getCamera();
      pointerDown.x = event.clientX;
      pointerDown.y = event.clientY;
      pointerDown.camX = camera.x;
      pointerDown.camY = camera.y;
      dragActive = true;
      dragged = true;
      return;
    }

    const zoom = Math.max(0.01, getZoom());
    setCamera(pointerDown.camX - dx / zoom, pointerDown.camY - dy / zoom);
    clampCamera();
  };

  const finishPointer = (event, allowTap) => {
    if (!touches.has(event.pointerId)) return;
    const endedDuringPinch = pinchActive || touches.size >= 2;
    touches.delete(event.pointerId);

    if (endedDuringPinch) {
      dragged = true;
      pinchState = null;
      pinchActive = false;

      if (touches.size === 1) {
        const [remainingId, remaining] = [...touches.entries()][0];
        const camera = getCamera();
        pointerDown = {
          id: remainingId,
          x: remaining.x,
          y: remaining.y,
          camX: camera.x,
          camY: camera.y,
          pointerType: remaining.pointerType || "touch"
        };
        dragActive = true;
      } else {
        pointerDown = null;
        dragActive = false;
      }
      return;
    }

    if (allowTap && pointerDown && pointerDown.id === event.pointerId && !dragged) {
      if (isPaused() && !isGameOver()) {
        showToast("Spiel ist pausiert – oben auf Weiter tippen");
      } else {
        const rect = canvas.getBoundingClientRect();
        const worldPoint = screenToWorld(
          event.clientX - rect.left,
          event.clientY - rect.top
        );
        worldTap(worldPoint.x, worldPoint.y);
      }
    }

    if (touches.size === 0) {
      pointerDown = null;
      dragActive = false;
      dragged = false;
    }
  };

  const onPointerEnd = event => finishPointer(event, true);
  const onPointerCancel = event => finishPointer(event, false);

  const onKeyDown = event => {
    if (
      !startScreen.classList.contains("hidden") ||
      (campaignMapScreen && !campaignMapScreen.classList.contains("hidden")) ||
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
    const blockerOpen = typeof hasBlockingPanelOpen === "function" && hasBlockingPanelOpen();
    const pan = panKeys[event.key];
    if (pan) {
      if (blockerOpen) return;
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
      if (!blockerOpen) startWave();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (typeof cancelAction === "function") cancelAction("escape");
      else clearSelectionModes();
    }
    if (event.key.toLowerCase() === "p") {
      if (isPaused()) hidePauseMenu(true);
      else showPauseMenu();
    }
    if (event.key.toLowerCase() === "r" && isGameOver()) resetGame();
  };

  let lastResizeWidth = Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
  let lastResizeOrientation = window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";

  const onResize = () => {
    handleOrientationChange();
    const width = Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
    const orientation = window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";
    const realLayoutChange = orientation !== lastResizeOrientation || Math.abs(width - lastResizeWidth) >= 32;
    if (!realLayoutChange) return;
    lastResizeWidth = width;
    lastResizeOrientation = orientation;
    if (!isPhoneLandscape()) setTimeout(resizeCanvas, 60);
  };

  const onOrientationChange = () => {
    setTimeout(() => {
      handleOrientationChange();
      lastResizeWidth = Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
      lastResizeOrientation = window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";
      if (!isPhoneLandscape()) resizeCanvas();
    }, 140);
  };

  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerEnd);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
    if (typeof cancelAction === "function") cancelAction("context");
  });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onOrientationChange);

  return () => {
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerEnd);
    canvas.removeEventListener("pointercancel", onPointerCancel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onOrientationChange);
  };
}
