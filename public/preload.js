const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    // Authentication
    hasUsers: () => ipcRenderer.invoke("has-users"),
    register: (userData) => ipcRenderer.invoke("register", userData),
    login: (credentials) => ipcRenderer.invoke("login", credentials),

    // CRUD Operations
    getUsers: () => ipcRenderer.invoke("get-users"),
    addUser: (user) => ipcRenderer.invoke("add-users", user),
    updateUser: (user) => ipcRenderer.invoke("update-users", user),
    deleteUser: (id) => ipcRenderer.invoke("delete-users", id),

    // Laboratory
    getLaboratory: () => ipcRenderer.invoke("get-laboratory"),
    updateLaboratory: (lab) => ipcRenderer.invoke("update-laboratory", lab),
    addLaboratory: (lab) => ipcRenderer.invoke("add-laboratory", lab),

    // Chapters
    getChapters: () => ipcRenderer.invoke("get-chapters"),
    addChapter: (chapter) => ipcRenderer.invoke("add-chapters", chapter),
    deleteChapter: (id) => ipcRenderer.invoke("delete-chapters", id),

    // Articles
    getArticles: () => ipcRenderer.invoke("get-articles"),
    addArticle: (article) => ipcRenderer.invoke("add-articles", article),
    deleteArticle: (id) => ipcRenderer.invoke("delete-articles", id),

    // Subarticles
    getSousarticles: () => ipcRenderer.invoke("get-sousarticles"),
    addSousarticle: (subarticle) => ipcRenderer.invoke("add-sousarticles", subarticle),
    deleteSousarticle: (id) => ipcRenderer.invoke("delete-sousarticles", id),

    // Budgets
    getBudgets: () => ipcRenderer.invoke("get-budgets"),
    addBudget: (budget) => ipcRenderer.invoke("add-budgets", budget),
    updateBudgets: (budget) => ipcRenderer.invoke("update-budgets", budget),
    deleteBudget: (id) => ipcRenderer.invoke("delete-budgets", id),

    getNotifications: () => ipcRenderer.invoke("get-notifications"),
    addNotification: (notification) => ipcRenderer.invoke("add-notifications", notification),
    deleteNotification: (id) => ipcRenderer.invoke("delete-notifications", id),

    // Budget Divisions
    getBudgetDivisions: () => ipcRenderer.invoke("get-budget_divisions"),
    addBudgetDivision: (division) => ipcRenderer.invoke("add-budget_divisions", division),
    getTotalBudget: () => ipcRenderer.invoke("get-total_budget"),
    addTotalBudget: (budget) => ipcRenderer.invoke("add-total_budget", budget),
    updateTotalBudget: (budget) => ipcRenderer.invoke("update-total_budget", budget),

    // Expenses
    getExpensesByDivision: (divisionId) => ipcRenderer.invoke("get-expenses-by-division", divisionId),
    addExpense: (expense) => ipcRenderer.invoke("add-expense", expense),

});