"use strict";

// ?================================= Variables =================================?

let siteTitleInput = document.querySelector("#siteTitle");
let siteUrlInput = document.querySelector("#siteUrl");
let siteDescriptionInput = document.querySelector("#siteDescription");
const addSiteBtn = document.querySelector("#addSite");
const updateSiteBtn = document.querySelector("#updateSite");

const bookmarkListContainer = document.getElementById("bookmarkList");
const sitesData = document.querySelector("#sitesData");
const bookmarkDesc = document.querySelector(".bookmark-desc");

const alertContainer = document.getElementById("alert");

let bookmarksList = [];
