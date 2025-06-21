import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [budgets, setBudgets] = useState([]);
  const [budgetDivisions, setBudgetDivisions] = useState([]);

  const refreshBudgets = useCallback(async () => {
    try {
      const fetchedBudgets = await window.api.getBudgets();
      setBudgets(fetchedBudgets);
      const total = fetchedBudgets.reduce((acc, b) => acc + (b.total_amount || 0), 0);
      setTotalBudget(total);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  }, []);

  const refreshBudgetDivisions = useCallback(async () => {
    try {
      const fetchedDivisions = await window.api.getBudgetDivisions();
      setBudgetDivisions(fetchedDivisions || []);
    } catch (error) {
      console.error("Error fetching budget divisions:", error);
    }
  }, []);

  useEffect(() => {
    refreshBudgets();
    refreshBudgetDivisions();
  }, [refreshBudgets, refreshBudgetDivisions]);

  return (
    <BudgetContext.Provider
      value={{
        totalBudget,
        budgets,
        budgetDivisions,
        refreshBudgets,
        refreshBudgetDivisions,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};