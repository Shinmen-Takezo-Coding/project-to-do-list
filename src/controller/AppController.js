import { createAndSaveTaskToStorage } from "../index.js";
import { inbox } from "../index.js";
import { DashboardView } from "../view/pages/DashboardView.js";
import { projectList } from "../index.js";
import { ProjectsDashboardView } from "../view/pages/ProjectDashboardView.js";
import { Project } from "../core/Project.js";


export const AppController = (() => {

    let currentTaskToDelete = null; // Remembers the ID while the modal is open
    let currentTaskToEdit = null;
    const deleteModal = document.getElementById("delete-confirm-modal");
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
        
        // ==========================================
        // 1. ADD TASK MODAL
        // ==========================================
        addTaskBtn.addEventListener("click", ()=> {
            populateProjectDropdown();
            
            // 👇 NEW: Inject date right before opening
            if (currentActiveRoute === "today") {
                const d = new Date();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                document.getElementById("task-date").value = `${year}-${month}-${day}`;
            } else {
                document.getElementById("task-date").value = ""; 
            }

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

        // ==========================================
        // 2. DELETE CONFIRMATION MODAL
        // ==========================================
        const deleteModal = document.getElementById("delete-confirm-modal");

        deleteModal.addEventListener("click", (event) => {
            
            // CANCEL ROUTE
            if (event.target.closest("#cancel-delete-btn")) {
                currentTaskToDelete = null; // Clear memory
                deleteModal.close();
            }

            // EXECUTE ROUTE
            if (event.target.closest("#confirm-delete-btn")) {
                if (currentTaskToDelete) {
                    
                    projectList.forEach(project => {
                        project.removeTask(currentTaskToDelete); 
                    });

                    currentTaskToDelete = null; // Clear memory
                    deleteModal.close();
                    
                    // The UI wipes the deleted task away instantly
                    renderCurrentView(); 
                }
            }
        });

        // ==========================================
        // 3. EDIT TASK MODAL
        // ==========================================
        const editModal = document.getElementById("edit-task-modal");
        const editForm = document.getElementById("edit-todo-form");
        const closeEditBtn = document.getElementById("close-edit-modal-btn");

        // Cancel Button
        closeEditBtn.addEventListener("click", () => {
            editForm.reset();
            editModal.close();
            currentTaskToEdit = null;
        });

        // Save Changes Submission
        editForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // 1. Find the target task and its current project
            let targetTask = null;
            let oldProject = null;
            projectList.forEach(project => {
                const found = project.tasks.find(t => t._id === currentTaskToEdit);
                if (found) {
                    targetTask = found;
                    oldProject = project;
                }
            });

            if (targetTask) {
                // 2. Update the properties using your Class Setters
                targetTask.title = document.getElementById("edit-task-title").value;
                targetTask.description = document.getElementById("edit-task-desc").value;
                targetTask.priority = document.getElementById("edit-task-priority").value;
                
                // 👇 THE FIX: Save the new date back to the task object
                targetTask.dueDate = document.getElementById("edit-task-date").value;

                // 3. Handle Project Re-routing (if the user changed the folder)
                const newProjectId = document.getElementById("edit-task-project").value;
                if (targetTask.projectId !== newProjectId) {
                    const newProject = projectList.find(p => p.id === newProjectId);
                    if (newProject) {
                        oldProject.removeTask(targetTask.id); // Evict from old
                        targetTask.projectId = newProjectId;  // Update internal ID
                        newProject.addTask(targetTask);       // Move to new
                    }
                }
            }

            // 4. Clean up and Refresh UI
            renderCurrentView();
            editForm.reset();
            editModal.close();
            currentTaskToEdit = null;
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

            // --- INLINE TASK CREATION ---

            const inlineAddTaskBtn = event.target.closest("#inline-add-task-btn");
            if (inlineAddTaskBtn) {
                populateProjectDropdown();

                // 👇 NEW: Inject date right before opening
                if (currentActiveRoute === "today") {
                    const d = new Date();
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    document.getElementById("task-date").value = `${year}-${month}-${day}`;
                } else {
                    document.getElementById("task-date").value = ""; 
                }

                taskModal.showModal();
            }

            // --- TASK EDIT TRIGGER ---
            const editBtn = event.target.closest(".edit-task-btn");
            if (editBtn) {
                const taskRow = editBtn.closest(".task-row");
                currentTaskToEdit = taskRow.dataset.id; 

                // 1. Find the actual Task object in memory
                let targetTask = null;
                projectList.forEach(project => {
                    const found = project.tasks.find(t => t._id === currentTaskToEdit);
                    if (found) targetTask = found;
                });

                if (targetTask) {
                    // 2. Populate the Project Dropdown specifically for the edit form
                    const editProjectSelect = document.getElementById("edit-task-project");
                    editProjectSelect.innerHTML = "";
                    projectList.forEach(project => {
                        const option = document.createElement("option");
                        option.value = project.id;          
                        option.textContent = project.name;  
                        editProjectSelect.appendChild(option);
                    });

                    // 3. Inject the task's current data into the input fields
                    document.getElementById("edit-task-title").value = targetTask.title;
                    document.getElementById("edit-task-desc").value = targetTask.description || "";
                    document.getElementById("edit-task-priority").value = targetTask.priority;
                    document.getElementById("edit-task-project").value = targetTask.projectId;
                    // --- Replace your single date line with this block ---

                    if (targetTask.dueDate) {
                        // 1. Create a real Date object from your saved date string
                        const d = new Date(targetTask.dueDate);
                        
                        // 2. Extract the pieces and force them to be 2 digits (e.g., "06", not "6")
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        
                        // 3. Assemble the strict YYYY-MM-DD string
                        const html5CompatibleDate = `${year}-${month}-${day}`;
                        
                        // 4. Slap it into the modal
                        document.getElementById("edit-task-date").value = html5CompatibleDate;
                    } else {
                        // If the task had no date, ensure the modal is cleared
                        document.getElementById("edit-task-date").value = "";
                    }
                    
                    // (Optional) Reformatting the Date string for the input field can be tricky 
                    // depending on your browser format, but this handles the text block:
                    // document.getElementById("edit-task-date").value = targetTask._dueDate ? ... ; 

                    // 4. Open the Dialog
                    document.getElementById("edit-task-modal").showModal();
                }
            }

            // --- INLINE PROJECT CREATION UI ---
            const addProjectBtn = event.target.closest("#inline-add-project-btn");
            if (addProjectBtn) {
                document.getElementById("inline-add-project-btn").style.display = "none";
                const form = document.getElementById("inline-project-form");
                form.style.display = "flex";
                
                // UX Bonus: Instantly focus the text input so they can start typing
                document.getElementById("new-project-input").focus(); 
            }

            // The Cancel Check (Hide Form)
            const cancelProjectBtn = event.target.closest("#cancel-project-btn");
            if (cancelProjectBtn) {
                document.getElementById("inline-project-form").style.display = "none";
                document.getElementById("inline-project-form").reset();
                document.getElementById("inline-add-project-btn").style.display = "flex";
            }

            // --- NAVIGATION & ROUTING ---
            const projectCard = event.target.closest(".project-card");
            if (projectCard) {
                const projectId = projectCard.dataset.projectId;
                currentActiveRoute = projectId;
                renderCurrentView();
            }

            const breadcrumbBack = event.target.closest("#project-back-breadcrumb");
            if (breadcrumbBack) {
                currentActiveRoute = "my-projects"; // Sets the route back to the master list
                renderCurrentView(); // Re-renders, which loads ProjectsDashboardView automatically
            }

            // --- TASK DELETION TRIGGER ---
            const deleteBtn = event.target.closest(".delete-task-btn");
            if (deleteBtn) {
                const taskRow = deleteBtn.closest(".task-row");
                
                // Save the ID to our temporary state memory
                currentTaskToDelete = taskRow.dataset.id; 
                
                // Pop open the modal
                document.getElementById("delete-confirm-modal").showModal();
            }

            // --- TASK COMPLETION ANIMATION & LOGIC ---
            const ring = event.target.closest(".priority-ring");
            if (ring) {
                const taskRow = ring.closest(".task-row");
                const taskId = taskRow.dataset.id;

                // 1. READ THE COLOR: Grab whatever color your border is currently using
                const computedStyle = window.getComputedStyle(ring);
                const ringColor = computedStyle.borderColor;

                // 2. THE POP: Scale up to 1.25 and fill interior
                ring.style.transition = "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.1s ease, opacity 0.15s ease";
                ring.style.transform = "scale(1.25)";
                ring.style.backgroundColor = ringColor; 
                ring.style.opacity = "1";
                
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
            
    });
    
    
        // --- FORM SUBMISSIONS WITHIN WORKSPACE ---
        mainDiv.addEventListener("submit", (event) => {
            // Only intercept if the submit came from our new inline project form
            if (event.target.id === "inline-project-form") {
                event.preventDefault(); // Stop the page from reloading
                
                // 1. Grab the raw text
                const projectName = document.getElementById("new-project-input").value;
                
                // 2. Instantiate and Save
                const newProject = new Project(projectName);
                projectList.push(newProject);
                
                // 3. Re-render the Projects Dashboard
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