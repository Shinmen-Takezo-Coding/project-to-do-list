export const ProjectCard = {
  render(project) {
    // A clean hashtag icon to match the inline input prefix
    const hashtagSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="project-icon">
        <line x1="4" y1="9" x2="20" y2="9"></line>
        <line x1="4" y1="15" x2="20" y2="15"></line>
        <line x1="10" y1="3" x2="8" y2="21"></line>
        <line x1="16" y1="3" x2="14" y2="21"></line>
      </svg>
    `;

    // 👇 NEW: Filter down to ONLY active tasks safely
    const activeTasks = project.tasks ? project.tasks.filter(task => task._isCompleted === false) : [];
    const taskCount = activeTasks.length;
    
    // Handle the grammar beautifully
    const countText = taskCount === 1 ? "1 task" : `${taskCount} tasks`;

    return `
      <div class="task-row project-card" data-project-id="${project.id}" style="cursor: pointer;">
        
        <div class="checkbox-column" style="color: var(--sb-text-muted); display: flex; align-items: center; justify-content: center;">
          ${hashtagSvg}
        </div>
        
        <div class="content-column" style="flex-direction: row; align-items: center; justify-content: space-between; width: 100%;">
          <h4 class="task-title" style="margin-bottom: 0;">${project.name}</h4>
          
          <div class="task-meta" style="margin-top: 0;">
            <span class="due-date" style="color: var(--sb-text-muted); font-size: 12px; letter-spacing: 0.02em;">
              ${countText}
            </span>
          </div>
        </div>

      </div>
    `;
  }
};