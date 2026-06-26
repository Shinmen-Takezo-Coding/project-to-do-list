export class Project {
  constructor(name) {
    // Initial assignment routed through setter for validation
    this.name = name;
    this._id = crypto.randomUUID();
    this._tasks = [];
  }
  
  // --- IDENTITY ---

  get name() { return this._name; }

  set name(newName) {
    if (typeof newName !== "string" || newName.trim() === "") {
      console.error("Validation Error: Project name cannot be blank.");
      return;
    }
    this._name = newName.trim();
  }

  get id() { return this._id; } // Read-only

  // --- COLLECTION MANAGEMENT ---

  /**
   * Returns a shallow copy of the tasks array to prevent external mutation.
   */
  get tasks() {
    return [...this._tasks]; 
  }

  addTask(taskInstance) {
    if (!taskInstance || !taskInstance.id) {
      console.error("Validation Error: Cannot add an invalid Task.");
      return;
    }
    this._tasks.push(taskInstance);
  }

  /**
   * Removes a task from the internal array by its unique ID.
   */
  removeTask(taskId) {
    if (!taskId) {
      console.error("Validation Error: A valid task ID must be provided for removal.");
      return;
    }

    this._tasks = this._tasks.filter(task => task.id !== taskId);
  }
}