const apiKey = "DEMO_KEY"; // replace with your NASA API key if you have one

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const getImagesBtn = document.getElementById("getImagesBtn");
const gallery = document.getElementById("gallery");
const loadingMessage = document.getElementById("loadingMessage");
const spaceFact = document.getElementById("spaceFact");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModal");

const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "One million Earths could fit inside the Sun.",
  "Neutron stars can spin hundreds of times every second.",
  "The footprints on the Moon can last for millions of years.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Jupiter has the shortest day of all the planets.",
  "Saturn is so light it could float in water.",
  "Black holes can bend light because of their powerful gravity.",
  "Mars has the tallest volcano in the solar system.",
  "The Sun contains about 99.8% of the mass in our solar system."
];

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  spaceFact.textContent = spaceFacts[randomIndex];
}

function showPlaceholder() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>Select a date range and click "Get Space Images" to explore the cosmos!</p>
    </div>
  `;
}

async function fetchSpaceImages() {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    loadingMessage.textContent = "Please choose both a start date and an end date.";
    return;
  }

  loadingMessage.textContent = "🔄 Loading space photos...";
  gallery.innerHTML = "";

  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch NASA data.");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      loadingMessage.textContent = "No images were found for that date range.";
      showPlaceholder();
      return;
    }

    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    displayGallery(data);
    loadingMessage.textContent = "";
  } catch (error) {
    loadingMessage.textContent = "Something went wrong while loading the images.";
    console.error("NASA API error:", error);
    showPlaceholder();
  }
}

function displayGallery(items) {
  gallery.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.classList.add("gallery-item");

    let mediaContent = "";

    if (item.media_type === "image") {
      mediaContent = `
        <div class="gallery-media">
          <img src="${item.url}" alt="${item.title}">
        </div>
      `;
    } else if (item.media_type === "video") {
      if (item.thumbnail_url) {
        mediaContent = `
          <div class="gallery-media">
            <img src="${item.thumbnail_url}" alt="${item.title}">
          </div>
        `;
      } else {
        mediaContent = `
          <div class="gallery-media">
            <div class="video-placeholder">This APOD entry is a video</div>
          </div>
        `;
      }
    } else {
      mediaContent = `
        <div class="gallery-media">
          <div class="video-placeholder">Media unavailable</div>
        </div>
      `;
    }

    card.innerHTML = `
      ${mediaContent}
      <div class="gallery-info">
        <h3>${item.title}</h3>
        <p><strong>Date:</strong> ${item.date}</p>
      </div>
    `;

    card.addEventListener("click", () => openModal(item));
    gallery.appendChild(card);
  });
}

function getYouTubeEmbedUrl(url) {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return url;
}

function openModal(item) {
  let mediaContent = "";

  if (item.media_type === "image") {
    mediaContent = `<img src="${item.hdurl || item.url}" alt="${item.title}">`;
  } else if (item.media_type === "video") {
    if (item.url.includes("youtube.com") || item.url.includes("youtu.be")) {
      const embedUrl = getYouTubeEmbedUrl(item.url);

      mediaContent = `
        <iframe
          src="${embedUrl}"
          title="${item.title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;
    } else {
      mediaContent = `
        <p>This APOD entry is a video.</p>
        <p><a href="${item.url}" target="_blank" rel="noopener noreferrer">Click here to watch the video</a></p>
      `;
    }
  } else {
    mediaContent = `<p>Media preview is not available for this item.</p>`;
  }

  modalBody.innerHTML = `
    ${mediaContent}
    <h2>${item.title}</h2>
    <p class="modal-date">Date: ${item.date}</p>
    <p>${item.explanation}</p>
  `;

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

getImagesBtn.addEventListener("click", fetchSpaceImages);

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

setupDateInputs(startDateInput, endDateInput);
showRandomFact();
fetchSpaceImages();
