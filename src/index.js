import { Task, PRIORITIES } from "./core/Task.js";
import { Project } from "./core/Project.js";
import { AppController } from "./controller/AppController.js";
import { DashboardView } from "./view/pages/DashboardView.js";

export const projectList = [];

function routeTaskToProject(task, projectList) {
  if (!task || !projectList || !Array.isArray(projectList)) {
    console.error("Validation Error: Invalid task instance or project list provided.");
    return; 
  }

  // State trackers to know when our jobs are finished
  let oldProjectFound = false;
  let newProjectFound = false;

  for (let i = 0; i < projectList.length; i++) {
    const project = projectList[i];

    // Job 1: Find the old project and evict the task
    if (!oldProjectFound && project.id === task.projectId) { // Assuming this is the 'old' ID
      project.removeTask(task.id);
      oldProjectFound = true;
    }

    // Job 2: Find the new project and insert the task
    if (!newProjectFound && project.id === task._projectId) { // Assuming this is the 'new' ID
      console.log("Success: Routing to new project:", project.id);
      project.addTask(task);
      newProjectFound = true;
    }

    // Optimization: If both operations are complete, stop looping immediately!
    if (oldProjectFound && newProjectFound) {
      break; 
    }
  }

  console.log(inbox);
}

export function createAndSaveTaskToStorage(rawPayload) {
  const newTaskInstance = new Task(
    rawPayload.title,
    rawPayload.description,
    rawPayload.dueDate,
    rawPayload.priority,
    rawPayload.project // This is the unique project UUID string
  )

  console.log("Successfully created a new task!");
  console.log(newTaskInstance);
  console.log(projectList);

  routeTaskToProject(newTaskInstance, projectList);
}

export const inbox = new Project("Inbox");
projectList.push(inbox);

inbox._id = "inbox-default-id";

const rawFormPayload = {
  title: "Build the Mergen Platform",
  description: "Wire up the UI layer to the master controller and verify the pipeline.",
  dueDate: "30 Jun 2026",
  priority: "high",
  project: inbox.id // Passing the unique project UUID string
};

createAndSaveTaskToStorage(rawFormPayload);

AppController.init();
DashboardView.render(inbox.tasks, "Inbox");