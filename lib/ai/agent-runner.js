import { logAgentError, logAgentInfo } from "./agent-logs";
import { markTaskCompleted, markTaskFailed, markTaskRunning } from "./agent-tasks";

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function sanitizeError(error) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || error?.code || "Unknown agent runner error";

  return cleanString(message, "Unknown agent runner error").slice(0, 500);
}

export function validateTask(task) {
  if (!task) {
    return { valid: false, reason: "Task is required." };
  }

  if (!cleanString(task.id)) {
    return { valid: false, reason: "Task id is required." };
  }

  if (!cleanString(task.agentId)) {
    return { valid: false, reason: "Task agentId is required." };
  }

  if (!cleanString(task.taskType)) {
    return { valid: false, reason: "Task taskType is required." };
  }

  return { valid: true, reason: null };
}

export async function runAgentTask(task, handler) {
  const validation = validateTask(task);
  if (!validation.valid) return null;

  const taskId = cleanString(task.id);
  const agentId = cleanString(task.agentId);

  try {
    if (typeof handler !== "function") {
      throw new Error("Task handler is required.");
    }

    await markTaskRunning(taskId);
    await logAgentInfo({
      agentId,
      taskId,
      message: "Task started",
      metadataJson: { taskType: task.taskType },
    });

    const output = await handler(task);

    await markTaskCompleted(taskId, output);
    await logAgentInfo({
      agentId,
      taskId,
      message: "Task completed",
      metadataJson: { taskType: task.taskType },
    });

    return output;
  } catch (error) {
    const message = sanitizeError(error);

    await markTaskFailed(taskId, message);
    await logAgentError({
      agentId,
      taskId,
      message,
      metadataJson: { taskType: task.taskType },
    });

    return null;
  }
}
