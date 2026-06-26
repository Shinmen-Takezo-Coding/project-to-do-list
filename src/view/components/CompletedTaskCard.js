export const CompletedTaskCard = {
  render(task, projectName = "Inbox") {
    // 1. Format the timestamp to match "24 Jun 2026 21:56"
    // We use a fallback to Date.now() just in case a legacy task is missing the property
    const timestamp = task.completedAt ? task.completedAt : Date.now();
    const dateObj = new Date(timestamp);
    
    // Using Intl.DateTimeFormat for clean, native string formatting
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).replace(",", ""); // Strips the comma to match your exact image reference

    // 2. Build the HTML structure
    return `
      <div class="task-row completed-card" data-id="${task._id}">
        
        <div class="content-column" style="flex-direction: row; align-items: center; justify-content: space-between; width: 100%;">
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #8b8b8b; font-size: 13px;">You completed</span>
            <span class="task-title" style="margin: 0; font-weight: 500; color: #e0e0e0;">
              ${task.title}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; color: #8b8b8b; font-size: 12px;">
            <span class="project-badge"># ${projectName}</span>
            <span class="completion-time">${formattedDate}</span>
          </div>

        </div>

      </div>
    `;
  }
};