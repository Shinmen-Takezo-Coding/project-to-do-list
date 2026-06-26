// --- DICTIONARIES & HELPERS ---

// Immutable enum for priority tiers
export const PRIORITIES = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

/**
 * Safely parses input into a native Date object.
 * Returns null if the parsed output is an invalid date (NaN).
 */
const parseDate = (dateInput) => {
  if (dateInput instanceof Date) return dateInput; 
  
  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? null : parsed;
};


// --- CORE MODEL ---

export class Task {
  constructor(title, description, dueDate, priority = PRIORITIES.LOW, projectId = "inbox-default-id", createdAt = null) {
    // Initial assignments intentionally routed through setters for validation
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.createdAt = createdAt || Date.now();
    
    this._projectId = projectId;
    this._id = crypto.randomUUID();
    this._isCompleted = false;
  }

  // --- STATE ---

  markAsCompleted() {
    this._isCompleted = true;
    this.completedAt = Date.now();
  }

  get isCompleted() { return this._isCompleted; }
  
  get id() { return this._id; } // Read-only

  // --- TITLE ---

  get title() { return this._title; }

  set title(newTitle) {
    if (typeof newTitle !== "string" || newTitle.trim() === "") {
      console.error("Validation Error: Task title cannot be blank.");
      return;
    }
    this._title = newTitle;
  }

  // --- DESCRIPTION ---

  get description() { return this._description; }

  set description(newDesc) {
    if (!newDesc) {
      this._description = "";
      return;
    }

    if (newDesc.length > 500) {
      console.error("Validation Error: Description cannot exceed 500 characters.");
      return;
    }
    this._description = newDesc.trim();
  }

  // --- PRIORITY ---

  get priority() { return this._priority; }

  set priority(newPriority) {
    if (!Object.values(PRIORITIES).includes(newPriority)) {
      console.error(`Validation Error: "${newPriority}" is not a valid priority tier.`);
      return;
    }
    this._priority = newPriority;
  }

  // --- DUE DATE ---

  /**
   * Returns a UI-ready localized string (e.g., "May 28, 2026").
   */
  get dueDate() {
    if (!this._dueDate) return "No due date";
    
    return this._dueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }); 
  }

  /**
   * Enforces valid dates, strips time properties to midnight, and blocks past dates.
   */
  set dueDate(rawDateInput) {
    const parsedDate = parseDate(rawDateInput);

    if (!parsedDate) {
      console.error(`Validation Error: "${rawDateInput}" is not a valid date format.`);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (parsedDate < today) {
      throw new Error("Task date cannot be over.");
      return;
    }

    this._dueDate = parsedDate;
  }

  // --- ROUTING ---

  get projectId() { return this._projectId; }

  set projectId(newProjectId) {
    if (!newProjectId) {
      console.error("Validation Error: Cannot assign an empty project destination.");
      return;
    }
    this._projectId = newProjectId;
  }
}