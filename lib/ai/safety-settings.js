export function getAiSafetySettingsPlaceholder() {
  return {
    executionEnabled: false,
    humanApprovalRequired: true,
    emergencyStop: false,
    readOnlyMode: true,
    policies: {
      humanApproval: {
        moneyOperations: true,
        inventoryMutations: true,
        customerCommunication: true,
        pricingChanges: true,
        refunds: true,
        orderStatusChanges: true,
      },
      execution: {
        readOnlyMode: true,
        executionMode: false,
        emergencyStopPlaceholder: true,
      },
      security: {
        auditLogging: true,
        approvalRequired: true,
        secretManagement: "Secrets must never be exposed to agents or admin responses.",
        modelAccess: "No model/provider access is enabled.",
      },
    },
    limits: {
      tasksPerHour: null,
      apiBudget: null,
      tokenBudget: null,
      monthlyCostBudget: null,
    },
    notes: {
      currentSystemStatus: "AI safety foundation is read-only.",
      aiExecutionDisabled: true,
      humanApprovalRequired: true,
    },
  };
}
