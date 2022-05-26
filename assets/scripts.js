const toggleArea = (areaOrButton, keepTerrain) =>
  new Promise((resolve) => {
    const area =
      typeof areaOrButton === "string"
        ? areaOrButton
        : areaOrButton.dataset.area;

    const isAreaActive = 
      document.querySelectorAll(`button[data-area="${area}"].active`).length > 0;

    // toggle the active state of all area elements (button, area image and animal image)
    document.querySelectorAll(`[data-area="${area}"]`).forEach((item) => {
      if (keepTerrain && item.classList.contains('terrain')) {
        return;
      }

      item.classList.toggle("active", !isAreaActive);
    });

    toggleAreaSound(area, isAreaActive);

    checkPesticidesAndResetButton().then(() => resolve());
  });

const checkPesticidesAndResetButton = () =>
  new Promise((resolve) => {
    const hasActiveAreas =
      document.querySelectorAll("button[data-area].active").length > 0;
    const hasVisibleAreas =
      document.querySelectorAll("[data-area].active").length > 0;

    // only enable pesticides button when at least one area has been activated
    document.getElementById("btnPesticides").disabled = !hasActiveAreas;
    
    // only enable reset button when at least one area is active or visible
    document.getElementById("btnReset").disabled = !hasActiveAreas && !hasVisibleAreas;

    resolve();
  });

const toggleActions = (disable) =>
  new Promise((resolve) => {
    document.body.classList.toggle("actions-disabled", disable);
    resolve();
  });

const areaSortOrder = [
  "diverse-fields",
  "manure",
  "sunflower",
  "barn",
  "copse",
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toggleAreaSound = (area, isAreaActive) =>
  new Promise((resolve) => {
    const areaAudio = document.querySelector(`audio[data-area="${area}"]`);

    if (isAreaActive) {
      // stop playing and reset audio file
      areaAudio.pause();
      areaAudio.load();
      resolve();
    }
    else {
      // start playing area sound
      areaAudio
        .play()
        .then(() => resolve());
    }
  });

const usePesticides = () => {
  toggleActions(true);

  const promises = [];

  // get list of all active areas (in the order specified)
  const activeAreas = [
    ...new Set(
      Array.from(document.querySelectorAll("[data-area].active"))
        .map((item) => item.dataset.area)
        .sort((a, b) => areaSortOrder.indexOf(a) - areaSortOrder.indexOf(b))
    ),
  ];

  // toggle off each active area with a delay between each area
  activeAreas.forEach((area, index) =>
    promises.push(wait(index * 1500).then(() => toggleArea(area, true)))
  );

  // once complete, disable the pesticides button and re-enable the action buttons
  Promise.all(promises)
    .then(() => wait(2000))
    .then(() => checkPesticidesAndResetButton())
    .then(() => toggleActions(false));
};

const reset = () => {
  toggleActions(true);

  // get list of all active and visible areas
  const activeAreas = document.querySelectorAll("[data-area].active");

  // toggle off each active area
  activeAreas.forEach((area) => {
    area.classList.remove("active");

    toggleAreaSound(area.dataset.area, true);
  });

  // once complete, disable the pesticides button and re-enable the action buttons
  wait(2000)
    .then(() => checkPesticidesAndResetButton())
    .then(() => toggleActions(false));
};
