import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const refreshBudgets = useCallback(async () => {
    try {
      const fetchedBudgets = await window.api.getBudgets();
      setBudgets(fetchedBudgets);
      const total = fetchedBudgets.reduce((acc, b) => acc + b.total_amount, 0);
      setTotalBudget(total);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  }, []);

  useEffect(() => {
    refreshBudgets();
  }, [refreshBudgets]);

  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, { ...expense, id: Date.now() }]); // Add unique ID
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const totalSpent = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <BudgetContext.Provider
      value={{
        totalBudget,
        budgets,
        expenses,
        addExpense,
        deleteExpense,
        totalSpent,
        remainingBudget,
        refreshBudgets,
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