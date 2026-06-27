export const TaskCard = {
  render(task, variant = "default") {
    const cardClass = variant === "compact" ? "task-row compact" : "task-row";
    
// The exact calendar SVG matching the clean outline style
    const calendarSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="date-icon">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    `;

// 👇 NEW: The minimalist edit pencil
    const editSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
    `;

    // Your existing trash SVG...
    const trashSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      </svg>
    `;

    return `
      <div class="${cardClass}" data-id="${task.id}">
        
        <div class="checkbox-column">
          <div class="priority-ring ${task.priority}"></div>
        </div>
        
        <div class="content-column" style="flex-grow: 1;">
          <h4 class="task-title">${task.title}</h4>
          ${variant !== "compact" && task.description ? `<p class="task-desc">${task.description}</p>` : ""}
          <div class="task-meta">
            <span class="due-date">
              ${calendarSvg}
              ${task.dueDate}
            </span>
          </div>
        </div>

        <div class="action-column" style="display: flex; gap: 4px; margin-left: auto;">
          <button class="action-btn edit-task-btn" aria-label="Edit task">
            ${editSvg}
          </button>
          <button class="action-btn delete-task-btn" aria-label="Delete task">
            ${trashSvg}
          </button>
        </div>

      </div>
    `;
  }
};