import { TaskCard } from "../components/TaskCard.js";
import { CompletedTaskCard } from "../components/CompletedTaskCard.js"; 

export const DashboardView = {
  // Notice the 3rd parameter: isCustomProject defaults to false
  render(tasksArray, pageTitle = "Inbox", isCustomProject = false) {
    const mainViewport = document.getElementById("main-viewport");
    mainViewport.innerHTML = "";

    mainViewport.innerHTML = `
      <div class="dashboard-container">
        
        <div class="page-header" style="margin-bottom: 24px;">
          
          ${isCustomProject ? `
            <div class="breadcrumb-trail" style="font-size: 13px; color: #8b8b8b; margin-bottom: 8px;">
              <span id="project-back-breadcrumb" style="cursor: pointer; transition: color 0.15s ease;" onmouseover="this.style.color='#e0e0e0'" onmouseout="this.style.color='#8b8b8b'">My Projects</span>
              <span style="margin-left: 4px; color: #5a5a60;">/</span>
            </div>
          ` : ""}
          
          <h1 class="page-title" style="margin: 0; font-size: 28px; font-weight: 700;">${pageTitle}</h1>
        </div>
        
        <div id="task-list-container" class="task-list"></div>
        
        ${pageTitle !== "Completed" ? `
          <button id="inline-add-task-btn" class="add-task-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="plus-icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add task
          </button>
        ` : ""}
      </div>
    `;

    const listContainer = document.getElementById("task-list-container");
    
    // Dynamic Rendering: Standard Tasks vs. Completed Logbook
    tasksArray.forEach(task => {
      if (pageTitle === "Completed") {
        listContainer.innerHTML += CompletedTaskCard.render(task, task.projectName || "Inbox");
      } else {
        listContainer.innerHTML += TaskCard.render(task, "default");
      }
    });
  }
};