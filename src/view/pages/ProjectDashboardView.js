import { ProjectCard } from "../components/ProjectCard.js";
import { projectList } from "../../index.js";

export const ProjectsDashboardView = {
  render(projectsArray, pageTitle = "My Projects") {
    const mainViewport = document.getElementById("main-viewport");
    mainViewport.innerHTML = "";

    // 1. Stamp out the page container shell and the two-state inline form
    mainViewport.innerHTML = `
      <div class="dashboard-container">
        <div class="page-header">
          <h1 class="page-title">${pageTitle}</h1>
        </div>
        
        <div id="project-list-container" class="project-list"></div>
        
        <button id="inline-add-project-btn" class="add-task-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E05D57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="plus-icon">
            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add project
        </button>

        <form id="inline-project-form" class="inline-creation-form" style="display: none;">
          <div class="input-wrapper">
            <span class="hashtag-prefix">#</span>
            <input type="text" id="new-project-input" placeholder="Project name" required autocomplete="off">
          </div>
          
          <div class="form-controls">
            <button type="button" id="cancel-project-btn" class="icon-btn cancel-btn" style="font-size: 15px; font-weight: 400; font-family: sans-serif; color: var(--sb-text-normal); line-height: 1;">
              ✕
            </button>
            <button type="submit" id="submit-project-btn" class="icon-btn submit-btn" style="display: grid; place-items: center; padding: 0; font-size: 14px; color: #ffffff; line-height: 0; background-color: #10b981;">
              <span style="display: block; transform: translateX(1px); line-height: 1;">➤</span>
            </button>
          </div>
        </form>

      </div>
    `;

    // 2. Loop and render any existing custom projects
    const listContainer = document.getElementById("project-list-container");
    projectsArray.forEach(project => {
       if (project.name.toLowerCase() === "inbox") return;
       listContainer.innerHTML += ProjectCard.render(project);
    });
  }
};