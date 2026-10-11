let dietData = {};
let currentCategory = 'food';
let searchQuery = '';
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    // Tab buttons event listeners
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentCategory = target.getAttribute('data-category');
            renderCards();
        });
    });

    // Quick chips filter listeners
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            chips.forEach(c => c.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentFilter = target.getAttribute('data-filter');
            renderCards();
        });
    });

    // Search input listener
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderCards();
    });

    // Modal close listener
    const closeModal = document.getElementById('close-modal');
    const modal = document.getElementById('details-modal');
    closeModal.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
    });
});

async function fetchData() {
    try {
        const response = await fetch('data.json');
        dietData = await response.json();
        renderCards();
    } catch (error) {
        console.error('Error loading data.json:', error);
    }
}

function renderCards() {
    const container = document.getElementById('cards-grid');
    const noResults = document.getElementById('no-results');
    container.innerHTML = '';

    const items = dietData[currentCategory] || [];

    // Filter items based on search query and quick chips filter
    const filteredItems = items.filter(item => {
        // Search query match
        const matchesSearch = searchQuery === '' || 
            item.title.toLowerCase().includes(searchQuery) || 
            item.function.toLowerCase().includes(searchQuery) || 
            item.ingredients.toLowerCase().includes(searchQuery);

        if (!matchesSearch) return false;

        // Chip filter match
        if (currentFilter === 'bread-ok') {
            return item.bread_rule === 'check' || item.bread_rule === 'custom';
        } else if (currentFilter === 'no-bread') {
            return item.bread_rule === 'x';
        } else if (currentFilter === 'before-workout') {
            return item.workout_tag === 'before_workout' || item.workout_tag === 'both' || (item.when_to_eat && item.when_to_eat.toLowerCase().includes('წინ'));
        } else if (currentFilter === 'after-workout') {
            return item.workout_tag === 'after_workout' || item.workout_tag === 'both' || (item.when_to_eat && item.when_to_eat.toLowerCase().includes('შემდეგ'));
        }

        return true;
    });

    if (filteredItems.length === 0) {
        noResults.style.display = 'block';
        return;
    } else {
        noResults.style.display = 'none';
    }

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(item);

        let badgeClass = item.bread_rule || 'none';
        let badgeText = item.bread_rule === 'x' ? '❌ უპუროდ' : 
                          item.bread_rule === 'check' ? '✔️ პურით' : 
                          item.bread_rule === 'custom' ? '⚠️ პურის წესი' : '🥤 0-Cal';

        let usagePreview = '';
        if (item.usage_rules) {
            usagePreview = `<div class="card-usage"><strong>📋 მიღების წესი:</strong> ${item.usage_rules}</div>`;
        }

        // ფოტოს გზა id-ს მიხედვით (მაგ: images/pasta_beef_mince.jpg)
        const imagePath = `images/${item.id}.png`;

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${imagePath}" alt="${item.title}" class="card-img" onerror="this.parentElement.style.display='none'">
            </div>
            <div class="card-content-wrap">
                <div>
                    <div class="card-header">
                        <h3 class="card-title">${item.title}</h3>
                        <span class="bread-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <p class="card-function">${item.function}</p>
                    ${usagePreview}
                </div>
                <div class="card-footer">
                    <span>⏱️ ${item.when_to_eat}</span>
                    <span>დეტალები ➔</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function openModal(item) {
    const modal = document.getElementById('details-modal');
    const modalBody = document.getElementById('modal-body');

    let usageRulesHtml = '';
    if (item.usage_rules) {
        usageRulesHtml = `
        <div class="detail-section">
            <div class="detail-label">📋 მიღების წესი</div>
            <div class="detail-value">${item.usage_rules}</div>
        </div>`;
    }

    modalBody.innerHTML = `
        <h2 class="modal-title">${item.title}</h2>
        
        <div class="detail-section">
            <div class="detail-label">🎯 მთავარი ფუნქცია (რისთვისაა კარგი)</div>
            <div class="detail-value">${item.function}</div>
        </div>

        <div class="detail-section">
            <div class="detail-label">⏱️ როდის მივიღო</div>
            <div class="detail-value">${item.when_to_eat}</div>
        </div>

        ${usageRulesHtml}

        <div class="detail-section">
            <div class="detail-label">🥖 პურის წესი</div>
            <div class="detail-value">${item.bread_rule_text}</div>
        </div>

        <div class="detail-section">
            <div class="detail-label">🥗 შემადგენლობა</div>
            <div class="detail-value">${item.ingredients}</div>
        </div>

        <div class="detail-section">
            <div class="detail-label">👨‍🍳 მომზადების დეტალები</div>
            <div class="detail-value">${item.prep_details}</div>
        </div>
    `;

    modal.classList.add('open');
}
