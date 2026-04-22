import { app } from "./firebase.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);
const START_TIME = new Date("2026-04-22T13:00:00"); // Used for voting cutoff

document.addEventListener("DOMContentLoaded", () => {
    initSliders();
    initTabs();
    initLegendsPagination();
    populateAwardDropdowns();
    initTheme();

    // FIREBASE INITIALIZATIONS
    initFirebaseAutographs();
    initFirebaseConfessions();
    initAwards();
    startLiveResults(); // Start the real-time listener instantly!
});

// =========================================
// TIMELINE SLIDERS
// =========================================
function createSlider(imgId, dotId, images) {
    let index = 0;
    const img = document.getElementById(imgId);
    const dotsContainer = document.getElementById(dotId);

    if (!img || !dotsContainer || !images.length) return;

    dotsContainer.innerHTML = "";

    images.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dot.addEventListener("click", () => { index = i; update(); });
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.children;
    const nextBtn = img.parentElement.querySelector(".next");
    const prevBtn = img.parentElement.querySelector(".prev");

    function update() {
        img.src = images[index];
        [...dots].forEach(d => d.classList.remove("active"));
        if (dots[index]) dots[index].classList.add("active");
    }

    if (nextBtn) nextBtn.addEventListener("click", () => { index = (index + 1) % images.length; update(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { index = (index - 1 + images.length) % images.length; update(); });

    setInterval(() => { index = (index + 1) % images.length; update(); }, 3000);
    update();
}

function initSliders() {
    createSlider("year1-img", "year1-dots", ["images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg"]);
    createSlider("year2-img", "year2-dots", ["images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg"]);
    createSlider("year3-img", "year3-dots", ["images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg"]);
    createSlider("year4-img", "year4-dots", ["images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg", "images/IMG-20251122-WA0043.jpg"]);
}

// =========================================
// NAVIGATION TABS
// =========================================
function initTabs() {
    const tabs = document.querySelectorAll(".nav-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();

            const targetId = tab.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: "smooth"
                });
            }

            // highlight active tab
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}

// =========================================
// LEGENDS PAGINATION
// =========================================
function initLegendsPagination() {
    const grid = document.getElementById("legendsGrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".polaroid-card"));
    const itemsPerPage = 15;
    const totalPages = Math.ceil(cards.length / itemsPerPage);
    let currentPage = 1;

    const prevBtn = document.getElementById("prevWall");
    const nextBtn = document.getElementById("nextWall");
    const wallText = document.getElementById("wallText");
    const dotsContainer = document.getElementById("wallDots");

    function renderPage() {
        cards.forEach(card => card.style.display = "none");
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        cards.slice(start, end).forEach(card => card.style.display = "flex");

        if (wallText) wallText.innerText = `Wall ${currentPage} of ${totalPages} • #${start + 1}–${Math.min(end, cards.length)}`;

        if (dotsContainer) {
            dotsContainer.innerHTML = "";
            for (let i = 1; i <= totalPages; i++) {
                const dot = document.createElement("span");
                dot.className = `dot ${i === currentPage ? "active" : ""}`;
                dot.addEventListener("click", () => { currentPage = i; renderPage(); });
                dotsContainer.appendChild(dot);
            }
        }
    }

    if (prevBtn) prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderPage(); } });
    if (nextBtn) nextBtn.addEventListener("click", () => { if (currentPage < totalPages) { currentPage++; renderPage(); } });
    if (cards.length > 0) renderPage();
}

// =========================================
// BATCH AWARDS CUSTOM DROPDOWNS 
// =========================================
function populateAwardDropdowns() {
    const studentsList = [
        "A. Guna Vardhan", "A.K.S Charan", "A. Vismayi", "A. Ramesh", "A. Abhisek", "B. Jogeshwar Rao", "B. Deepika", "B. Anuja", "B. Gunakara Patro", "B. Siddharth", "B. Pranavi", "B. Sahasri", "C. Yaseswi", "CH. Rakshitha", "Ch. Spandana", "D. Likitha", "D. Yashoda", "D. Bharadwaj", "D. Gnana Prasunna", "D. Hari Varma", "D. Saiteja", "G. Chandini", "K. Akhila", "K. Sandeep", "K. Sneha", "K. Tejaswini", "P. Keerthika", "K. Bhargavi", "K. Rohith", "K. Udaya Sri", "K. Mounika", "K. Ramadevi", "K. Rethu", "K. Manasa", "K. Keerthana", "M. Venkatesh", "M. Manas", "M. Hima Bindu", "M. Vanitha Varsha", "M. Lokesh", "N. Jahnavi", "N. Mounika", "N. Ravi", "N. Swathi", "P. Praneeth", "P. Manasa", "P. Juhitha", "P. Ramya", "P. Vineela", "P. Koteswari", "P. Chandra Sai Teja", "P. Saurav Ram Narayan", "P. Annapurna", "R. Deepika", "R. Lokanath", "S. Niharika", "S. Ramana", "S. Jhansi", "S. Sanjay", "G. Satish", "S. Akhil", "T. Kirti", "T. Sushmita", "T. Satya Priya", "T. Hari Priya", "Y. Rohith", "V. Ramesh", "K. Vasanth", "N. Chakri", "P. Vikas", "P. Mahesh Babu", "T. Kalyan Kumar"
    ];

    const groups = document.querySelectorAll(".award-input-group");
    groups.forEach(group => {
        const oldSelect = group.querySelector(".award-select");
        if (oldSelect) oldSelect.remove();

        const wrapper = document.createElement("div"); wrapper.className = "custom-select-wrapper";
        const trigger = document.createElement("div"); trigger.className = "custom-select-trigger"; trigger.textContent = "Select a classmate";
        const optionsDiv = document.createElement("div"); optionsDiv.className = "custom-options";

        studentsList.forEach(student => {
            const opt = document.createElement("div"); opt.className = "custom-option"; opt.textContent = student;
            opt.addEventListener("click", () => {
                trigger.textContent = student; trigger.style.color = "#111"; optionsDiv.classList.remove("open");
                trigger.closest('.award-card').style.zIndex = "1";
            });
            optionsDiv.appendChild(opt);
        });

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".custom-options").forEach(opt => {
                if (opt !== optionsDiv) { opt.classList.remove("open"); opt.closest('.award-card').style.zIndex = "1"; }
            });
            const isOpen = optionsDiv.classList.toggle("open");
            trigger.closest('.award-card').style.zIndex = isOpen ? "50" : "1";
        });

        wrapper.appendChild(trigger); wrapper.appendChild(optionsDiv);
        group.insertBefore(wrapper, group.querySelector(".vote-btn"));
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".custom-options").forEach(opt => { opt.classList.remove("open"); opt.closest('.award-card').style.zIndex = "1"; });
    });
}

// =========================================
// DARK/LIGHT THEME TOGGLE
// =========================================
function initTheme() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.innerText = "🌙";
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeToggle.innerText = "🌙";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.innerText = "☀️";
        }
    });
}

// =========================================
// FIREBASE: AUTOGRAPHS
// =========================================
function initFirebaseAutographs() {
    const submitBtn = document.getElementById("submitBtn");

    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const nameInput = document.getElementById("autograph-name");
            const messageInput = document.getElementById("autograph-message");

            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !message) {
                alert("Please fill all fields");
                return;
            }

            // Optional category handling if you still want it
            const activeCat = document.querySelector(".autographs-section .cat.active");
            const category = activeCat ? activeCat.innerText : "❤️ Appreciation";

            try {
                await addDoc(collection(db, "autographs"), {
                    name: name,
                    message: message,
                    category: category,
                    time: new Date(),
                    likes: 0
                });

                alert("Autograph saved!");
                nameInput.value = "";
                messageInput.value = "";

                // Refresh the display
                loadAutographs();
            } catch (error) {
                console.error("Error saving autograph:", error);
                alert("Failed to save. Check your connection!");
            }
        });
    }

    // Category button toggler
    const categories = document.querySelectorAll(".autographs-section .cat");
    categories.forEach(btn => {
        btn.addEventListener("click", () => {
            categories.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Load initial data
    loadAutographs();
}

async function loadAutographs() {
    const postsDiv = document.getElementById("posts");
    if (!postsDiv) return;

    postsDiv.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "autographs"));

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            const post = document.createElement("div");
            post.className = "post";

            // Format the date properly
            const dateStr = data.time ? data.time.toDate().toLocaleDateString() : new Date().toLocaleDateString();

            post.innerHTML = `
                <div class="post-top">
                  <strong>${data.name}</strong>
                  <span class="date">${dateStr}</span>
                </div>
                <p>${data.message}</p>
                <div class="post-bottom">
                  <span class="category">${data.category || 'Memory'}</span>
                  <button class="like-btn">❤️ ${data.likes || 0}</button>
                </div>
            `;

            postsDiv.appendChild(post);
        });
    } catch (error) {
        console.error("Error loading autographs:", error);
    }
}

// =========================================
// FIREBASE: CONFESSIONS
// =========================================
function initFirebaseConfessions() {
    const confBtn = document.getElementById("submitConf");

    if (confBtn) {
        confBtn.addEventListener("click", async () => {
            const inputField = document.getElementById("conf-message");
            const message = inputField.value.trim();

            if (!message) {
                alert("Write something!");
                return;
            }

            const activeCat = document.querySelector(".confessions-section .cat.active");
            const category = activeCat ? (activeCat.dataset.cat || activeCat.innerText) : "Funny";

            try {
                await addDoc(collection(db, "confessions"), {
                    text: message,
                    category: category,
                    time: new Date(),
                    reactions: { heart: 0, laugh: 0, wow: 0, secret: 0 }
                });

                alert("Confession submitted!");
                inputField.value = "";

            } catch (error) {
                console.error("Error saving confession:", error);
            }
        });
    }

    // Category button toggler
    const categoryButtons = document.querySelectorAll(".confessions-section .cat");
    categoryButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            categoryButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

// =========================================
// FIREBASE: AWARDS LOGIC
// =========================================
function initAwards() {
    let totalVotes = 0;

    const updateVoteCountDisplay = () => {
        const display = document.getElementById("totalVotesDisplay");
        if (display) display.innerText = `${totalVotes} total votes cast`;
    };

    updateVoteCountDisplay();

    document.addEventListener("click", async (e) => {
        // ======================
        // VOTE BUTTON
        // ======================
        if (e.target.classList.contains("vote-btn")) {
            const card = e.target.closest(".award-card");
            if (!card) return;

            const title = card.querySelector("h3")?.innerText.trim();
            const selected = card.querySelector(".custom-select-trigger")?.innerText.trim();
            const countEl = card.querySelector(".live-count");

            if (!title || !selected || selected === "Select a classmate") {
                alert("Please select a classmate first!");
                return;
            }

            try {
                await addDoc(collection(db, "votes"), {
                    title,
                    candidate: selected,
                    time: new Date()
                });

                totalVotes++;
                updateVoteCountDisplay();

                e.target.innerText = "Voted ✓";
                e.target.classList.add("voted");

                // Show instant UI feedback
                if (countEl) {
                    countEl.innerText = "Vote submitted successfully! 🎉";
                }

            } catch (error) {
                console.error("Failed to submit vote:", error);
                alert("Failed to submit vote. Check connection.");
            }
        }

        // ======================
        // SHOW RESULTS (NOW JUST FLIPS THE VIEW)
        // ======================
        if (e.target.id === "showResultsBtn" || e.target.closest("#showResultsBtn")) {
            const resultsView = document.getElementById("resultsView");
            const votingView = document.getElementById("votingView");

            votingView.style.display = "none";
            resultsView.style.display = "block";

            // smooth scroll into view
            const awardsSec = document.getElementById("awards");
            if (awardsSec) {
                window.scrollTo({
                    top: awardsSec.offsetTop - 50,
                    behavior: "smooth"
                });
            }
        }

        // ======================
        // BACK BUTTON
        // ======================
        if (e.target.id === "backToVotingBtn" || e.target.closest("#backToVotingBtn")) {
            document.getElementById("resultsView").style.display = "none";
            document.getElementById("votingView").style.display = "block";
        }
    });
}

// =========================================
// LIVE REAL-TIME RESULTS (onSnapshot)
// =========================================
function startLiveResults() {
    onSnapshot(collection(db, "votes"), (snapshot) => {
        const voteMap = {};

        snapshot.forEach(doc => {
            const data = doc.data();

            if (!data.time || data.time.toDate() < START_TIME) return;

            if (!voteMap[data.title]) voteMap[data.title] = {};
            voteMap[data.title][data.candidate] = (voteMap[data.title][data.candidate] || 0) + 1;
        });

        document.querySelectorAll(".result-card").forEach(card => {
            const title = card.querySelector(".result-tag")?.innerText.trim();

            let winner = "No Votes Yet";
            let max = 0;

            if (voteMap[title]) {
                for (let name in voteMap[title]) {
                    if (voteMap[title][name] > max) {
                        winner = name;
                        max = voteMap[title][name];
                    }
                }
            }

            card.querySelector(".winner-name").innerText = winner;
            card.querySelector(".vote-tally").innerText = max > 0 ? `📋 ${max} votes` : "No votes yet";
            card.querySelector(".winner-avatar").innerText = winner !== "No Votes Yet" ? winner.charAt(0) : "?";
        });
    });
}