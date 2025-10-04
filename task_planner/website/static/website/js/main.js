/**
 * Task Planner - Three.js Enhanced Calendar with Task Management
 * Features: 3D animations, editable time slots, task completion tracking
 */

class TaskPlannerApp {
  constructor() {
    this.currentDate = new Date();
    this.currentViewDate = new Date();
    this.tasks = this.loadTasks();
    this.calendarVisible = false;
    this.dayViewVisible = false;
    this.tasksListVisible = false;
    this.currentFilter = "all"; // 'all', 'completed', 'incomplete'
    this.isAnimating = false;

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Use event delegation to handle dynamically loaded content
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "calendar-btn") {
        e.preventDefault();
        this.explodeToCalendar();
      }

      if (e.target && e.target.id === "view-tasks-btn") {
        e.preventDefault();
        this.explodeToTasksList();
      }

      // Handle navbar brand link click
      if (e.target && e.target.classList.contains("navbar-brand")) {
        // Only animate if we're not already on home
        if (
          this.calendarVisible ||
          this.tasksListVisible ||
          this.dayViewVisible
        ) {
          e.preventDefault();
          this.backToHome();
        }
      }
    });
  }

  explodeToCalendar() {
    if (this.calendarVisible || this.isAnimating) return;
    this.isAnimating = true;

    const mainContainer = document.querySelector(".main-container");
    if (!mainContainer) {
      console.error("Main container not found");
      return;
    }

    console.log("Starting origami fold animation...");

    // Store original content
    this.originalContent = mainContainer.innerHTML;

    // Add exit animation
    mainContainer.classList.add("origami-fold-exit");

    setTimeout(() => {
      console.log("Creating calendar...");
      this.createCalendarView();
      this.calendarVisible = true;

      // Remove exit animation and add enter animation
      mainContainer.classList.remove("origami-fold-exit");
      mainContainer.classList.add("origami-fold-enter");

      setTimeout(() => {
        mainContainer.classList.remove("origami-fold-enter");
        mainContainer.classList.add("origami-fold-active");
        this.isAnimating = false;
      }, 500);
    }, 500);
  }

  explodeToTasksList() {
    if (this.tasksListVisible || this.isAnimating) return;
    this.isAnimating = true;

    const mainContainer = document.querySelector(".main-container");
    if (!mainContainer) {
      console.error("Main container not found");
      return;
    }

    console.log("Starting origami fold animation...");

    // Store original content
    this.originalContent = mainContainer.innerHTML;

    // Add exit animation
    mainContainer.classList.add("origami-fold-exit");

    setTimeout(() => {
      console.log("Creating tasks list view...");
      this.createTasksListView();
      this.tasksListVisible = true;

      // Remove exit animation and add enter animation
      mainContainer.classList.remove("origami-fold-exit");
      mainContainer.classList.add("origami-fold-enter");

      setTimeout(() => {
        mainContainer.classList.remove("origami-fold-enter");
        mainContainer.classList.add("origami-fold-active");
        this.isAnimating = false;
      }, 500);
    }, 500);
  }

  createTasksListView() {
    const mainContainer = document.querySelector(".main-container");
    if (!mainContainer) {
      console.error("Main container not found for tasks list creation");
      return;
    }

    console.log("Creating tasks list view...");

    // Create tasks list container
    const tasksListContainer = document.createElement("div");
    tasksListContainer.className = "tasks-list-container";
    tasksListContainer.innerHTML = this.generateTasksListHTML();

    // Replace the content of main container
    mainContainer.innerHTML = "";
    mainContainer.appendChild(tasksListContainer);
    mainContainer.style.display = "block";
    mainContainer.style.opacity = "1";

    console.log("Tasks list view created and added to DOM");

    // Bind tasks list events
    this.bindTasksListEvents(tasksListContainer);
  }

  generateTasksListHTML() {
    // Get all tasks sorted by date
    const sortedDates = Object.keys(this.tasks).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    let html = `
      <div class="tasks-list-header">
        <h2 class="tasks-list-title">All Tasks</h2>
        <div class="filter-buttons">
          <button class="filter-btn ${
            this.currentFilter === "all" ? "active" : ""
          }" data-filter="all">All</button>
          <button class="filter-btn ${
            this.currentFilter === "incomplete" ? "active" : ""
          }" data-filter="incomplete">Incomplete</button>
          <button class="filter-btn ${
            this.currentFilter === "completed" ? "active" : ""
          }" data-filter="completed">Completed</button>
        </div>
        <button class="back-btn" id="back-to-home-from-tasks">Back to Home</button>
      </div>
      <div class="tasks-list-content">
    `;

    if (sortedDates.length === 0) {
      html += `
        <div class="no-tasks-message">
          <p>No tasks found. Start by creating your first task!</p>
        </div>
      `;
    } else {
      sortedDates.forEach((dateKey) => {
        const tasks = this.tasks[dateKey];
        const date = new Date(dateKey);
        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Filter tasks based on current filter
        let filteredTasks = tasks;
        if (this.currentFilter === "completed") {
          filteredTasks = tasks.filter((t) => t.completed);
        } else if (this.currentFilter === "incomplete") {
          filteredTasks = tasks.filter((t) => !t.completed);
        }

        // Only show date section if there are tasks after filtering
        if (filteredTasks.length > 0) {
          html += `
            <div class="date-section">
              <h3 class="date-header">${formattedDate}</h3>
              <div class="tasks-for-date">
          `;

          // Sort tasks by time
          filteredTasks.sort((a, b) => {
            const timeA = a.time || "00:00";
            const timeB = b.time || "00:00";
            return timeA.localeCompare(timeB);
          });

          filteredTasks.forEach((task) => {
            const completedClass = task.completed ? "task-completed" : "";
            html += `
              <div class="task-list-item ${completedClass}">
                <div class="task-time-badge">${task.time || "No time"}</div>
                <div class="task-text">${task.text}</div>
                <div class="task-status">
                  ${task.completed ? "✓ Completed" : "○ Incomplete"}
                </div>
              </div>
            `;
          });

          html += `
              </div>
            </div>
          `;
        }
      });
    }

    html += `
      </div>
    `;

    return html;
  }

  bindTasksListEvents(container) {
    // Back button
    const backBtn = container.querySelector("#back-to-home-from-tasks");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.backToHome();
      });
    }

    // Filter buttons
    const filterBtns = container.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.currentFilter = e.target.dataset.filter;
        // Refresh the tasks list view
        container.innerHTML = this.generateTasksListHTML();
        this.bindTasksListEvents(container);
      });
    });
  }

  createCalendarView() {
    const mainContainer = document.querySelector(".main-container");
    if (!mainContainer) {
      console.error("Main container not found for calendar creation");
      return;
    }

    console.log("Creating calendar view...");

    // Create calendar container to replace the main content
    const calendarContainer = document.createElement("div");
    calendarContainer.className = "calendar-container calendar-visible";

    try {
      calendarContainer.innerHTML = this.generateCalendarHTML();
      console.log("Calendar HTML generated successfully");
    } catch (error) {
      console.error("Error generating calendar HTML:", error);
      return;
    }

    // Replace the content of main container
    mainContainer.innerHTML = "";
    mainContainer.appendChild(calendarContainer);
    mainContainer.style.display = "block";
    mainContainer.style.opacity = "1";

    console.log("Calendar view created and added to DOM");

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
    const header = calendarContainer.querySelector(".calendar-header");
    const calendarDays = calendarContainer.querySelectorAll(".calendar-day");
    const dayHeaders = calendarContainer.querySelectorAll(
      ".calendar-day-header"
    );
    const backBtn = calendarContainer.querySelector(".back-btn");

    // Initially hide everything
    header.style.opacity = "0";
    header.style.transform = "translateY(-50px) scale(0.8)";

    backBtn.style.opacity = "0";
    backBtn.style.transform = "translateY(50px)";

    dayHeaders.forEach((dayHeader) => {
      dayHeader.style.opacity = "0";
      dayHeader.style.transform = "translateY(-30px)";
    });

    calendarDays.forEach((day, index) => {
      day.style.opacity = "0";
      day.style.transform = `scale(0) rotate(${Math.random() * 360}deg)`;
    });

    // Animate header first
    setTimeout(() => {
      header.style.transition =
        "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      header.style.opacity = "1";
      header.style.transform = "translateY(0) scale(1)";
    }, 100);

    // Animate day headers
    dayHeaders.forEach((dayHeader, index) => {
      setTimeout(() => {
        dayHeader.style.transition = "all 0.4s ease-out";
        dayHeader.style.opacity = "1";
        dayHeader.style.transform = "translateY(0)";
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

      day.style.transform = `translate(${startX}px, ${startY}px) scale(0) rotate(${
        Math.random() * 360
      }deg)`;

      setTimeout(() => {
        day.style.transition =
          "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        day.style.opacity = "1";
        day.style.transform = "translate(0, 0) scale(1) rotate(0deg)";
      }, delay);
    });

    // Animate back button
    setTimeout(() => {
      backBtn.style.transition = "all 0.5s ease-out";
      backBtn.style.opacity = "1";
      backBtn.style.transform = "translateY(0)";
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
      const monthPicker = container.querySelector("#month-picker");
      const yearPicker = container.querySelector("#year-picker");

      if (monthPicker) monthPicker.value = this.currentViewDate.getMonth();
      if (yearPicker) yearPicker.value = this.currentViewDate.getFullYear();

      // Rebind only day click events
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
    console.log("=== SHOW DAY VIEW DEBUG ===");
    console.log("Date string from calendar:", dateStr);

    const [year, month, day] = dateStr.split("-").map(Number);
    const selectedDate = new Date(year, month, day);

    console.log("Parsed date:", selectedDate);
    console.log("Date key will be:", selectedDate.toDateString());
    console.log("Current tasks object:", this.tasks);
    console.log(
      "Tasks for this date:",
      this.tasks[selectedDate.toDateString()]
    );

    const mainContainer = document.querySelector(".main-container");

    // Create day view container to replace calendar
    const dayContainer = document.createElement("div");
    dayContainer.className = "day-view-container day-view-visible";
    dayContainer.innerHTML = this.generateDayViewHTML(selectedDate);

    // Replace calendar with day view
    mainContainer.innerHTML = "";
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

    console.log("=== DAY VIEW DEBUG ===");
    console.log("Date:", date);
    console.log("Date key:", date.toDateString());
    console.log("Day tasks:", dayTasks);
    console.log("Time slots:", timeSlots);

    timeSlots.forEach((time) => {
      // Flexible time matching - try multiple formats
      const task = dayTasks.find((t) => {
        // Direct match
        if (t.time === time) return true;
        // With seconds (e.g., "12:00:00" vs "12:00")
        if (t.time === time + ":00") return true;
        // Remove seconds from stored time
        if (t.time && t.time.substring(0, 5) === time) return true;
        // Without leading zero (e.g., "8:00" vs "08:00")
        const timeWithoutLeadingZero = time.replace(/^0/, "");
        if (
          t.time === timeWithoutLeadingZero ||
          t.time === timeWithoutLeadingZero + ":00"
        )
          return true;
        return false;
      }) || {
        text: "",
        completed: false,
      };

      console.log(`Time slot ${time}: Found task:`, task);

      const hasTask = task.text && task.text.trim() !== "";

      html += `
                <div class="time-slot">
                    <div class="time-label">${time}</div>
                    <input type="text" class="time-content" data-time="${time}"
                           placeholder="Add a task..." value="${task.text}">
                    <label class="task-checkbox">
                        <input type="checkbox" data-time="${time}" ${
        task.completed ? "checked" : ""
      } ${!hasTask ? "disabled" : ""}>
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
    const tasks = this.tasks[dateKey] || [];
    console.log(`Getting tasks for ${dateKey}:`, tasks);
    return tasks;
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
    mainContainer.innerHTML = "";
    mainContainer.appendChild(calendarContainer);
    this.dayViewVisible = false;

    // Bind calendar events
    this.bindCalendarEvents(calendarContainer);
  }

  backToHome() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const mainContainer = document.querySelector(".main-container");
    if (!mainContainer || !this.originalContent) {
      // Fallback: reload the page
      window.location.reload();
      return;
    }

    // Add exit animation
    mainContainer.classList.add("origami-fold-exit");

    setTimeout(() => {
      // Restore original content
      mainContainer.innerHTML = this.originalContent;
      mainContainer.style.display = "block";
      mainContainer.style.opacity = "1";

      // Reset view states
      this.calendarVisible = false;
      this.tasksListVisible = false;
      this.dayViewVisible = false;

      // Remove exit animation and add enter animation
      mainContainer.classList.remove("origami-fold-exit");
      mainContainer.classList.add("origami-fold-enter");

      setTimeout(() => {
        mainContainer.classList.remove("origami-fold-enter");
        mainContainer.classList.add("origami-fold-active");
        this.isAnimating = false;
      }, 500);
    }, 500);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.taskPlannerApp = new TaskPlannerApp();
});
