import { createAndSaveTaskToStorage } from "../index.js";
import { inbox } from "../index.js";
import { DashboardView } from "../view/pages/DashboardView.js";
import { projectList } from "../index.js";
import { ProjectsDashboardView } from "../view/pages/ProjectDashboardView.js";
import { Project } from "../core/Project.js";


export const AppController = (() => {

    const addTaskBtn = document.querySelector("#global-add-task-btn");
    const sidebar = document.querySelector(".sidebar");
    const closeModalBtn = document.getElementById('close-modal-btn');
    const mainDiv = document.getElementById("main-viewport");
    const todoForm = document.getElementById("todo-form");
    const taskModal = document.querySelector("#task-modal");
    let currentActiveRoute = "inbox";

    const forwardTaskData = (rawPayload) => {
        createAndSaveTaskToStorage(rawPayload);
    };

    const populateProjectDropdown = () => {
        const projectSelect = document.getElementById("task-project");
        if (!projectSelect) return;

        // 1. Wipe out any old elements from the previous view state
        projectSelect.innerHTML = "";

        // 2. Map the entire array straight to the DOM in one unified loop
        projectList.forEach(project => {
            const option = document.createElement("option");
            option.value = project.id;          // Works perfectly for both "inbox" and unique IDs
            option.textContent = project.name;  // "Inbox", "Mergen Platform", etc.
            projectSelect.appendChild(option);
        });
    };

    const updateActiveTabHighlight = () => {
    // 1. Find every single route button across all lists/ul tags
    const allNavButtons = document.querySelectorAll(".nav-route-btn");
    
    allNavButtons.forEach(button => {
        // 2. Grab the specific route identifier attached to this button
        const buttonRoute = button.dataset.route;
        
        // 3. If it matches our current global state tracker, set it to true.
        //    Otherwise, strip the active attribute completely.
        if (buttonRoute === currentActiveRoute) {
            button.setAttribute("data-active", "true");
        } else {
            button.removeAttribute("data-active");
        }
    });
    };

    const bindModalEvents = () => {

        addTaskBtn.addEventListener("click", ()=> {
            populateProjectDropdown();
            taskModal.showModal();
        });

        closeModalBtn.addEventListener("click", ()=> {
            todoForm.reset();
            taskModal.close();
        });

        todoForm.addEventListener("submit", (event) => {
            event.preventDefault();

        const taskData = {
            title: document.getElementById("task-title").value,
            description: document.getElementById("task-desc").value,
            project: document.getElementById("task-project").value,
            dueDate: document.getElementById("task-date").value,
            priority: document.getElementById("task-priority").value,
        };
            forwardTaskData(taskData);
            renderCurrentView();
            todoForm.reset();
            taskModal.close();

        });

    };

    const bindNavigationEvents = () => {
    sidebar.addEventListener("click", (event) => {
        const button = event.target.closest(".nav-route-btn");
        if (!button) return;

        // 1. Update the state
        currentActiveRoute = button.dataset.route;
        
        // 2. Call the hub
        renderCurrentView(); 
    });
    };

    const renderCurrentView = () => {
        // Update the sidebar highlight automatically
        updateActiveTabHighlight();

        // 👇 DRY HELPER: A single source of truth for what makes a task "Active"
        const filterActive = (tasksArray) => tasksArray.filter(task => task._isCompleted === false);

        if (currentActiveRoute === "inbox") {
            // Just wrap the array in your helper!
            DashboardView.render(filterActive(inbox.tasks), "Inbox");
            
        } else if (currentActiveRoute === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Harvest ALL active tasks directly
            const allActiveTasks = [];
            projectList.forEach(project => {
                allActiveTasks.push(...filterActive(project.tasks)); 
            });

            const todayTasks = allActiveTasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            });

            todayTasks.sort((taskA, taskB) => taskA.createdAt - taskB.createdAt);
            DashboardView.render(todayTasks, "Today");

        } else if (currentActiveRoute === "upcoming") {
            console.log("Upcoming view coming soon...");
            
        } else if (currentActiveRoute === "completed") { 
            const allCompleted = [];
            
            projectList.forEach(project => {
                // 1. Filter out the completed tasks for this specific project
                const doneTasks = project.tasks.filter(task => task._isCompleted === true);
                
                // 2. 👇 THE FIX: Dynamically attach the project's name directly to the task object
                doneTasks.forEach(task => {
                    task.projectName = project.name;
                });
                
                // 3. Push them into our master array
                allCompleted.push(...doneTasks);
            });
            
            // Sort newest completed tasks to the top
            allCompleted.sort((a, b) => b.completedAt - a.completedAt);
            
            // Feed it to your dynamic DashboardView
            DashboardView.render(allCompleted, "Completed");

        } else if (currentActiveRoute === "my-projects") {
            ProjectsDashboardView.render(projectList); 
            
        } else {
            // Custom Project Route
            const targetProject = projectList.find(project => project.id === currentActiveRoute);

            if (targetProject) {
                DashboardView.render(filterActive(targetProject.tasks), targetProject.name, true);
            }
        }
    };



    const bindWorkspaceEvents = () => {

        mainDiv.addEventListener("click", (event) => {

            const inlineAddTaskBtn = event.target.closest("#inline-add-task-btn");

            if (inlineAddTaskBtn) {
                populateProjectDropdown();
                taskModal.showModal();
            }

            const addProjectBtn = event.target.closest("#inline-add-project-btn");

            if (addProjectBtn) {
                document.getElementById("inline-add-project-btn").style.display = "none";
                const form = document.getElementById("inline-project-form");
                form.style.display = "flex";
                
                // UX Bonus: Instantly focus the text input so they can start typing
                document.getElementById("new-project-input").focus(); 
            }

            // 👇 NEW: 3. The Cancel Check (Hide Form)
            const cancelProjectBtn = event.target.closest("#cancel-project-btn");
            if (cancelProjectBtn) {
                document.getElementById("inline-project-form").style.display = "none";
                document.getElementById("inline-project-form").reset();
                document.getElementById("inline-add-project-btn").style.display = "flex";
            }

            const projectCard = event.target.closest(".project-card");

            if (projectCard) {
                const projectId = projectCard.dataset.projectId;
                currentActiveRoute = projectId;
                renderCurrentView();
            }

            const ring = event.target.closest(".priority-ring");

            if (ring) {
                const taskRow = ring.closest(".task-row");
                const taskId = taskRow.dataset.id;

                // 1. READ THE COLOR: Grab whatever color your border is currently using
            // 1. READ THE COLOR: Grab whatever color your border is currently using
                const computedStyle = window.getComputedStyle(ring);
                const ringColor = computedStyle.borderColor;

                // 2. THE POP: Scale up to 1.25 and fill interior
                ring.style.transition = "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.1s ease, opacity 0.15s ease";
                ring.style.transform = "scale(1.25)";
                ring.style.backgroundColor = ringColor; 
                ring.style.opacity = "1";
                
                // (Notice the task row fade logic is completely gone—the row stays 100% solid)

                // 3. THE SNAP BACK: Scale back down to 1 
                setTimeout(() => {
                    ring.style.transform = "scale(1)";
                }, 130);

                // 4. DATA PIPELINE DELAY: Wait for the snap-down to finish, then erase
                setTimeout(() => {
                    let targetTask = null;

                    projectList.forEach(project => {
                        const found = project.tasks.find(t => t._id === taskId);
                        if (found) targetTask = found;
                    });

                    if (targetTask) {
                        targetTask.markAsCompleted();
                    }
                    
                    // Sync to storage (if re-enabled later) and erase from DOM instantly
                    // localStorage.setItem("mergen_tasks", JSON.stringify(projectList));
                    renderCurrentView();

                }, 280);
            }      

            const breadcrumbBack = event.target.closest("#project-back-breadcrumb");
            if (breadcrumbBack) {
                currentActiveRoute = "my-projects"; // Sets the route back to the master list
                renderCurrentView(); // Re-renders, which loads ProjectsDashboardView automatically
            }
        });

        // Still inside bindWorkspaceEvents...
    
        mainDiv.addEventListener("submit", (event) => {
            // Only intercept if the submit came from our new inline project form
            if (event.target.id === "inline-project-form") {
                event.preventDefault(); // Stop the page from reloading
                
                // 1. Grab the raw text
                const projectName = document.getElementById("new-project-input").value;
                
                // 2. Instantiate and Save
                const newProject = new Project(projectName);
                projectList.push(newProject);
                
                // 3. Re-render the Sidebar (to show the new folder icon)
                // renderSidebarProjects(projectList);
                ProjectsDashboardView.render(projectList);
            }

        });



    };

    const init = () => {
        console.log("App Controller has booted up!");
        bindModalEvents();
        bindNavigationEvents();
        bindWorkspaceEvents();
        updateActiveTabHighlight();
    }

    return { init };

})();