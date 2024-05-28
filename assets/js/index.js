"use strict";

// ?================================= Variables =================================?
const form = document.querySelector("#bookmarkForm");
let siteTitleInput = document.querySelector("#siteTitle");
let siteUrlInput = document.querySelector("#siteUrl");
let siteDescriptionInput = document.querySelector("#siteDescription");
const addBookmarkBtn = document.querySelector("#addBookmark");
const updateBookmarkBtn = document.querySelector("#updateBookmark");

const ghostContainer = document.querySelector("#emptyBookmarkListList");
const bookmarkListContainer = document.getElementById("bookmarkList");

const alertContainer = document.getElementById("alert");

let bookmarksList = [];
let currentBookmarkIndex;

let isTitleValid;
let isUrlValidation;

// ?================================= Functions =================================?
const setLocalStorage = () => {
  localStorage.setItem("bookmarksList", JSON.stringify(bookmarksList));
};
const getLocalStorage = () => JSON.parse(localStorage.getItem("bookmarksList"));
const siteTitleValidator = () => {
  const titlePattern = /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/;
  const siteTitle = siteTitleInput.value.trim();
  isTitleValid = titlePattern.test(siteTitle) ? true : false;
  console.log(isTitleValid);
  return isTitleValid;
};
const siteUrlValidator = () => {
  const urlPattern =
    /^(https?|ftp):\/\/www\.[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/[^\/]*)*$/;
  let siteURL = siteUrlInput.value.trim();
  // Make https:// optional if not provided
  if (!siteURL.startsWith("https://") || !siteURL.startsWith("http://")) {
    siteURL = `https://${siteURL}`;
    siteUrlInput.value = siteURL;
  }
  isUrlValidation = urlPattern.test(siteURL) ? true : false;
  console.log(isUrlValidation);
  return isUrlValidation;
};

const submitForm = (bookmark) => {
  if (!bookmark.siteTitle && !bookmark.siteURL) {
    displayAlert(
      "warning",
      "exclamation",
      "All fields must be completed",
      "try again"
    );
    return false;
  } else if (isTitleValid && !isUrlValidation) {
    displayAlert("error", "x", "Please enter a valid URL", "try again");
    console.log("url bayz");
    return false;
  } else if (!isTitleValid && isUrlValidation) {
    displayAlert("error", "x", "Please enter a valid title", "try again");
    console.log("title bayz");
    return false;
  }
  return true;
};

const toggleGhost = () => {
  const shouldShowBookmarks = bookmarksList.length !== 0;
  ghostContainer.classList.toggle("d-none", shouldShowBookmarks);
  bookmarkListContainer.classList.toggle("d-none", !shouldShowBookmarks);
  bookmarkListContainer.classList.toggle("d-flex", shouldShowBookmarks);
};
const toggleAlert = () => {
  alertContainer.classList.toggle("d-none");
  // Toggle 'd-flex' class based on the presence of 'd-none'
  alertContainer.classList.toggle(
    "d-flex",
    !alertContainer.classList.contains("d-none")
  );
};
const addAlertBtn = () => {
  document.querySelector(".alert-btn").addEventListener("click", toggleAlert);
};
const displayAlert = (alert, alertIcon, alertMessage, alertBtn) => {
  const html = `
      <div class="modal-container bg-white p-4 rounded-2 shadow-lg text-center">
        <div class="error-icon-box d-flex justify-content-center mb-4">
          <i class="fa-solid fa-${alertIcon} modal-icon ${alert}-icon d-flex align-items-center justify-content-center"></i>
        </div>
        <div class="modal-content">
          <h3 class="alert-heading text-${
            alert === "error" ? "danger" : alert
          } text-capitalize">${alert}</h3>
          <p class="alert-message">${alertMessage}</p>
          <button class="btn btn-${
            alert === "error" ? "danger" : alert
          } w-50 mx-auto alert-btn">${alertBtn}</button>
        </div>
      </div>
  `;
  toggleAlert();
  alertContainer.innerHTML = html;
  if (alertContainer.children.length > 0) {
    addAlertBtn();
  }
};
const capitalizeSiteTitle = (siteTitle) => {
  return siteTitle
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const renderBookmarks = () => {
  bookmarkListContainer.innerHTML = "";
  bookmarksList.forEach((bookmark) => addBookmark(bookmark));
  toggleGhost();
};
const addBookmark = (bookmark) => {
  const html = `
    <div class="col-12">
          <div class="bookmark-site p-3 mx-auto d-flex align-items-center justify-content-between gap-4">
            <div class="site-info">
              <h4 class="site-title">${bookmark.siteTitle}</h4> 
              <p class="bookmark-desc">${bookmark.siteDesc}</p>
            </div>
            <div class="site-action d-flex align-items-center gap-3">
              <a><i class="fa-solid fa-link visit-site"></i></a>
              <i class="fa-solid fa-pen edit-bookmark"></i>
              <i class="fa-solid fa-trash delete-bookmark"></i>
            </div>
          </div>
        </div>
  `;
  bookmarkListContainer.insertAdjacentHTML("beforeend", html);
};

// ?================================= Events =================================?
form.addEventListener("submit", (e) => {
  e.preventDefault();
});
addBookmarkBtn.addEventListener("click", () => {
  const siteTitle = capitalizeSiteTitle(siteTitleInput.value);
  let bookmark = {
    siteTitle,
    siteUrl: siteUrlInput.value,
    siteDesc: siteDescriptionInput.value,
  };

  if (submitForm(bookmark)) {
    bookmarksList.push(bookmark);
    form.reset();
    renderBookmarks();
    setLocalStorage();
    displayAlert(
      "success",
      "check",
      "Your bookmark has been added Successfully",
      "Done"
    );
  }
});
updateBookmarkBtn.addEventListener("click", () => {
  const siteTitle = capitalizeSiteTitle(siteTitleInput.value);
  let updatedSite = {
    siteTitle,
    siteUrl: siteUrlInput.value,
    siteDesc: siteDescriptionInput.value,
  };
  if (submitForm(updatedSite)) {
    bookmarksList[currentBookmarkIndex] = updatedSite;
    console.log(bookmarksList);
    form.reset();
    // setLocalStorage();
    renderBookmarks();
    setLocalStorage();
    displayAlert(
      "success",
      "check",
      "Your bookmark has been updated Successfully",
      "Done"
    );
    updateBookmarkBtn.classList.add("d-none");
    addBookmarkBtn.classList.remove("d-none");
  }
});
siteTitleInput.addEventListener("change", siteTitleValidator);
siteUrlInput.addEventListener("change", siteUrlValidator);

// ! Event delegation for handling delete bookmark button clicks
bookmarkListContainer.addEventListener("click", (e) => {
  // Visit site
  if (e.target.classList.contains("visit-site")) {
    const bookmarkSite = e.target.closest(".bookmark-site");
    currentBookmarkIndex = Array.from(bookmarkListContainer.children).indexOf(
      bookmarkSite.parentElement
    );
    let sitePath = bookmarksList[currentBookmarkIndex].siteUrl;
    window.open(sitePath, "_blank");
  }

  // update bookmark
  if (e.target.classList.contains("edit-bookmark")) {
    const bookmarkSite = e.target.closest(".bookmark-site");
    currentBookmarkIndex = Array.from(bookmarkListContainer.children).indexOf(
      bookmarkSite.parentElement
    );
    siteTitleInput.value = bookmarksList[currentBookmarkIndex].siteTitle;
    siteUrlInput.value = bookmarksList[currentBookmarkIndex].siteUrl;
    siteDescriptionInput.value = bookmarksList[currentBookmarkIndex].siteDesc;

    updateBookmarkBtn.classList.remove("d-none");
    addBookmarkBtn.classList.add("d-none");
  }

  // delete bookmark
  if (e.target.classList.contains("delete-bookmark")) {
    const bookmarkSite = e.target.closest(".bookmark-site");
    currentBookmarkIndex = Array.from(bookmarkListContainer.children).indexOf(
      bookmarkSite.parentElement
    );
    bookmarksList.splice(currentBookmarkIndex, 1);
    renderBookmarks();
    setLocalStorage();
    displayAlert("success", "check", "Your bookmark has been deleted", "Done");
  }
});

// ?================================= Init =================================?

bookmarksList = getLocalStorage() ?? bookmarksList;
renderBookmarks();
