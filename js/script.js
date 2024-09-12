const imageUpload = document.getElementById("imageUpload");
const imageContainer = document.getElementById("imageContainer");
const imagePreview = document.getElementById("imagePreview");
const dateLabel = document.getElementById("dateLabel");
const gpsLabel = document.getElementById("gpsLabel");
const dateText = document.getElementById("dateText");
const gpsText = document.getElementById("gpsText");
const addressText = document.getElementById("addressText");
const reverseGeocodeButton = document.getElementById("reverseGeocode");
const saveButton = document.getElementById("saveButton");
const loadingIndicator = document.querySelector(".loading");
const showDateLabel = document.getElementById("showDateLabel");
const showGPSLabel = document.getElementById("showGPSLabel");
const exifDataContainer = document.getElementById("exifData");
const resetLabels = document.getElementById("resetLabels");

let isDragging = false;
let startX, startY;
let activeDragElement = null;

function updateLabels() {
  updateLabel(dateLabel, {
    text: dateText.value,
    visible: showDateLabel.checked,
    textColor: document.getElementById("dateTextColor").value,
    backgroundToggle: document.getElementById("dateBackgroundToggle").checked,
    backgroundColor: document.getElementById("dateBackgroundColor").value,
    backgroundOpacity: document.getElementById("dateBackgroundOpacity").value,
    backgroundRadius: document.getElementById("dateBackgroundRadius").value,
    haloEffect: document.getElementById("dateHaloEffect").value,
    haloSize: document.getElementById("dateHaloSize").value,
    fontFamily: document.getElementById("dateFontFamily").value,
    fontSize: document.getElementById("dateFontSize").value,
    padding: document.getElementById("datePadding").value,
  });

  updateLabel(gpsLabel, {
    text: addressText.value || gpsText.value,
    visible: showGPSLabel.checked,
    textColor: document.getElementById("gpsTextColor").value,
    backgroundToggle: document.getElementById("gpsBackgroundToggle").checked,
    backgroundColor: document.getElementById("gpsBackgroundColor").value,
    backgroundOpacity: document.getElementById("gpsBackgroundOpacity").value,
    backgroundRadius: document.getElementById("gpsBackgroundRadius").value,
    haloEffect: document.getElementById("gpsHaloEffect").value,
    haloSize: document.getElementById("gpsHaloSize").value,
    fontFamily: document.getElementById("gpsFontFamily").value,
    fontSize: document.getElementById("gpsFontSize").value,
    padding: document.getElementById("gpsPadding").value,
  });
}

function updateLabel(label, options) {
  label.textContent = options.text;
  label.style.display = options.visible ? "block" : "none";
  label.style.color = options.textColor;
  label.style.fontFamily = options.fontFamily;
  label.style.fontSize = `${options.fontSize}px`;
  label.style.padding = `${options.padding}px`;

  if (options.backgroundToggle) {
    const bgColor = options.backgroundColor;
    const opacity = options.backgroundOpacity;
    const rgba = hexToRGBA(bgColor, opacity);
    label.style.backgroundColor = rgba;
    label.style.borderRadius = `${options.backgroundRadius}px`;
  } else {
    label.style.backgroundColor = "transparent";
    label.style.borderRadius = "0";
  }

  if (options.haloEffect !== "none") {
    const haloColor = options.haloEffect === "black" ? "#000" : "#fff";
    const haloSizeVal = options.haloSize;
    label.style.textShadow = [
      `${haloSizeVal}px ${haloSizeVal}px 0 ${haloColor}`,
      `-${haloSizeVal}px ${haloSizeVal}px 0 ${haloColor}`,
      `${haloSizeVal}px -${haloSizeVal}px 0 ${haloColor}`,
      `-${haloSizeVal}px -${haloSizeVal}px 0 ${haloColor}`,
    ].join(", ");
  } else {
    label.style.textShadow = "none";
  }
}

function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function convertDMSToDD(degrees, minutes, seconds, direction) {
  let dd = degrees + minutes / 60 + seconds / (60 * 60);
  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  }
  return dd;
}

function displayExifData(exifData) {
  let exifHtml = '<table class="table table-striped">';
  exifHtml += "<thead><tr><th>Tag</th><th>Value</th></tr></thead><tbody>";

  for (const tag in exifData) {
    if (exifData.hasOwnProperty(tag)) {
      let value = exifData[tag];

      // Format GPS coordinates
      if (tag === "GPSLatitude" || tag === "GPSLongitude") {
        const ref = exifData[tag + "Ref"];
        const [degrees, minutes, seconds] = value;
        const dd = convertDMSToDD(degrees, minutes, seconds, ref);
        value = `${dd.toFixed(6)} (${degrees}° ${minutes}' ${seconds}" ${ref})`;
      }

      // Format date
      if (
        tag === "DateTimeOriginal" ||
        tag === "DateTimeDigitized" ||
        tag === "DateTime"
      ) {
        value = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
      }

      exifHtml += `<tr><td>${tag}</td><td>${value}</td></tr>`;
    }
  }

  exifHtml += "</tbody></table>";
  exifDataContainer.innerHTML = exifHtml;
}

imageUpload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    // Validate file size
    const maxSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSize) {
      alert("File is too large. Please upload an image smaller than 5MB.");
      return;
    }

    loadingIndicator.style.display = "flex";
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result; // Load selected image
      imagePreview.onload = function () {
        resetLabelPositions();
        loadingIndicator.style.display = "none";
      };
      EXIF.getData(file, function () {
        // Clear previous data
        dateText.value = "";
        gpsText.value = "";
        addressText.value = "";
        exifDataContainer.innerHTML = "<p>Loading EXIF data...</p>";

        const exifDate = EXIF.getTag(this, "DateTimeOriginal");
        if (exifDate) {
          const formattedDate = exifDate.split(" ")[0].replace(/:/g, "-");
          dateText.value = formattedDate;
        }

        const lat = EXIF.getTag(this, "GPSLatitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lon = EXIF.getTag(this, "GPSLongitude");
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (lat && latRef && lon && lonRef) {
          const latDD = convertDMSToDD(lat[0], lat[1], lat[2], latRef);
          const lonDD = convertDMSToDD(lon[0], lon[1], lon[2], lonRef);
          gpsText.value = `${latDD.toFixed(6)}, ${lonDD.toFixed(6)}`;
        } else {
          gpsText.value = "GPS data not available";
        }

        updateLabels();
        displayExifData(this.exifdata);
      });
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = "./images/600x400.png"; // Reset to placeholder
  }
});

function resetLabelPositions() {
  dateLabel.style.left = "10px";
  dateLabel.style.top = "10px";
  gpsLabel.style.left = "10px";
  gpsLabel.style.top = "40px";
}

resetLabels.addEventListener("click", resetLabelPositions);

function startDrag(e) {
  isDragging = true;
  activeDragElement = e.target;
  startX = (e.clientX || e.touches[0].clientX) - activeDragElement.offsetLeft;
  startY = (e.clientY || e.touches[0].clientY) - activeDragElement.offsetTop;
  e.preventDefault();
}

function drag(e) {
  if (isDragging && activeDragElement) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = Math.max(
      0,
      Math.min(
        clientX - startX,
        imageContainer.offsetWidth - activeDragElement.offsetWidth
      )
    );
    const y = Math.max(
      0,
      Math.min(
        clientY - startY,
        imageContainer.offsetHeight - activeDragElement.offsetHeight
      )
    );
    activeDragElement.style.left = `${x}px`;
    activeDragElement.style.top = `${y}px`;
    e.preventDefault();
  }
}

function endDrag() {
  isDragging = false;
  activeDragElement = null;
}

dateLabel.addEventListener("mousedown", startDrag);
dateLabel.addEventListener("touchstart", startDrag);
gpsLabel.addEventListener("mousedown", startDrag);
gpsLabel.addEventListener("touchstart", startDrag);

document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag);

document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

// Add event listeners for all input elements
document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("input", updateLabels);
});

["date", "gps"].forEach((prefix) => {
  document
    .getElementById(`${prefix}BackgroundOpacity`)
    .addEventListener("input", function () {
      document.getElementById(`${prefix}BackgroundOpacityValue`).textContent =
        this.value;
    });

  document
    .getElementById(`${prefix}BackgroundRadius`)
    .addEventListener("input", function () {
      document.getElementById(`${prefix}BackgroundRadiusValue`).textContent =
        this.value;
    });

  document
    .getElementById(`${prefix}HaloSize`)
    .addEventListener("input", function () {
      document.getElementById(`${prefix}HaloSizeValue`).textContent =
        this.value;
    });
});

reverseGeocodeButton.addEventListener("click", function () {
  const coords = gpsText.value
    .split(",")
    .map((coord) => parseFloat(coord.trim()));
  if (coords.length === 2) {
    loadingIndicator.style.display = "flex";
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
    )
      .then((response) => response.json())
      .then((data) => {
        addressText.value = data.display_name;
        updateLabels();
        loadingIndicator.style.display = "none";
      })
      .catch((error) => {
        console.error("Error:", error);
        addressText.value = "Unable to fetch address";
        updateLabels();
        loadingIndicator.style.display = "none";
      });
  } else {
    addressText.value = "Invalid GPS coordinates";
    updateLabels();
  }
});

saveButton.addEventListener("click", function () {
  loadingIndicator.style.display = "flex";
  setTimeout(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;

    ctx.drawImage(imagePreview, 0, 0, canvas.width, canvas.height);

    const scaleX = imagePreview.naturalWidth / imagePreview.width;
    const scaleY = imagePreview.naturalHeight / imagePreview.height;

    const labels = [
      {
        element: dateLabel,
        visible: showDateLabel.checked,
        options: {
          textColor: document.getElementById("dateTextColor").value,
          backgroundToggle: document.getElementById("dateBackgroundToggle")
            .checked,
          backgroundColor: document.getElementById("dateBackgroundColor").value,
          backgroundOpacity: document.getElementById("dateBackgroundOpacity")
            .value,
          backgroundRadius: document.getElementById("dateBackgroundRadius")
            .value,
          haloEffect: document.getElementById("dateHaloEffect").value,
          haloSize: document.getElementById("dateHaloSize").value,
          fontFamily: document.getElementById("dateFontFamily").value,
          fontSize: document.getElementById("dateFontSize").value,
          padding: document.getElementById("datePadding").value,
        },
      },
      {
        element: gpsLabel,
        visible: showGPSLabel.checked,
        options: {
          textColor: document.getElementById("gpsTextColor").value,
          backgroundToggle: document.getElementById("gpsBackgroundToggle")
            .checked,
          backgroundColor: document.getElementById("gpsBackgroundColor").value,
          backgroundOpacity: document.getElementById("gpsBackgroundOpacity")
            .value,
          backgroundRadius: document.getElementById("gpsBackgroundRadius")
            .value,
          haloEffect: document.getElementById("gpsHaloEffect").value,
          haloSize: document.getElementById("gpsHaloSize").value,
          fontFamily: document.getElementById("gpsFontFamily").value,
          fontSize: document.getElementById("gpsFontSize").value,
          padding: document.getElementById("gpsPadding").value,
        },
      },
    ];

    labels.forEach((label) => {
      if (label.visible) {
        // Calculate the X and Y positions, scaled for the canvas
        let x = parseFloat(label.element.style.left) * scaleX;
        let y = parseFloat(label.element.style.top) * scaleY;

        // Set the font and calculate the text properties
        ctx.font = `${label.options.fontSize * scaleY}px ${
          label.options.fontFamily
        }`;
        const padding = parseInt(label.options.padding) * scaleY;
        const lineHeight = parseInt(label.options.fontSize) * scaleY;

        // Wrap text if it's too wide for the canvas
        const textLines = wrapText(
          ctx,
          label.element.textContent,
          canvas.width - padding * 2
        );
        const totalTextHeight = textLines.length * lineHeight;

        // Ensure the label stays within the bounds of the canvas
        y = Math.min(
          Math.max(y, 0),
          canvas.height - totalTextHeight - padding * 2
        );
        x = Math.min(
          Math.max(x, 0),
          canvas.width -
            Math.max(...textLines.map((line) => ctx.measureText(line).width)) -
            padding * 2
        );

        // Draw background if enabled
        if (label.options.backgroundToggle) {
          ctx.save();
          const bgColor = hexToRGBA(
            label.options.backgroundColor,
            label.options.backgroundOpacity
          );
          ctx.fillStyle = bgColor;
          const maxWidth = Math.max(
            ...textLines.map((line) => ctx.measureText(line).width)
          );
          roundRect(
            ctx,
            x,
            y,
            maxWidth + padding * 2,
            totalTextHeight + padding * 2,
            label.options.backgroundRadius * scaleY
          );
          ctx.fill();
          ctx.restore();
        }

        // Draw each line of text
        textLines.forEach((line, index) => {
          const textY = y + (index + 1) * lineHeight;

          // Halo effect (shadow around text)
          if (label.options.haloEffect !== "none") {
            ctx.save();
            ctx.shadowColor =
              label.options.haloEffect === "black" ? "black" : "white";
            ctx.shadowBlur = label.options.haloSize * scaleY;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = label.options.textColor;
            ctx.fillText(line, x + padding, textY);
            ctx.restore();
          }

          // Draw the text
          ctx.fillStyle = label.options.textColor;
          ctx.fillText(line, x + padding, textY);
        });
      }
    });

    // Convert the canvas to an image blob and download it
    canvas.toBlob(function (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "image_with_date_and_gps.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      loadingIndicator.style.display = "none";
    }, "image/jpeg");
  }, 100);
});

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

updateLabels();
