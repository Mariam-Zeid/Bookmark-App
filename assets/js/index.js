// ? ================ Variables ================
const APP_CONFIG = {
  storageKey: "bookmarksList",
  validation: {
    title: /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/,
    url: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.(com|net|org|edu|gov|io|co|me|eg|uk|info))(\.[a-z]{2})?(\/[^\s]*)?$/,
  },
};

const ui = {
  form: {
    popup: document.getElementById("formPopup"),
    element: document.getElementById("bookmarkForm"),
    title: document.getElementById("formTitle"),
    submitBtn: document.getElementById("submitFormBtn"),
    inputs: {
      title: document.getElementById("siteTitle"),
      url: document.getElementById("siteUrl"),
      description: document.getElementById("siteDescription"),
    },
    buttons: {
      open: document.getElementById("openFormBtn"),
      close: document.getElementById("closeFormBtn"),
    },
  },
  searchInput: document.getElementById("searchInput"),
  bookmarks: {
    container: document.getElementById("list"),
    emptySiteList: document.getElementById("emptySiteList"),
    emptyListText: document.getElementById("emptyListText"),
  },
};

const formErrPositions = ["underTitle", "underUrl", "beforeBtn"];

// ? ================ Helpers ================

const getBookmarks = () => JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)) || [];
const saveBookmarks = () => localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(bookmarks));

const showToast = (type, message) => {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    stopOnFocus: true,
    position: "center",
    style: {
      background: type === "success" ? "green" : "red",
    },
  }).showToast();
};
const showErrMessage = (errPosition, message) => {
  // Remove any existing error in this position before adding a new one
  const existingErr = document.querySelector(
    `.errMsg[data-pos="${errPosition}"]`
  );
  if (existingErr) existingErr.remove();

  const errElement = document.createElement("p");
  errElement.textContent = message;
  errElement.dataset.pos = errPosition; // mark where it belongs
  errElement.className =
    formErrPositions[2] === errPosition
      ? "errMsg fw-bold text-center"
      : "errMsg fw-bold mt-2";

  switch (errPosition) {
    case formErrPositions[0]:
      ui.form.inputs.title.insertAdjacentElement("afterend", errElement);
      break;

    case formErrPositions[1]:
      ui.form.inputs.url.insertAdjacentElement("afterend", errElement);
      break;

    case formErrPositions[2]:
      ui.form.submitBtn.insertAdjacentElement("beforebegin", errElement);
      break;

    default:
      console.warn("Unknown error position:", errPosition);
  }
};
const formatUrl = (url) => {
  return url.startsWith("http")
    ? url
    : url.startsWith("www.")
    ? `https://${url}`
    : `https://www.${url}`;
};


// ? ================ Bookmark Logic ================
const bookmarks = getBookmarks();

const bookmarkHTML = (bookmark, index) => `
  <div class="col-lg-7 col-12">
        <div class="bookmark-site p-3 mx-auto d-flex align-items-center justify-content-between gap-4" data-index="${index}">
          <div class="site-info">
            <h4 class="site-title text-capitalize">${bookmark.title}</h4>
            <p class="bookmark-desc">${
              bookmark.description || "No description provided"
            }</p>
          </div>
          <div class="site-action d-flex align-items-center gap-3">
            <i class="visit-site-btn fa-solid fa-link" data-url="${
              bookmark.url
            }"></i>
            <i class="edit-site-btn fa-solid fa-pen"></i>
            <i class="delete-site-btn fa-solid fa-trash"></i>
          </div>
        </div>
      </div>
`;
const renderBookmarks = () => {
  if (bookmarks.length === 0) {
    ui.bookmarks.emptySiteList.classList.remove("d-none");
    ui.bookmarks.container.classList.add("d-none");
    return;
  }
  ui.bookmarks.emptySiteList.classList.add("d-none");
  ui.bookmarks.container.classList.remove("d-none");
  ui.bookmarks.container.innerHTML = bookmarks
    .map((bookmark, index) => bookmarkHTML(bookmark, index))
    .join("");
};
const addBookmark = (data) => {
  const newBookmark = {
    ...data,
    url: formatUrl(data.url),
  };
  const isBookmarkExists = bookmarks.find((b) => b.url === newBookmark.url);
  if (isBookmarkExists) {
    showToast("error", "Bookmark already exists!");
    return false;
  }
  bookmarks.push(newBookmark);
  showToast("success", "Bookmark added successfully!");
  return true;
};
const updateBookmark = (index, data) => {
  if (
    bookmarks.some((bookmark, idx) => idx !== index && bookmark.url === b.url)
  ) {
    showToast("error", "Bookmark already exists!");
    return false;
  }

  bookmarks[index] = {
    ...data,
    url: formatUrl(data.url),
  };

  showToast("success", "Bookmark updated successfully!");
  return true;
};
const deleteBookmark = (index) => {
  bookmarks.splice(index, 1);
  saveBookmarks();
};
const handleBookmarkClick = (e) => {
  const bookmarkEl = e.target.closest(".bookmark-site");
  if (!bookmarkEl) return;
  const bookmarkIndex = +bookmarkEl.dataset.index;
  if (e.target.classList.contains("visit-site-btn")) {
    window.open(e.target.dataset.url, "_blank");
  } else if (e.target.classList.contains("edit-site-btn")) {
    openForm("edit", { ...bookmarks[bookmarkIndex], index: bookmarkIndex });
  } else if (e.target.classList.contains("delete-site-btn")) {
    deleteBookmark(bookmarkIndex);
    saveBookmarks();
    renderBookmarks();
    showToast("success", "Bookmark deleted successfully!");
  }
};

// ? ================ Search ================
const matchedBookmarks = () => {
  const searchVal = ui.searchInput.value.toLowerCase().trim();

  if (searchVal === "") {
    renderBookmarks();
    ui.bookmarks.emptyListText.innerText = "Empty list"; // reset content
    return;
  }

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(searchVal)
  );

  if (filteredBookmarks.length === 0) {
    ui.bookmarks.emptySiteList.classList.remove("d-none");
    ui.bookmarks.container.classList.add("d-none");
    ui.bookmarks.emptyListText.innerText = "No Matched Bookmark";
  } else {
    ui.bookmarks.emptySiteList.classList.add("d-none");
    ui.bookmarks.container.classList.remove("d-none");
    ui.bookmarks.container.innerHTML = filteredBookmarks
      .map((bookmark, index) => bookmarkHTML(bookmark, index))
      .join("");
  }
};

// ? ================ Form Logic ================
const openForm = (mode = "add", bookmark = null) => {
  ui.form.popup.classList.add("show");
  ui.form.title.textContent =
    mode === "add" ? "Add Bookmark" : "Update Bookmark";
  ui.form.submitBtn.textContent = mode === "add" ? "Add" : "Update";
  ui.form.element.dataset.mode = mode;

  if (bookmark) {
    ui.form.inputs.title.value = bookmark.title;
    ui.form.inputs.url.value = bookmark.url;
    ui.form.inputs.description.value = bookmark.description || "";
    ui.form.element.dataset.editIndex = bookmark.index;
  }
};
const closeForm = () => {
  ui.form.popup.classList.remove("show");
  ui.form.element.reset();
  delete ui.form.element.dataset.editIndex;
  clearAllErrors();
};
const closeInputError = (errPosition) => {
  const existingErr = document.querySelector(
    `.errMsg[data-pos="${errPosition}"]`
  );
  if (existingErr) existingErr.remove();
};
const clearAllErrors = () => {
  formErrPositions.forEach((pos) => {
    const existingErr = document.querySelector(`.errMsg[data-pos="${pos}"]`);
    if (existingErr) existingErr.remove();
  });
};
const validateBookmark = (data) => {
  if (!data.title || !data.url) {
    showErrMessage(
      formErrPositions[2],
      "Site title and URL fields are required"
    );
    return false;
  } else if (
    !APP_CONFIG.validation.title.test(data.title.trim()) &&
    !APP_CONFIG.validation.url.test(data.url)
  ) {
    showErrMessage(
      formErrPositions[0],
      "Title must be at least 4 letters (up to 3 words)."
    );
    showErrMessage(
      formErrPositions[1],
      "URL must start with https:// or www. and end with a proper domain"
    );
    return false;
  } else if (!APP_CONFIG.validation.title.test(data.title.trim())) {
    showErrMessage(
      formErrPositions[0],
      "Title must be at least 4 letters (up to 3 words)."
    );
    return false;
  } else if (!APP_CONFIG.validation.url.test(data.url)) {
    showErrMessage(
      formErrPositions[1],
      "URL must start with https:// or www. and end with a proper domain"
    );
    return false;
  }

  return true;
};
const handleFormSubmit = (e) => {
  e.preventDefault();
  const formData = {
    title: ui.form.inputs.title.value,
    url: ui.form.inputs.url.value,
    description: ui.form.inputs.description.value || "No description provided",
  };

  if (!validateBookmark(formData)) return false;

  const editIndex = ui.form.element.dataset.editIndex;
  const isSuccess = editIndex
    ? updateBookmark(+editIndex, formData)
    : addBookmark(formData);

  if (isSuccess) {
    closeForm();
    saveBookmarks();
    renderBookmarks();
  }
};

// ? ================ Event Listeners ================
ui.searchInput.addEventListener("input", matchedBookmarks);
ui.form.buttons.open.addEventListener("click", () => openForm("add"));
ui.form.buttons.close.addEventListener("click", () => closeForm());
ui.form.element.addEventListener("submit", (e) => handleFormSubmit(e));
ui.form.inputs.title.addEventListener("input", () => clearAllErrors());
ui.form.inputs.url.addEventListener("input", () => clearAllErrors());
ui.bookmarks.container.addEventListener("click", (e) => handleBookmarkClick(e));

renderBookmarks();
