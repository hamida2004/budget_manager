import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaBars, FaMoneyBillWave } from "react-icons/fa";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { jsPDF } from "jspdf";
import Nav from "../components/nav";
import SideBar from "../components/SideBar";
import Button from "../components/button";
import { useUser } from "../context/userContext";

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

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  margin: 5px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
  padding: 8px 20px;
  width: 100%;
  border-radius: 4px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const List = styled.ul`
  list-style: none;
  padding-left: 0px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin: 5px 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 20px;
`;

const DateInput = styled.input`
  padding: 5px;
  border: 1px solid #001A82;
  border-radius: 8px;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  margin: 8px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const Report = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budgetDivisions, setBudgetDivisions] = useState([]);
  const [sousarticles, setSousarticles] = useState([]);
  const [laboratory, setLaboratory] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredBudgetDivisions, setFilteredBudgetDivisions] = useState([]);
  const [error, setError] = useState("");
  const [openDivisions, setOpenDivisions] = useState({});

  const getSousArticleName = (id) => {
    const article = sousarticles.find((a) => a.id === id);
    return article ? article.name : "Unknown";
  };

  useEffect(() => {
    if (!user) return navigate("/login");
    (async () => {
      try {
        const [divs, sous, lab] = await Promise.all([
          window.api.getBudgetDivisions(),
          window.api.getSousarticles(),
          window.api.getLaboratory(),
        ]);
        // Assume getBudgetDivisions returns joined data with budgets.created_at and budgets.type
        setBudgetDivisions(divs);
        setSousarticles(sous);
        setLaboratory(lab[0] || {});
        setFilteredBudgetDivisions(divs); // Initially show all divisions
        console.log(budgetDivisions,'///')
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data.");
      }
    })();
  }, [user, navigate]);

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      setError("Please select both start and end dates.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");
    const filtered = budgetDivisions.filter((div) => {
      const divDate = new Date(div.created_at);
      return divDate >= new Date(fromDate) && divDate <= new Date(toDate);
    });
    setFilteredBudgetDivisions(filtered);
  };

  const toggleDivision = (id) => {
    setOpenDivisions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateSousarticleTotals = (divs) => {
    const totals = {};
    sousarticles.forEach((sa) => {
      totals[sa.id] = 0;
    });
    divs.forEach((div) => {
      totals[div.sousarticle_id] = (totals[div.sousarticle_id] || 0) + div.amount;
    });
    return Object.entries(totals)
      .filter(([_, total]) => total > 0)
      .map(([id, total]) => ({
        id: parseInt(id),
        name: getSousArticleName(id),
        total,
      }));
  };


  // Last 5 budget divisions for summary
  const lastFiveDivisions = budgetDivisions.slice(-5).reverse();

  return (
    <>
      <Nav />
      <Container>
        <FaBars
          size={24}
          style={{ cursor: "pointer", alignSelf: "flex-start", position: "absolute" }}
          onClick={() => setSidebarOpen(true)}
        />
        <h2 style={{ color: "#001A82" }}>Report & History</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Section>
          <h3>Recent Budget Divisions</h3>
          <List>
            {lastFiveDivisions.map((div) => {
              const amount = div.budget_type === "additional" ? `+${div.amount.toFixed(2)} DA` : `-${div.amount.toFixed(2)} DA`;
              const date = new Date(div.created_at).toISOString().split("T")[0];
              // const date = div.created_at;
              const number = div.sousarticle_id.toString();
              const name = getSousArticleName(div.sousarticle_id);
              const type = div.budget_type === "initial" ? "expense" : "income";
              return (
                <li key={div.id}>
                  <ToggleButton onClick={() => toggleDivision(div.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaMoneyBillWave size={20} color="#001A82" />
                      <span>{name}</span>
                    </div>
                    <div>{openDivisions[div.id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}</div>
                  </ToggleButton>
                  {openDivisions[div.id] && (
                    <TransactionItem>
                      <span>Amount: {amount}</span>
                      <span>Date: {date}</span>
                      <span>Sousarticle Number: {number}</span>
                      <span>Type: {type}</span>
                    </TransactionItem>
                  )}
                </li>
              );
            })}
          </List>
        </Section>
        <Section>
          <h3>Filter Budget Divisions</h3>
          <FilterContainer>
            <DateInput
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <DateInput
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <Button text="Filter" handleClick={handleFilter} />
          </FilterContainer>
          <List>
            {filteredBudgetDivisions.map((div) => {
              const amount = div.budget_type === "additional" ? `+${div.amount.toFixed(2)} DA` : `-${div.amount.toFixed(2)} DA`;
              const date = new Date(div.created_at).toISOString().split("T")[0];
              // const date = div.created_at;
              const number = div.sousarticle_id.toString();
              const name = getSousArticleName(div.sousarticle_id);
              const type = div.budget_type === "initial" ? "expense" : "income";
              return (
                <li key={div.id}>
                  <ToggleButton onClick={() => toggleDivision(div.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaMoneyBillWave size={20} color="#001A82" />
                      <span>{name}</span>
                    </div>
                    <div>{openDivisions[div.id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}</div>
                  </ToggleButton>
                  {openDivisions[div.id] && (
                    <TransactionItem>
                      <span>Amount: {amount}</span>
                      <span>Date: {date}</span>
                      <span>Sousarticle Number: {number}</span>
                      <span>Type: {type}</span>
                    </TransactionItem>
                  )}
                </li>
              );
            })}
          </List>
        </Section>
        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Container>
    </>
  );
};

export default Report;