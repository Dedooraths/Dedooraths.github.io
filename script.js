// Global variables
let currentUser = null;
let userProfile = {
    weight: 70,
    height: 170,
    age: 25,
    activity: 'moderate',
    dietary: [],
    manualOverrideEnabled: false,
    manualCalories: null,
    manualProtein: null
};
let dailyMeals = [];
let mealHistory = {};
let currentDate = new Date();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Sample restaurant data (in a real app, this would come from an API)
const restaurants = [
    {
        name: "Healthy Bites",
        location: "123 Main St",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        meals: [
            { name: "Grilled Chicken Salad", calories: 350, protein: 35, price: 12.99 },
            { name: "Quinoa Bowl", calories: 420, protein: 18, price: 14.99 },
            { name: "Salmon with Vegetables", calories: 480, protein: 42, price: 18.99 }
        ]
    },
    {
        name: "Fresh & Fit",
        location: "456 Oak Ave",
        coordinates: { lat: 40.7589, lng: -73.9851 },
        meals: [
            { name: "Turkey Wrap", calories: 380, protein: 28, price: 11.99 },
            { name: "Greek Yogurt Parfait", calories: 320, protein: 22, price: 9.99 },
            { name: "Veggie Stir Fry", calories: 290, protein: 12, price: 13.99 }
        ]
    },
    {
        name: "Protein Palace",
        location: "789 Pine St",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        meals: [
            { name: "Steak with Sweet Potato", calories: 520, protein: 45, price: 22.99 },
            { name: "Tuna Salad", calories: 310, protein: 38, price: 15.99 },
            { name: "Chicken Breast with Rice", calories: 450, protein: 40, price: 16.99 }
        ]
    },
    {
        name: "Green Garden",
        location: "321 Elm St",
        coordinates: { lat: 40.7614, lng: -73.9776 },
        meals: [
            { name: "Vegan Buddha Bowl", calories: 380, protein: 15, price: 13.99 },
            { name: "Avocado Toast", calories: 290, protein: 8, price: 10.99 },
            { name: "Lentil Soup", calories: 220, protein: 18, price: 8.99 }
        ]
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showMainApp();
    } else {
        showLoginPage();
    }

    // Set up event listeners
    setupEventListeners();
    
    // Load user data
    loadUserData();
    
    // Initialize calendar
    initializeCalendar();
    
    // Update dashboard
    updateDashboard();
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn[data-page]');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    // Meal cube
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.addEventListener('click', spinMealCube);
    }

    const lockMealBtn = document.getElementById('lockMealBtn');
    if (lockMealBtn) {
        lockMealBtn.addEventListener('click', lockMeal);
    }

    const spinAgainBtn = document.getElementById('spinAgainBtn');
    if (spinAgainBtn) {
        spinAgainBtn.addEventListener('click', spinMealCube);
    }

    // Calendar navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Map controls
    const radiusSlider = document.getElementById('radiusSlider');
    const refreshMapBtn = document.getElementById('refreshMapBtn');
    if (radiusSlider) radiusSlider.addEventListener('input', updateRadius);
    if (refreshMapBtn) refreshMapBtn.addEventListener('click', refreshMap);

    // Profile save
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }

    // Manual override toggle
    const manualToggle = document.getElementById('manualOverrideToggle');
    const manualFields = document.getElementById('manualOverrideFields');
    if (manualToggle && manualFields) {
        manualToggle.addEventListener('change', () => {
            manualFields.style.display = manualToggle.checked ? 'block' : 'none';
        });
    }

    // Modal
    const modal = document.getElementById('dayModal');
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    if (username === 'Dede' && password === 'Dede') {
        currentUser = { username: username };
        localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
        showMainApp();
        errorDiv.textContent = '';
    } else {
        errorDiv.textContent = 'Invalid username or password. Use Dede/Dede';
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('loggedInUser');
    showLoginPage();
}

function showLoginPage() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('mainApp').classList.remove('active');
}

function showMainApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
    showPage('dashboard');
}

function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Special handling for specific pages
    if (pageName === 'map') {
        loadRestaurants();
    }
}

function loadUserData() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        populateProfileForm();
    }

    const savedMeals = localStorage.getItem('dailyMeals');
    if (savedMeals) {
        dailyMeals = JSON.parse(savedMeals);
    }

    const savedHistory = localStorage.getItem('mealHistory');
    if (savedHistory) {
        mealHistory = JSON.parse(savedHistory);
    }
}

function saveUserData() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    localStorage.setItem('dailyMeals', JSON.stringify(dailyMeals));
    localStorage.setItem('mealHistory', JSON.stringify(mealHistory));
}

function populateProfileForm() {
    document.getElementById('userWeight').value = userProfile.weight;
    document.getElementById('userHeight').value = userProfile.height;
    document.getElementById('userAge').value = userProfile.age;
    document.getElementById('userActivity').value = userProfile.activity;

    // Set dietary restrictions
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = userProfile.dietary.includes(checkbox.value);
    });

    // Manual override
    const manualToggle = document.getElementById('manualOverrideToggle');
    const manualFields = document.getElementById('manualOverrideFields');
    const manualCalories = document.getElementById('manualCalories');
    const manualProtein = document.getElementById('manualProtein');
    if (manualToggle && manualFields && manualCalories && manualProtein) {
        manualToggle.checked = !!userProfile.manualOverrideEnabled;
        manualFields.style.display = manualToggle.checked ? 'block' : 'none';
        manualCalories.value = userProfile.manualCalories ?? '';
        manualProtein.value = userProfile.manualProtein ?? '';
    }
}

function saveProfile() {
    userProfile.weight = parseFloat(document.getElementById('userWeight').value) || 70;
    userProfile.height = parseFloat(document.getElementById('userHeight').value) || 170;
    userProfile.age = parseInt(document.getElementById('userAge').value) || 25;
    userProfile.activity = document.getElementById('userActivity').value;

    // Get dietary restrictions
    userProfile.dietary = [];
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        userProfile.dietary.push(checkbox.value);
    });

    // Manual override values
    const manualToggle = document.getElementById('manualOverrideToggle');
    const manualCalories = document.getElementById('manualCalories');
    const manualProtein = document.getElementById('manualProtein');
    if (manualToggle && manualCalories && manualProtein) {
        userProfile.manualOverrideEnabled = manualToggle.checked;
        userProfile.manualCalories = manualToggle.checked
            ? (parseInt(manualCalories.value) || null)
            : null;
        userProfile.manualProtein = manualToggle.checked
            ? (parseInt(manualProtein.value) || null)
            : null;
    }

    saveUserData();
    updateDashboard();
    
    // Show success message
    alert('Profile saved successfully!');
}

function calculateDailyCalories() {
    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr;
    if (userProfile.gender === 'male') {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    } else {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very: 1.725,
        extra: 1.9
    };

    const calculated = Math.round(bmr * activityMultipliers[userProfile.activity]);

    // Respect manual override if enabled and value present
    if (userProfile.manualOverrideEnabled && typeof userProfile.manualCalories === 'number') {
        return userProfile.manualCalories;
    }
    return calculated;
}

function updateDashboard() {
    const dailyCalories = calculateDailyCalories();
    const consumedCalories = dailyMeals.reduce((total, meal) => total + meal.calories, 0);
    const consumedProtein = dailyMeals.reduce((total, meal) => total + meal.protein, 0);

    // Determine protein target: manual override if enabled and provided, else default 150g
    const proteinTarget = (userProfile.manualOverrideEnabled && typeof userProfile.manualProtein === 'number')
        ? `${userProfile.manualProtein}g`
        : '150g';

    document.getElementById('dailyCalories').textContent = `${consumedCalories} / ${dailyCalories}`;
    document.getElementById('dailyProtein').textContent = `${consumedProtein}g / ${proteinTarget}`;
    document.getElementById('mealsToday').textContent = `${dailyMeals.length} / 3`;
}

function spinMealCube() {
    const cube = document.getElementById('mealCube');
    const spinBtn = document.getElementById('spinBtn');
    const mealResult = document.getElementById('mealResult');

    // Disable spin button during animation
    spinBtn.disabled = true;
    mealResult.classList.add('hidden');

    // Add spinning animation
    cube.classList.add('spinning');

    // Generate random meal
    setTimeout(() => {
        const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
        const randomMeal = randomRestaurant.meals[Math.floor(Math.random() * randomRestaurant.meals.length)];
        
        // Update meal result
        document.getElementById('mealName').textContent = randomMeal.name;
        document.getElementById('mealCalories').textContent = randomMeal.calories;
        document.getElementById('mealProtein').textContent = randomMeal.protein + 'g';
        document.getElementById('mealLocation').textContent = randomRestaurant.name + ' - ' + randomRestaurant.location;

        // Store meal data for locking
        currentMeal = {
            ...randomMeal,
            restaurant: randomRestaurant.name,
            location: randomRestaurant.location
        };

        // Show result
        mealResult.classList.remove('hidden');
        cube.classList.remove('spinning');
        spinBtn.disabled = false;
    }, 2000);
}

let currentMeal = null;

function lockMeal() {
    if (!currentMeal) return;

    // Check if user has already locked meals today
    const today = new Date().toDateString();
    const todayMeals = dailyMeals.filter(meal => meal.date === today);
    
    if (todayMeals.length >= 3) {
        alert('You have already locked 3 meals for today!');
        return;
    }

    // Add meal to daily meals
    const mealToAdd = {
        ...currentMeal,
        date: today,
        time: new Date().toLocaleTimeString(),
        locked: true
    };

    dailyMeals.push(mealToAdd);
    saveUserData();
    updateDashboard();

    // Add to meal history
    if (!mealHistory[today]) {
        mealHistory[today] = [];
    }
    mealHistory[today].push(mealToAdd);

    alert('Meal locked successfully!');
    document.getElementById('mealResult').classList.add('hidden');
    currentMeal = null;
}

function initializeCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    const currentMonthElement = document.getElementById('currentMonth');
    
    if (!calendarBody || !currentMonthElement) return;

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Clear calendar
    calendarBody.innerHTML = '';

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add('other-month');
        }

        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Check if day has meals
        const dateString = date.toDateString();
        if (mealHistory[dateString] && mealHistory[dateString].length > 0) {
            dayElement.classList.add('has-meals');
        }

        dayElement.innerHTML = `
            <div class="day-number">${date.getDate()}</div>
            <div class="day-meals">${mealHistory[dateString] ? mealHistory[dateString].length + ' meals' : ''}</div>
        `;

        dayElement.addEventListener('click', () => showDayDetails(date));
        calendarBody.appendChild(dayElement);
    }
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function showDayDetails(date) {
    const dateString = date.toDateString();
    const meals = mealHistory[dateString] || [];
    
    const modal = document.getElementById('dayModal');
    const modalDate = document.getElementById('modalDate');
    const modalMeals = document.getElementById('modalMeals');

    modalDate.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    if (meals.length === 0) {
        modalMeals.innerHTML = '<p>No meals recorded for this day.</p>';
    } else {
        modalMeals.innerHTML = meals.map(meal => `
            <div class="meal-detail">
                <h3>${meal.name}</h3>
                <p><strong>Calories:</strong> ${meal.calories}</p>
                <p><strong>Protein:</strong> ${meal.protein}g</p>
                <p><strong>Location:</strong> ${meal.restaurant}</p>
                <p><strong>Time:</strong> ${meal.time}</p>
            </div>
        `).join('');
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('dayModal');
    modal.style.display = 'none';
}

function loadRestaurants() {
    const restaurantList = document.getElementById('restaurantList');
    if (!restaurantList) return;

    restaurantList.innerHTML = restaurants.map(restaurant => `
        <div class="restaurant-item">
            <h3>${restaurant.name}</h3>
            <p><strong>Location:</strong> ${restaurant.location}</p>
            <p><strong>Available Meals:</strong> ${restaurant.meals.length}</p>
            <p><strong>Price Range:</strong> $${Math.min(...restaurant.meals.map(m => m.price))} - $${Math.max(...restaurant.meals.map(m => m.price))}</p>
        </div>
    `).join('');
}

function updateRadius() {
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    if (radiusSlider && radiusValue) {
        radiusValue.textContent = radiusSlider.value;
    }
}

function refreshMap() {
    // In a real app, this would refresh the map with new radius
    alert('Map refreshed with new radius!');
}

// Utility functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
