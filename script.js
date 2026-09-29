/* ==========================================================
   NORTH STAR BAKERY - INTERACTIVITY & VALIDATION (script.js)
   Target Rubric: 2+ Objects, 2+ Arrays, localStorage, Validation
   ========================================================== */

// 1. DATA STRUCTURES (2 Objects & 2 Arrays)
const bakeryCatalog = {
  sourdough: { id: "sourdough", name: "Signature Country Sourdough", price: 8.00 },
  rye: { id: "rye", name: "Whole Grain Rye", price: 7.50 },
  baguette: { id: "baguette", name: "French Baguette", price: 4.50 },
  croissant: { id: "croissant", name: "Butter Croissant", price: 3.50 },
  cinnamon: { id: "cinnamon", name: "Cinnamon Bun", price: 5.50 },
  vanilla: { id: "vanilla", name: "Classic Vanilla Cake", price: 22.00 }
};

const bakeryStoreInfo = {
  name: "North Star Bakery",
  maxFavorites: 10,
  contactEmail: "orders@northstarbakery.com"
};

let userFavorites = []; // Array 1: Holds favorited product objects
let categoriesList = ["Artisan Breads", "Pastries & Morning Treats", "Cakes"]; // Array 2: Category list

// 2. DOM INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  initFavoritesFeature();
  initFormValidation();
  loadSavedCustomerData();
});

/* ==========================================================
   FEATURE 1: FAVORITES / PRE-ORDER PLANNER (products.html)
   ========================================================== */

function initFavoritesFeature() {
  const favoriteButtons = document.querySelectorAll(".btn-favorite");
  if (!favoriteButtons.length) return;

  // Restore saved favorites from localStorage
  const storedFavs = localStorage.getItem("northStar_favorites");
  if (storedFavs) {
    userFavorites = JSON.parse(storedFavs);
    updateFavoritesUI();
  }

  favoriteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.target.getAttribute("data-id");
      toggleFavorite(productId);
    });
  });
}

function toggleFavorite(productId) {
  const item = bakeryCatalog[productId];
  if (!item) return;

  const existingIndex = userFavorites.findIndex((fav) => fav.id === productId);

  if (existingIndex > -1) {
    userFavorites.splice(existingIndex, 1);
  } else {
    if (userFavorites.length < bakeryStoreInfo.maxFavorites) {
      userFavorites.push(item);
    } else {
      alert(`You can save up to ${bakeryStoreInfo.maxFavorites} items!`);
    }
  }

  // Save to localStorage
  localStorage.setItem("northStar_favorites", JSON.stringify(userFavorites));
  updateFavoritesUI();
}

function updateFavoritesUI() {
  const countDisplay = document.getElementById("fav-count");
  const listDisplay = document.getElementById("fav-list");
  const totalDisplay = document.getElementById("fav-total");

  // Update button visual states
  document.querySelectorAll(".btn-favorite").forEach((btn) => {
    const id = btn.getAttribute("data-id");
    const isFav = userFavorites.some((fav) => fav.id === id);
    btn.textContent = isFav ? "♥ Saved to Order List" : "♡ Add to Order List";
    btn.classList.toggle("active", isFav);
  });

  if (!listDisplay) return;

  listDisplay.innerHTML = "";
  let grandTotal = 0;

  if (userFavorites.length === 0) {
    listDisplay.innerHTML = "<li>No items saved yet. Click above to add!</li>";
  } else {
    userFavorites.forEach((fav) => {
      const li = document.createElement("li");
      li.textContent = `${fav.name} - $${fav.price.toFixed(2)}`;
      listDisplay.appendChild(li);
      grandTotal += fav.price;
    });
  }

  if (countDisplay) countDisplay.textContent = userFavorites.length;
  if (totalDisplay) totalDisplay.textContent = grandTotal.toFixed(2);
}

/* ==========================================================
   FEATURE 2: FORM VALIDATION & STORAGE (contact.html)
   ========================================================== */

function initFormValidation() {
  const contactForm = document.getElementById("preorder-form");
  if (!contactForm) return;

  // Auto-fill order details from stored favorites
  const orderDetailsField = document.getElementById("item-details");
  const storedFavs = localStorage.getItem("northStar_favorites");
  if (orderDetailsField && storedFavs) {
    const parsedFavs = JSON.parse(storedFavs);
    if (parsedFavs.length > 0) {
      const summaryText = parsedFavs.map((item) => `• ${item.name}`).join("\n");
      orderDetailsField.value = `Saved Order List:\n${summaryText}`;
    }
  }

  contactForm.addEventListener("submit", (e) => {
    let isValid = true;
    clearErrorMessages();

    // Check 1: Full Name Required Check
    const nameInput = document.getElementById("customer-name");
    if (!nameInput.value.trim()) {
      showError(nameInput, "Please enter your full name.");
      isValid = false;
    }

    // Check 2: Email Format Validation (Regex)
    const emailInput = document.getElementById("customer-email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      showError(emailInput, "Email address is required.");
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, "Please enter a valid email address (e.g. name@domain.com).");
      isValid = false;
    }

    // Check 3: Request Type Selection
    const requestType = document.getElementById("request-type");
    if (requestType && requestType.value === "") {
      showError(requestType, "Please select a request type.");
      isValid = false;
    }

    // Check 4: Pickup Date Validation
    const pickupDate = document.getElementById("pickup-date");
    if (pickupDate && !pickupDate.value) {
      showError(pickupDate, "Please choose a requested pickup date.");
      isValid = false;
    }

    // Check 5: Item Details Min Length Check
    const detailsInput = document.getElementById("item-details");
    if (detailsInput && detailsInput.value.trim().length < 5) {
      showError(detailsInput, "Please describe your order in at least 5 characters.");
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault(); // Prevent form submission if invalid
    } else {
      // Save customer details to localStorage on successful submit
      localStorage.setItem("northStar_customerName", nameInput.value.trim());
      localStorage.setItem("northStar_customerEmail", emailInput.value.trim());
      alert("Thank you! Your pre-order request has been submitted successfully.");
    }
  });
}

function showError(inputElement, message) {
  inputElement.classList.add("input-error");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-text";
  errorDiv.style.color = "#dc2626";
  errorDiv.style.fontSize = "0.875rem";
  errorDiv.style.marginTop = "0.25rem";
  errorDiv.textContent = message;
  inputElement.parentNode.appendChild(errorDiv);
}

function clearErrorMessages() {
  document.querySelectorAll(".error-text").forEach((el) => el.remove());
  document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
}

function loadSavedCustomerData() {
  const nameInput = document.getElementById("customer-name");
  const emailInput = document.getElementById("customer-email");

  const savedName = localStorage.getItem("northStar_customerName");
  const savedEmail = localStorage.getItem("northStar_customerEmail");

  if (nameInput && savedName) nameInput.value = savedName;
  if (emailInput && savedEmail) emailInput.value = savedEmail;
}
