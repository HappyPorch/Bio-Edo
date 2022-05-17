const toggleArea = (areaOrButton) =>
  new Promise((resolve) => {
    const area =
      typeof areaOrButton === "string"
        ? areaOrButton
        : areaOrButton.dataset.area;

    // toggle the active state of all area elements (button, area image and animal image)
    document.querySelectorAll(`[data-area="${area}"]`).forEach((item) => {
      item.classList.toggle("active");
    });

    playAreaSound(area);

    checkPesticidesButton().then(() => resolve());
  });

const checkPesticidesButton = () =>
  new Promise((resolve) => {
    const hasActiveAreas =
      document.querySelectorAll("[data-area].active").length > 0;

    // only enable pesticides button when at least one area has been activated
    document.getElementById("btnPesticides").disabled = !hasActiveAreas;

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

const playAreaSound = (area) =>
  new Promise((resolve) => {
    const isAreaActive =
      document.querySelectorAll(`[data-area="${area}"].active`).length > 0;

    if (!isAreaActive) {
      // don't play sound if area is not active
      resolve();
      return;
    }

    const areaAudio = document.querySelector(`audio[data-area="${area}"]`);

    // play first 5 seconds of the audio file and then reset it back to the start
    areaAudio
      .play()
      .then(() => wait(5000))
      .then(() => areaAudio.pause())
      .then(() => areaAudio.load())
      .then(() => resolve());
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
    promises.push(wait(index * 1500).then(() => toggleArea(area)))
  );

  // once complete, disable the pesticides button and re-enable the action buttons
  Promise.all(promises)
    .then(() => wait(2000))
    .then(() => checkPesticidesButton())
    .then(() => toggleActions(false));
};
