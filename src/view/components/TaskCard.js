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

    return `
      <div class="${cardClass}" data-id="${task.id}">
        
        <!-- Left Column: The Priority / Completion Ring -->
        <div class="checkbox-column">
          <div class="priority-ring ${task.priority}"></div>
        </div>
        
        <!-- Right Column: The Content Stack -->
        <div class="content-column">
          <h4 class="task-title">${task.title}</h4>
          
          ${variant !== "compact" && task.description ? `<p class="task-desc">${task.description}</p>` : ""}
          
          <div class="task-meta">
            <span class="due-date">
              ${calendarSvg}
              ${task.dueDate}
            </span>
          </div>
        </div>

      </div>
    `;
  }
};