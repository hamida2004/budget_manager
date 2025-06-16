import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { MdAdd, MdDelete } from "react-icons/md";
import { useBudget } from "../context/budgetContext";

const Container = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
`;

const Section = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const Form = styled.form`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const BudgetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const ManageBudgets = () => {
  const { budgets, totalBudget, refreshBudgets } = useBudget();
  const [form, setForm] = useState({ year: "", total_amount: "", type: "initial", spent: 0 });

  useEffect(() => {
    refreshBudgets();
  }, [refreshBudgets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.type === "initial" && initialExists(form.year)) {
        alert("An initial budget already exists for this year.");
        return;
      }
      await window.api.addBudget({
        ...form,
        total_amount: parseFloat(form.total_amount) || 0,
      });

      await window.api.addNotification({
        title: "New Budget Added",
        content: `A new budget of ${parseFloat(form.total_amount).toFixed(2)} DA of type ${form.type} was added.`,
        amount: parseFloat(form.total_amount),
      });
      refreshBudgets();
      setForm({ year: "", total_amount: "", type: "initial", spent: 0 });
    } catch (error) {
      console.error("Error adding budget:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await window.api.deleteBudget(id);
      refreshBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const initialExists = (year) =>
    budgets.some((b) => b.year === parseInt(year) && b.type === "initial");

  return (
    <Container>
      <h2 style={{ color: "#00092B" }}>Manage Budgets</h2>
      <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
        <h3>
          Total Budget:{" "}
          <span style={{ color: "#00092B", marginLeft: 8 }}>{totalBudget} DA</span>
        </h3>
      </div>

      <Section>
        <h3>Create New Budget</h3>
        <Form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Total Amount"
            value={form.total_amount}
            onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="initial" disabled={initialExists(form.year)}>
              Initial
            </option>
            <option value="additional">Additional</option>
          </select>
          <button type="submit">
            <MdAdd size={20} color="#00092B" />
          </button>
        </Form>
      </Section>

      <Section>
        <h3>Existing Budgets</h3>
        {budgets.length > 0 ? (
          budgets.map((b) => (
            <BudgetItem key={b.id}>
              <div>
                {b.year} - {b.type}: {b.total_amount} DA
              </div>
              <span>
                added at {new Date(b.created_at).toISOString().split("T")[0]}
              </span>
              <MdDelete
                size={20}
                color="red"
                onClick={() => handleDelete(b.id)}
                style={{ cursor: "pointer" }}
              />
            </BudgetItem>
          ))
        ) : (
          <p>No budgets found.</p>
        )}
      </Section>

      <Link to="/">Go Back</Link>
    </Container>
  );
};

export default ManageBudgets;