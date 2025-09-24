/**
 * Task Planner - Three.js Enhanced Calendar with Task Management
 * Features: 3D animations, editable time slots, task completion tracking
 */

class TaskPlannerApp {
  constructor() {
    this.currentDate = new Date();
    this.currentViewDate = new Date();
    this.tasks = this.loadTasks();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.fragments = [];
    this.calendarVisible = false;
    this.dayViewVisible = false;

    this.init();
  }

  init() {
    this.setupThreeJS();
    this.bindEvents();
    window.addEventListener("resize", () => this.onWindowResize());
  }

  setupThreeJS() {
    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    // Add renderer to a container (will be used for fullscreen effects)
    this.threejsContainer = document.createElement("div");
    this.threejsContainer.style.position = "fixed";
    this.threejsContainer.style.top = "0";
    this.threejsContainer.style.left = "0";
    this.threejsContainer.style.width = "100%";
    this.threejsContainer.style.height = "100%";
    this.threejsContainer.style.pointerEvents = "none";
    this.threejsContainer.style.zIndex = "1000";
    this.threejsContainer.style.display = "none";
    this.threejsContainer.appendChild(this.renderer.domElement);
    document.body.appendChild(this.threejsContainer);
  }

  bindEvents() {
    // Use event delegation to handle dynamically loaded content
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'calendar-btn') {
        e.preventDefault();
        this.explodeToCalendar();
      }
    });
  }

  explodeToCalendar() {
    if (this.calendarVisible) return;

    const mainContainer = document.querySelector(".main-container");
    if (!mainContainer) {
      console.error('Main container not found');
      return;
    }

    console.log('Starting explosion animation...');

    // Store original content
    this.originalContent = mainContainer.innerHTML;

    // Create explosion effect
    this.createExplosionEffect(mainContainer, () => {
      console.log('Creating calendar...');
      this.createCalendarView();
      this.calendarVisible = true;
    });
  }

  createExplosionEffect(container, callback) {
    // Get all child elements to fragment
    const children = Array.from(container.children);
    const fragments = [];

    children.forEach((child, index) => {
      // Create multiple fragments from each element
      const childRect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      for (let i = 0; i < 4; i++) {
        const fragment = document.createElement('div');
        fragment.className = 'explosion-fragment';

        // Copy some styling from the original element
        fragment.style.width = (childRect.width / 2) + 'px';
        fragment.style.height = (childRect.height / 2) + 'px';
        fragment.style.position = 'absolute';
        fragment.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        fragment.style.borderRadius = '8px';
        fragment.style.opacity = '0.8';
        fragment.style.zIndex = '1000';

        // Position fragment at the original element location
        const x = childRect.left - containerRect.left + (i % 2) * (childRect.width / 2);
        const y = childRect.top - containerRect.top + Math.floor(i / 2) * (childRect.height / 2);

        fragment.style.left = x + 'px';
        fragment.style.top = y + 'px';

        // Store for animation
        fragment.dataset.originalX = x;
        fragment.dataset.originalY = y;
        fragment.dataset.delay = index * 0.1 + i * 0.05;

        container.appendChild(fragment);
        fragments.push(fragment);
      }
    });

    // Hide original content
    children.forEach(child => {
      child.style.opacity = '0';
    });

    // Animate fragments exploding outward
    fragments.forEach((fragment, index) => {
      const delay = parseFloat(fragment.dataset.delay);
      const originalX = parseFloat(fragment.dataset.originalX);
      const originalY = parseFloat(fragment.dataset.originalY);

      // Calculate explosion direction
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      const angle = Math.atan2(originalY - centerY, originalX - centerX);
      const distance = 300 + Math.random() * 200;

      const targetX = originalX + Math.cos(angle) * distance;
      const targetY = originalY + Math.sin(angle) * distance;

      setTimeout(() => {
        fragment.style.transition = 'all 1s ease-out';
        fragment.style.transform = `translate(${targetX - originalX}px, ${targetY - originalY}px) rotate(${Math.random() * 360}deg) scale(0.2)`;
        fragment.style.opacity = '0';
      }, delay * 1000);
    });

    // Clean up and call callback
    setTimeout(() => {
      fragments.forEach(fragment => fragment.remove());
      if (callback) callback();
    }, 1500);
  }

  animateExplosion(callback) {
    let animationFrames = 0;
    const maxFrames = 60;

    const animate = () => {
      animationFrames++;

      // Update fragment positions
      this.fragments.forEach((fragment) => {
        fragment.position.add(
          new THREE.Vector3(
            fragment.userData.velocity.x,
            fragment.userData.velocity.y,
            fragment.userData.velocity.z
          )
        );

        fragment.rotation.x += fragment.userData.angularVelocity.x;
        fragment.rotation.y += fragment.userData.angularVelocity.y;
        fragment.rotation.z += fragment.userData.angularVelocity.z;

        // Fade out
        fragment.material.opacity *= 0.95;
      });

      this.renderer.render(this.scene, this.camera);

      if (animationFrames < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        // Clear fragments
        this.fragments.forEach((fragment) => this.scene.remove(fragment));
        this.fragments = [];
        this.threejsContainer.style.display = "none";

        if (callback) callback();
      }
    };

    animate();
  }

  createCalendarView() {
    const mainContainer = document.querySelector(".main-container");
    if (!mainContainer) {
      console.error('Main container not found for calendar creation');
      return;
    }

    console.log('Creating calendar view...');

    // Create calendar container to replace the main content
    const calendarContainer = document.createElement("div");
    calendarContainer.className = "calendar-container calendar-visible";

    try {
      calendarContainer.innerHTML = this.generateCalendarHTML();
      console.log('Calendar HTML generated successfully');
    } catch (error) {
      console.error('Error generating calendar HTML:', error);
      return;
    }

    // Replace the content of main container
    mainContainer.innerHTML = '';
    mainContainer.appendChild(calendarContainer);
    mainContainer.style.display = 'block';
    mainContainer.style.opacity = '1';

    console.log('Calendar view created and added to DOM');

    // Animate calendar assembly
    this.animateCalendarAssembly(calendarContainer);

    // Bind calendar events
    this.bindCalendarEvents(calendarContainer);
  }

  generateCalendarHTML() {
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let html = `
            <div class="calendar-header">
                <div class="calendar-nav" style="display: flex; justify-content: center;">
                    <div class="date-picker-container">
                        <select id="month-picker">
                            ${monthNames
                              .map(
                                (name, idx) =>
                                  `<option value="${idx}" ${
                                    idx === month ? "selected" : ""
                                  }>${name}</option>`
                              )
                              .join("")}
                        </select>
                        <select id="year-picker">
                            ${Array.from(
                              { length: 20 },
                              (_, i) => year - 10 + i
                            )
                              .map(
                                (y) =>
                                  `<option value="${y}" ${
                                    y === year ? "selected" : ""
                                  }>${y}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                </div>
                <div class="progress-container">
                    <label>Daily Progress:</label>
                    <div class="progress-bar">
                        <div class="progress-fill" id="daily-progress"></div>
                    </div>
                    <span id="progress-text">0%</span>
                </div>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
        `;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="calendar-day other-month"></div>';
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const dayTasks = this.getTasksForDate(date);
      const completedTasks = dayTasks.filter((task) => task.completed).length;
      const totalTasks = dayTasks.length;
      const completionPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      html += `
                <div class="calendar-day ${
                  isToday ? "today" : ""
                }" data-date="${year}-${month}-${day}">
                    <span class="day-number">${day}</span>
                    ${
                      totalTasks > 0
                        ? `<div class="task-indicator">${completedTasks}/${totalTasks}</div>`
                        : ""
                    }
                    ${
                      completionPercentage > 0
                        ? `<div class="day-progress" style="width: ${completionPercentage}%"></div>`
                        : ""
                    }
                </div>
            `;
    }

    html += `
            </div>
            <div style="text-align: center; margin-top: 40px;">
                <button class="back-btn" id="back-to-home">Back to Home</button>
            </div>
        `;

    return html;
  }

  bindCalendarEvents(container) {
    // Month/year navigation
    container.querySelector("#month-picker").addEventListener("change", (e) => {
      this.currentViewDate.setMonth(parseInt(e.target.value));
      this.updateCalendar(container);
    });

    container.querySelector("#year-picker").addEventListener("change", (e) => {
      this.currentViewDate.setFullYear(parseInt(e.target.value));
      this.updateCalendar(container);
    });

    // Day clicks
    container
      .querySelectorAll(".calendar-day:not(.other-month)")
      .forEach((day) => {
        day.addEventListener("click", (e) => {
          this.createRippleEffect(e, day);
          setTimeout(() => {
            const dateStr = day.getAttribute("data-date");
            this.showDayView(dateStr);
          }, 300);
        });
      });

    // Back button
    container.querySelector("#back-to-home").addEventListener("click", () => {
      this.backToHome();
    });
  }

  animateCalendarAssembly(calendarContainer) {
    // Start with calendar elements scattered
    const header = calendarContainer.querySelector('.calendar-header');
    const calendarDays = calendarContainer.querySelectorAll('.calendar-day');
    const dayHeaders = calendarContainer.querySelectorAll('.calendar-day-header');
    const backBtn = calendarContainer.querySelector('.back-btn');

    // Initially hide everything
    header.style.opacity = '0';
    header.style.transform = 'translateY(-50px) scale(0.8)';

    backBtn.style.opacity = '0';
    backBtn.style.transform = 'translateY(50px)';

    dayHeaders.forEach(dayHeader => {
      dayHeader.style.opacity = '0';
      dayHeader.style.transform = 'translateY(-30px)';
    });

    calendarDays.forEach((day, index) => {
      day.style.opacity = '0';
      day.style.transform = `scale(0) rotate(${Math.random() * 360}deg)`;
    });

    // Animate header first
    setTimeout(() => {
      header.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      header.style.opacity = '1';
      header.style.transform = 'translateY(0) scale(1)';
    }, 100);

    // Animate day headers
    dayHeaders.forEach((dayHeader, index) => {
      setTimeout(() => {
        dayHeader.style.transition = 'all 0.4s ease-out';
        dayHeader.style.opacity = '1';
        dayHeader.style.transform = 'translateY(0)';
      }, 300 + index * 50);
    });

    // Animate calendar days flying in from random directions
    calendarDays.forEach((day, index) => {
      const delay = 600 + index * 30;
      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 100;

      // Set initial position off-screen
      const startX = Math.cos(angle) * distance;
      const startY = Math.sin(angle) * distance;

      day.style.transform = `translate(${startX}px, ${startY}px) scale(0) rotate(${Math.random() * 360}deg)`;

      setTimeout(() => {
        day.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        day.style.opacity = '1';
        day.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
      }, delay);
    });

    // Animate back button
    setTimeout(() => {
      backBtn.style.transition = 'all 0.5s ease-out';
      backBtn.style.opacity = '1';
      backBtn.style.transform = 'translateY(0)';
    }, 1200);
  }

  updateCalendar(container) {
    // Only update the calendar grid content, not the entire calendar
    const calendarGrid = container.querySelector(".calendar-grid");
    if (calendarGrid) {
      // Generate just the calendar days
      const year = this.currentViewDate.getFullYear();
      const month = this.currentViewDate.getMonth();
      const today = new Date();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      let html = `
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
      `;

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day other-month"></div>';
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const dayTasks = this.getTasksForDate(date);
        const completedTasks = dayTasks.filter((task) => task.completed).length;
        const totalTasks = dayTasks.length;
        const completionPercentage =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        html += `
          <div class="calendar-day ${
            isToday ? "today" : ""
          }" data-date="${year}-${month}-${day}">
              <span class="day-number">${day}</span>
              ${
                totalTasks > 0
                  ? `<div class="task-indicator">${completedTasks}/${totalTasks}</div>`
                  : ""
              }
              ${
                completionPercentage > 0
                  ? `<div class="day-progress" style="width: ${completionPercentage}%"></div>`
                  : ""
              }
          </div>
        `;
      }

      calendarGrid.innerHTML = html;

      // Update the dropdowns to reflect current date
      const monthPicker = container.querySelector('#month-picker');
      const yearPicker = container.querySelector('#year-picker');

      if (monthPicker) monthPicker.value = this.currentViewDate.getMonth();
      if (yearPicker) yearPicker.value = this.currentViewDate.getFullYear();

      // Rebind only day click events
      container.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
        day.addEventListener('click', (e) => {
          this.createRippleEffect(e, day);
          setTimeout(() => {
            const dateStr = day.getAttribute('data-date');
            this.showDayView(dateStr);
          }, 300);
        });
      });
    }
  }

  createRippleEffect(event, element) {
    const ripple = document.createElement("div");
    ripple.className = "ripple ripple-animate";

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  showDayView(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const selectedDate = new Date(year, month, day);

    const mainContainer = document.querySelector(".main-container");

    // Create day view container to replace calendar
    const dayContainer = document.createElement("div");
    dayContainer.className = "day-view-container day-view-visible";
    dayContainer.innerHTML = this.generateDayViewHTML(selectedDate);

    // Replace calendar with day view
    mainContainer.innerHTML = '';
    mainContainer.appendChild(dayContainer);
    this.dayViewVisible = true;

    this.bindDayViewEvents(dayContainer, selectedDate);
  }

  generateDayViewHTML(date) {
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const dayTasks = this.getTasksForDate(date);
    const completedTasks = dayTasks.filter((task) => task.completed).length;
    const totalTasks = dayTasks.length;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const timeSlots = [
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
    ];

    let html = `
            <div class="day-view-header">
                <h2 class="day-view-title">${dateStr}</h2>
                <div class="day-progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                    </div>
                    <span class="progress-text">${completionPercentage}% Complete</span>
                </div>
                <button class="back-btn" id="back-to-calendar">Back to Calendar</button>
            </div>
            <div class="time-slots">
        `;

    timeSlots.forEach((time) => {
      const task = dayTasks.find((t) => t.time === time) || {
        text: "",
        completed: false,
      };
      html += `
                <div class="time-slot">
                    <div class="time-label">${time}</div>
                    <input type="text" class="time-content" data-time="${time}"
                           placeholder="Add a task..." value="${task.text}">
                    <label class="task-checkbox">
                        <input type="checkbox" data-time="${time}" ${
        task.completed ? "checked" : ""
      }>
                        <span class="checkmark"></span>
                    </label>
                </div>
            `;
    });

    html += "</div>";
    return html;
  }

  bindDayViewEvents(container, date) {
    // Back button
    container
      .querySelector("#back-to-calendar")
      .addEventListener("click", () => {
        this.backToCalendar();
      });

    // Task input events
    container.querySelectorAll(".time-content").forEach((input) => {
      input.addEventListener("blur", () => {
        this.saveTask(
          date,
          input.dataset.time,
          input.value,
          container.querySelector(
            `input[type="checkbox"][data-time="${input.dataset.time}"]`
          ).checked
        );
      });
    });

    // Checkbox events
    container.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const textInput = container.querySelector(
          `.time-content[data-time="${checkbox.dataset.time}"]`
        );
        this.saveTask(
          date,
          checkbox.dataset.time,
          textInput.value,
          checkbox.checked
        );
        this.updateDayProgress(container, date);
      });
    });

    this.updateDayProgress(container, date);
  }

  saveTask(date, time, text, completed) {
    const dateKey = date.toDateString();
    if (!this.tasks[dateKey]) {
      this.tasks[dateKey] = [];
    }

    const existingTaskIndex = this.tasks[dateKey].findIndex(
      (task) => task.time === time
    );

    if (text.trim() === "" && !completed) {
      // Remove empty task
      if (existingTaskIndex !== -1) {
        this.tasks[dateKey].splice(existingTaskIndex, 1);
      }
    } else {
      const taskData = { time, text: text.trim(), completed };

      if (existingTaskIndex !== -1) {
        this.tasks[dateKey][existingTaskIndex] = taskData;
      } else {
        this.tasks[dateKey].push(taskData);
      }
    }

    this.saveTasks();
  }

  updateDayProgress(container, date) {
    const dayTasks = this.getTasksForDate(date);
    const completedTasks = dayTasks.filter((task) => task.completed).length;
    const totalTasks = dayTasks.length;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const progressFill = container.querySelector(".progress-fill");
    const progressText = container.querySelector(".progress-text");

    if (progressFill && progressText) {
      progressFill.style.width = `${completionPercentage}%`;
      progressText.textContent = `${completionPercentage}% Complete`;
    }
  }

  getTasksForDate(date) {
    const dateKey = date.toDateString();
    return this.tasks[dateKey] || [];
  }

  loadTasks() {
    try {
      return JSON.parse(localStorage.getItem("taskPlannerTasks")) || {};
    } catch {
      return {};
    }
  }

  saveTasks() {
    localStorage.setItem("taskPlannerTasks", JSON.stringify(this.tasks));
  }

  backToCalendar() {
    const mainContainer = document.querySelector(".main-container");

    // Create calendar container
    const calendarContainer = document.createElement("div");
    calendarContainer.className = "calendar-container calendar-visible";
    calendarContainer.innerHTML = this.generateCalendarHTML();

    // Replace day view with calendar
    mainContainer.innerHTML = '';
    mainContainer.appendChild(calendarContainer);
    this.dayViewVisible = false;

    // Bind calendar events
    this.bindCalendarEvents(calendarContainer);
  }

  backToHome() {
    const mainContainer = document.querySelector(".main-container");
    if (mainContainer && this.originalContent) {
      // Restore original content
      mainContainer.innerHTML = this.originalContent;
      mainContainer.style.display = 'block';
      mainContainer.style.opacity = '1';
      this.calendarVisible = false;
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  }

  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.taskPlannerApp = new TaskPlannerApp();
});
