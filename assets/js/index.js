// ? ================ Variables ================
const APP_CONFIG = {
  storageKey: "bookmarksList",
  validation: {
    title: /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/,
    url: /^(https?|ftp):\/\/www\.[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/[^\/]*)*$/,
  },
  popups: {
    success: {
      icon: "fa-check",
      type: "success",
      title: "Great!",
    },
    warning: {
      icon: "fa-exclamation",
      type: "warning",
      title: "Warning",
    },
    error: {
      icon: "fa-x",
      type: "danger",
      title: "Ooops!",
    },
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
  popups: {
    popup: document.getElementById("popup"),
    icon: document.getElementById("popupIcon"),
    title: document.getElementById("popupTitle"),
    message: document.getElementById("popupMessage"),
    closeBtn: document.getElementById("popupCloseBtn"),
  },
};

// ? ================ Functions ================

// Local Storage
const loadBookmarks = () =>
  JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)) || [];
const saveBookmarks = () =>
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(bookmarks));

const bookmarks = loadBookmarks();

// UI
const createBookmarkHTML = (bookmark, index) => {
  return `
      <div class="col-lg-7 col-12">
        <div class="bookmark-site p-3 mx-auto d-flex align-items-center justify-content-between gap-4" data-index="${index}">
          <div class="site-info">
            <h4 class="site-title">${bookmark.title}</h4>
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
      </div>`;
};
const renderBookmarks = () => {
  if (bookmarks.length === 0) {
    ui.bookmarks.emptySiteList.classList.remove("d-none");
    ui.bookmarks.container.classList.add("d-none");
    return;
  }
  ui.bookmarks.emptySiteList.classList.add("d-none");
  ui.bookmarks.container.classList.remove("d-none");
  ui.bookmarks.container.innerHTML = bookmarks
    .map((bookmark, index) => createBookmarkHTML(bookmark, index))
    .join("");
};
const matchedBookmarks = () => {
  const searchVal = ui.searchInput.value.toLowerCase().trim();
  
  if (searchVal === "") {
    renderBookmarks();
    ui.bookmarks.emptyListText.innerText = "Empty list";
    return;
  }

  const filtered = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(searchVal)
  );

  if (filtered.length === 0) {
    ui.bookmarks.emptySiteList.classList.remove("d-none");
    ui.bookmarks.container.classList.add("d-none");
    ui.bookmarks.emptyListText.innerText = "No Matched Bookmark";
  } else {
    ui.bookmarks.emptySiteList.classList.add("d-none");
    ui.bookmarks.container.classList.remove("d-none");
    ui.bookmarks.container.innerHTML = filtered
      .map((bookmark, index) => createBookmarkHTML(bookmark, index))
      .join("");
  }
};


// Popups
const showPopup = (type, message) => {
  ui.popups.popup.classList.add("show");

  ui.popups.icon.classList.add(APP_CONFIG.popups[type].icon, `${type}-icon`);

  ui.popups.title.innerText = APP_CONFIG.popups[type].title;
  ui.popups.title.classList.add(`text-${APP_CONFIG.popups[type].type}`);

  ui.popups.message.textContent = message;

  ui.popups.closeBtn.textContent = type === "success" ? "Done" : "Try again";
  ui.popups.closeBtn.classList.add(`btn-${APP_CONFIG.popups[type].type}`);

  console.log("popup generated");
};
const hidePopup = () => {
  ui.popups.popup.classList.remove("show");
};

// Form
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
};
const handleSubmit = (e) => {
  e.preventDefault();
  const formData = {
    title: ui.form.inputs.title.value,
    url: ui.form.inputs.url.value,
    description: ui.form.inputs.description.value || "No description provided",
  };
  const editIndex = ui.form.element.dataset.editIndex;
  const success = editIndex
    ? updateBookmark(parseInt(editIndex), formData)
    : addBookmark(formData);

  if (success) {
    closeForm();
    saveBookmarks();
    renderBookmarks();
  }
};

// Validations
const validateBookmark = (data) => {
  if (!data.title || !data.url) {
    showPopup("warning", "Please fill in all required fields");
    return false;
  }

  if (!APP_CONFIG.validation.title.test(data.title.trim())) {
    showPopup("error", "Invalid title format");
    return false;
  }

  if (!APP_CONFIG.validation.url.test(formatUrl(data.url))) {
    showPopup("error", "Invalid URL format");
    return false;
  }

  return true;
};
const formatUrl = (url) => {
  return url.startsWith("http") ? url : `https://${url}`;
};

// event delegation for bookmark actions
const handleBookmarkClick = (e) => {
  const bookmarkEl = e.target.closest(".bookmark-site");
  if (!bookmarkEl) return;
  const index = parseInt(bookmarkEl.dataset.index);
  if (e.target.classList.contains("visit-site-btn")) {
    window.open(e.target.dataset.url, "_blank");
  } else if (e.target.classList.contains("edit-site-btn")) {
    openForm("edit", { ...bookmarks[index], index });
  } else if (e.target.classList.contains("delete-site-btn")) {
    deleteBookmark(index);
    saveBookmarks();
    renderBookmarks();
    showPopup("success", "Bookmark deleted successfully!");
  }
};
const addBookmark = (data) => {
  if (!validateBookmark(data)) return false;
  bookmarks.push({
    ...data,
    url: formatUrl(data.url),
  });
  showPopup("success", "Bookmark added successfully!");
  return true;
};
const updateBookmark = (index, data) => {
  if (!validateBookmark(data)) return false;
  bookmarks[index] = {
    ...data,
    url: formatUrl(data.url),
  };
  showPopup("success", "Bookmark updated successfully!");
  return true;
};
const deleteBookmark = (index) => {
  bookmarks.splice(index, 1);
  saveBookmarks();
};

renderBookmarks();

// ? ================ Events ================
ui.form.buttons.open.addEventListener("click", () => openForm("add"));
ui.form.buttons.close.addEventListener("click", () => closeForm());
ui.form.element.addEventListener("submit", (e) => handleSubmit(e));
ui.searchInput.addEventListener("input", matchedBookmarks);
ui.popups.closeBtn.addEventListener("click", hidePopup);
ui.bookmarks.container.addEventListener("click", (e) => handleBookmarkClick(e));
