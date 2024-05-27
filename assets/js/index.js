"use strict";

// ?================================= Variables =================================?
const form = document.querySelector("#bookmarkForm");
let siteTitleInput = document.querySelector("#siteTitle");
let siteUrlInput = document.querySelector("#siteUrl");
let siteDescriptionInput = document.querySelector("#siteDescription");
const addBookmarkBtn = document.querySelector("#addBookmark");
const updateBookmark = document.querySelector("#updateBookmark");

const ghostContainer = document.querySelector("#emptyBookmarkListList");
const bookmarkListContainer = document.getElementById("bookmarkList");

const alertContainer = document.getElementById("alert");

let bookmarksList = [];

// ?================================= Functions =================================?
const setLocalStorage = () => {
  localStorage.setItem("bookmarksList", JSON.stringify(bookmarksList));
};
const getLocalStorage = () => {
  const data = JSON.parse(localStorage.getItem("bookmarksList"));
  if (!data) return;
  bookmarksList = data;

  // Retrieve list from local storage
  bookmarksList.forEach(addBookmark);
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
// displayAlert(
//   "warning",
//   "exclamation",
//   "All fields must be completed",
//   "try again"
// );
// displayAlert(
//   "error",
//   "x",
//   "Something went wrong. Please try again...",
//   "try again"
// );
// displayAlert(
//   "error",
//   "x",
//   "Ensure all fields are filled correctly",
//   "try again"
// );

const renderBookmarks = () => {
  bookmarkListContainer.innerHTML = "";
  bookmarksList.forEach(addBookmark);
  toggleGhost();
  getLocalStorage();
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
              <a><i class="fa-solid fa-link"></i></a>
              <i class="fa-solid fa-pen"></i>
              <i class="fa-solid fa-trash delete-bookmark"></i>
            </div>
          </div>
        </div>
  `;
  bookmarkListContainer.insertAdjacentHTML("beforeend", html);
  toggleGhost();
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
  bookmarksList.push(bookmark);
  setLocalStorage();
  form.reset();
  renderBookmarks();
  displayAlert("success", "check", "Your bookmark has been added", "Done");
});
// ! Event delegation for handling delete bookmark button clicks
bookmarkListContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-bookmark")) {
    const bookmarkSite = e.target.closest(".bookmark-site");
    const index = Array.from(bookmarkListContainer.children).indexOf(
      bookmarkSite.parentElement
    );
    bookmarksList.splice(index, 1);
    renderBookmarks();
    displayAlert("success", "check", "Your bookmark has been deleted", "Done");
  }
});

// ?================================= Init =================================?
renderBookmarks();
