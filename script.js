// --- DOM ELEMENTS ---
const els = {
    generateBtn: document.getElementById("generate-btn"),
    saveBtn: document.getElementById("save-btn"),
    applyBtn: document.getElementById("apply-btn"),
    paletteContainer: document.querySelector(".palette-container"),
    hamburger: document.getElementById("hamburger-menu"),
    sidePanel: document.getElementById("side-panel"),
    closeSideBtn: document.getElementById("close-side-panel"),
    viewSavedBtn: document.getElementById("view-saved-palettes"),
    savedModal: document.getElementById("saved-modal"),
    closeModalBtn: document.getElementById("close-modal"),
    savedList: document.getElementById("saved-list"),
    customAlert: document.getElementById("custom-alert")
};

// --- STATE MANAGEMENT ---
let currentPalette = [];
let alertTimeout;

// --- HELPERS ---
const getSaved = () => JSON.parse(localStorage.getItem("palettes")) || [];
const saveToStorage = (data) => localStorage.setItem("palettes", JSON.stringify(data));

function showAlert(message) {
    els.customAlert.textContent = message;
    els.customAlert.classList.add("show");
    
    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => els.customAlert.classList.remove("show"), 2000);
}

const generateRandomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

// --- RENDERING ---
function renderPalette(colors) {
    currentPalette = colors; // Update State
    els.paletteContainer.innerHTML = colors.map(color => `
        <div class="color-box">
            <div class="color" style="background-color: ${color}"></div>
            <div class="color-info">
                <span class="hex-value">${color.toUpperCase()}</span>
                <i class="far fa-copy copy-btn" title="Copy to Clipboard"></i>
            </div>
        </div>
    `).join('');
}

function generatePalette() {
    const newColors = Array.from({ length: 5 }, generateRandomColor);
    renderPalette(newColors);
}

function renderSavedPalettes() {
    const saved = getSaved();
    if (saved.length === 0) {
        els.savedList.innerHTML = "<p style='text-align:center; padding:10px;'>No saved palettes yet.</p>";
        return;
    }

    els.savedList.innerHTML = saved.map((palette, index) => `
        <div class="saved-item">
            <div class="mini-preview">
                ${palette.map(c => `<div class="mini-color" style="background:${c}"></div>`).join('')}
            </div>
            <div class="action-buttons" data-index="${index}">
                <button class="use-btn">Use</button>
                <button class="del-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// --- EVENT LISTENERS: NAVIGATION ---
els.hamburger.addEventListener('click', () => els.sidePanel.style.width = "250px");
els.closeSideBtn.addEventListener('click', () => els.sidePanel.style.width = "0");

els.viewSavedBtn.addEventListener('click', () => {
    els.sidePanel.style.width = "0";
    els.savedModal.style.display = "block";
    renderSavedPalettes();
});

const closeModal = () => els.savedModal.style.display = "none";
els.closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === els.savedModal) closeModal();
});

// --- EVENT LISTENERS: ACTIONS ---
els.generateBtn.addEventListener("click", () => {
    generatePalette();
    showAlert("Palette Generated!");
});

els.saveBtn.addEventListener("click", () => {
    const saved = getSaved();
    saved.push(currentPalette);
    saveToStorage(saved);
    showAlert("Palette Saved!");
});

els.applyBtn.addEventListener("click", () => {
    if (currentPalette.length === 5) {
        currentPalette.forEach((color, index) => {
            document.documentElement.style.setProperty(`--c${index + 1}`, color);
        });
        showAlert("Theme Updated!");
    }
});

// --- EVENT DELEGATION: SAVED LIST ACTIONS ---
els.savedList.addEventListener('click', (e) => {
    const btnGroup = e.target.closest('.action-buttons');
    if (!btnGroup) return;

    const index = parseInt(btnGroup.dataset.index);
    const saved = getSaved();

    if (e.target.classList.contains('use-btn')) {
        renderPalette(saved[index]);
        closeModal();
        showAlert("Palette Applied!");
    } else if (e.target.classList.contains('del-btn')) {
        saved.splice(index, 1);
        saveToStorage(saved);
        renderSavedPalettes(); // Re-render list
        showAlert("Palette Deleted!");
    }
});

// --- EVENT DELEGATION: COPY FUNCTIONALITY ---
els.paletteContainer.addEventListener("click", (e) => {
    const copyTarget = e.target.closest(".copy-btn") || e.target.closest(".color");
    if (!copyTarget) return;

    // Find the closest parent .color-box to ensure we get the correct hex
    const box = copyTarget.closest('.color-box');
    const hex = box.querySelector(".hex-value").textContent;
    const icon = box.querySelector(".copy-btn");

    navigator.clipboard.writeText(hex).then(() => {
        // Toggle Icon
        icon.classList.replace("fa-copy", "fa-check");
        icon.classList.replace("far", "fa-solid");
        icon.style.color = "#48bb78";
        
        setTimeout(() => {
            icon.classList.replace("fa-check", "fa-copy");
            icon.classList.replace("fa-solid", "far");
            icon.style.color = "";
        }, 1500);

        showAlert("Color Copied!");
    });
});

// --- INITIALIZATION ---
// Initialize with specific default colors
const originalPalette = ['#F63049', '#D02752', '#8A244B', '#111F35', '#000000'];
renderPalette(originalPalette);