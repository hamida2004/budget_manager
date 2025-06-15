import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaBars, FaMoneyBillWave, FaFlask, FaTools, FaCar, FaLightbulb, FaUserTie, FaWrench, FaRecycle } from "react-icons/fa";
import { MdAdd, MdDelete, MdExpandLess, MdExpandMore, MdSave } from "react-icons/md";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import Nav from "../components/nav";
import SideBar from "../components/SideBar";
import Button from "../components/button";
import { useUser } from "../context/userContext";
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

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  margin: 5px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.3);
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

const AddInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AddInput = styled.input`
  width: 150px;
  padding: 5px;
  border: 1px solid #001A82;
  border-radius: 8px;
`;

const ChapterTitle = styled.div`
  color: #001A82;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
`;

const BudgetSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  width: 100%;
`;

const BudgetDevisions = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { addExpense, deleteExpense } = useBudget();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [sousarticles, setSousarticles] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [openArticles, setOpenArticles] = useState({});
  const [expenseInputs, setExpenseInputs] = useState({});
  const [error, setError] = useState("");
  const [laboratory, setLaboratory] = useState({});
  const [addInputVisible, setAddInputVisible] = useState({});
  const [newItemName, setNewItemName] = useState({});
  const [budgets, setBudgets] = useState([]);
  const [budgetDivisions, setBudgetDivisions] = useState([]);

  // Icon and color mapping for chapters
  const chapterStyles = {
    "REMBOURSEMENT DES FRAIS": { icon: FaMoneyBillWave, color: "#e74c3c" },
    "FOURNITURES": { icon: FaFlask, color: "#3498db" },
    "CHARGES ANNEXES": { icon: FaTools, color: "#2ecc71" },
    "PARC AUTOMOBILE": { icon: FaCar, color: "#f1c40f" },
    "FRAIS DE VALORISATION ET DE DEVELOPPEMENT TECHNOLOGIQUE": { icon: FaLightbulb, color: "#9b59b6" },
    "RETRIBUTION DES ACTIVITES DES CHERCHEURS": { icon: FaUserTie, color: "#e67e22" },
    "Maintenance des équipements scientifique, informatique et matériels de reprographie": { icon: FaWrench, color: "#1abc9c" },
    "Renouvellement des équipements scientifique et informatique": { icon: FaRecycle, color: "#34495e" },
  };

  const fetchBudgetDivisions = async () => {
    try {
      const devs = await window.api.getBudgetDivisions();
      setBudgetDivisions(devs);
    } catch (error) {
      console.error("Error fetching budget divisions:", error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const budgetsData = await window.api.getBudgets();
      setBudgets(budgetsData);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const getSousArticleName = (id) => {
    const article = sousarticles.find((a) => a.id === id);
    return article ? article.name : "غير معروف";
  };
  useEffect(() => {
    if (!user) return navigate("/login");
    (async () => {
      try {
        const [ch, ar, so] = await Promise.all([
          window.api.getChapters(),
          window.api.getArticles(),
          window.api.getSousarticles(),
        ]);
        setChapters(ch);
        setArticles(ar);
        setSousarticles(so);
        fetchLaboratory();
        fetchBudgets();
        console.log(budgets)
        fetchBudgetDivisions();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load budget data.");
      }
    })();
  }, [user, navigate]);

  const totalBudget = budgets.reduce((sum, budget) => sum + (budget.total_amount || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  const generatePDF = async () => {
    try {
      const container = document.createElement("div");
      container.style.padding = "20px";
      container.style.fontFamily = "Arial";
      container.style.fontSize = "12px";
      container.style.background = "#fff";
      container.style.width = "800px";
      container.style.margin = "0 auto";

      const heading = document.createElement("h2");
      heading.textContent = "تقسيم ميزانية التسيير الخاصة بمخبر الذكاء الاصطناعي وتطبيقاته";
      heading.style.textAlign = "center";
      heading.style.color = "#001a82";
      container.appendChild(heading);

      if (laboratory) {
        const labInfo = document.createElement("div");
        labInfo.style.marginBottom = "20px";
        labInfo.innerHTML = `
          <p><strong>Laboratory Name:</strong> ${laboratory.name}</p>
          <p><strong>Wilaya:</strong> ${laboratory.wilaya}</p>
          <p><strong>University:</strong> ${laboratory.univ}</p>
        `;
        container.appendChild(labInfo);
      }

      const summary = document.createElement("div");
      summary.style.marginBottom = "20px";
      summary.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 80%;">
          <p><strong>Total Budget:</strong> ${totalBudget.toFixed(2)} DA</p>
          <p><strong>Total Spent:</strong> ${totalSpent.toFixed(2)} DA</p>
          <p><strong>Remaining:</strong> ${totalRemaining.toFixed(2)} DA</p>
        </div>
        <div style="margin-top: 10px;">
          ${budgets.map(budget => `
            <p><strong>Budget ${budget.id}:</strong> Total ${budget.total_amount.toFixed(2)} DA, 
            Spent ${budget.spent.toFixed(2)} DA, 
            Remaining ${(budget.total_amount - budget.spent).toFixed(2)} DA</p>
          `).join('')}
        </div>
      `;
      container.appendChild(summary);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.border = "1px solid black";
      table.innerHTML = `
        <thead style="background-color:#001a82; color:white;">
          <tr>
            <th style="border: 1px solid #000; padding: 5px;">#</th>
            <th style="border: 1px solid #000; padding: 5px;">Name</th>
            <th style="border: 1px solid #000; padding: 5px;">Amount (DA)</th>
            <th style="border: 1px solid #000; padding: 5px;">Budget Name</th>
          </tr>
        </thead>
        <tbody>
          ${budgetDivisions
          .map((exp, i) => {
            const division = budgetDivisions.find(div => div.sousarticle_id === exp.sousarticle_id);
            const budget = budgets.find(b => b.id === division?.budget_id);
            console.log(budget)
            return `
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;">${i + 1}</td>
                  <td style="border: 1px solid #000; padding: 5px;">${getSousArticleName(exp.sousarticle_id)}</td>
                  <td style="border: 1px solid #000; padding: 5px;">${parseFloat(exp.amount).toFixed(2)} DA</td>
                  <td style="border: 1px solid #000; padding: 5px;">${budget ? `${budget.type} ${budget.id}` : 'N/A'}</td>
                </tr>
              `;
          })
          .join("")}
        </tbody>
      `;
      container.appendChild(table);

      container.style.position = "absolute";
      container.style.top = "-9999px";
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      pdf.save("budget-report.pdf");

      document.body.removeChild(container);
      alert("✅ PDF generated successfully!");
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      alert("Failed to generate PDF. Please check the console.");
    }
  };

  const fetchLaboratory = async () => {
    try {
      const lab = await window.api.getLaboratory();
      setLaboratory(lab[0] || {});
    } catch (error) {
      console.error("Error fetching laboratory:", error);
    }
  };

  const toggleChapter = (id) => {
    setOpenChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleArticle = (id) => {
    setOpenArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteChapter = async (id) => {
    try {
      await window.api.deleteChapter(id);
      setChapters((prev) => prev.filter((ch) => ch.id !== id));
    } catch (error) {
      console.error("Error deleting chapter:", error);
      setError("Failed to delete chapter.");
    }
  };

  const addItem = async (articleId, name) => {
    if (!name || name.trim() === "") {
      setError("Please enter a valid item name.");
      return;
    }
    try {
      const newItem = { name: name.trim(), article_id: articleId };
      const result = await window.api.addSousarticle(newItem);
      setSousarticles((prev) => [...prev, result]);
      setAddInputVisible((prev) => ({ ...prev, [articleId]: false }));
      setNewItemName((prev) => ({ ...prev, [articleId]: "" }));
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item.");
    }
  };

  const toggleAddInput = (articleId) => {
    setAddInputVisible((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
    if (!addInputVisible[articleId]) {
      setNewItemName((prev) => ({ ...prev, [articleId]: "" }));
    }
  };

  const handleNewItemName = (articleId, value) => {
    setNewItemName((prev) => ({ ...prev, [articleId]: value }));
  };

  const deleteArticle = async (id) => {
    try {
      await window.api.deleteArticle(id);
      setArticles((prev) => prev.filter((ar) => ar.id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
      setError("Failed to delete article.");
    }
  };

  const deleteItem = async (id) => {
    try {
      await window.api.deleteSousarticle(id);
      setSousarticles((prev) => prev.filter((sa) => sa.id !== id));
      const divisions = budgetDivisions.filter((div) => div.sousarticle_id === id);
      for (const division of divisions) {
        await deleteExpense(division.id);
      }
      fetchBudgetDivisions();
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item.");
    }
  };

  const handleExpenseInput = (sousarticleId, budgetId, value) => {
    setExpenseInputs((prev) => ({
      ...prev,
      [`${sousarticleId}_${budgetId}`]: parseFloat(value) || 0,
    }));
  };

  const saveExpense = async (e, sousarticleId, articleId, name, budgetId) => {
    e.preventDefault()
    setError("");
    const amount = expenseInputs[`${sousarticleId}_${budgetId}`];
    const budget = budgets.find(b => b.id === budgetId);

    if (!amount || amount <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (budget.total_amount - budget.spent <= 0) {
      setError(`Cannot add expenses: No remaining budget for Budget ${budgetId}.`);
      return;
    }

    if (amount > budget.total_amount - budget.spent) {
      setError(`Expense amount exceeds remaining budget for Budget ${budgetId}.`);
      return;
    }

    try {
      // Add budget division
      await window.api.addBudgetDivision({
        budget_id: budgetId,
        sousarticle_id: sousarticleId,
        amount,
      });

      // Update budget's spent amount
      const newSpent = budget.spent + amount;
      await window.api.updateBudgets({
        id: budgetId,
        year: budget.year,
        total_amount: budget.total_amount,
        spent: newSpent,
      });

      // Update local budgets state
      setBudgets(prevBudgets =>
        prevBudgets.map(b =>
          b.id === budgetId ? { ...b, spent: newSpent } : b
        )
      );

      // Add expense
      await addExpense({ sousarticle_id: sousarticleId, article_id: articleId, name, amount });

      // Add notification
      await window.api.addNotification({
        title: "New Expense Added",
        content: `An expense of ${parseFloat(amount).toFixed(2)} DA was added for "${name}" in Budget ${budgetId}.`,
        amount: amount,
      });

      // Clear input
      setExpenseInputs((prev) => ({ ...prev, [`${sousarticleId}_${budgetId}`]: 0 }));

      // Refresh divisions
      fetchBudgetDivisions();
    } catch (error) {
      console.error("Error saving expense:", error);
      setError(`Failed to save expense: ${error.message}`);
    }
  };

  const calculateArticleTotal = (articleId) => {
    return budgetDivisions
      .filter((div) => sousarticles.find((sa) => sa.id === div.sousarticle_id && sa.article_id === articleId))
      .reduce((acc, div) => acc + (div.amount || 0), 0);
  };

  const calculateItemPrice = (subarticleId, budgetId) => {
    const division = budgetDivisions.find((div) => div.sousarticle_id === subarticleId && div.budget_id === budgetId);
    return division ? division.amount : expenseInputs[`${subarticleId}_${budgetId}`] || 0;
  };

  const hasDivision = (subarticleId, budgetId) => {
    return budgetDivisions.some((div) => div.sousarticle_id === subarticleId && div.budget_id === budgetId);
  };

  return (
    <>
      <Nav />
      <Container>
        <FaBars
          size={24}
          style={{ cursor: "pointer", alignSelf: "flex-start", position: "absolute" }}
          onClick={() => setSidebarOpen(true)}
        />
        <h2 style={{ color: "#001A82" }}>Annual Budget</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <BudgetSummary>
          <h3>
            Total Budget: <span style={{ color: "#001A82", marginLeft: 8 }}>{totalBudget.toFixed(2)} DA</span>
          </h3>
          <h3>
            Total Spent: <span style={{ color: "#001A82", marginLeft: 8 }}>{totalSpent.toFixed(2)} DA</span>
          </h3>
          <h3>
            Total Remaining: <span style={{ color: "#001A82", marginLeft: 8 }}>{totalRemaining.toFixed(2)} DA</span>
          </h3>
          <div
            style={{
              width: '100%',
              display: 'flex',
              padding: '0px 20px',
              alignItems: 'center',
              justifyContent: "space-between"
            }}
          >
            {budgets.map(budget => (
              <div key={budget.id}>
                <h4>{budget.type} {budget.id}</h4>
                <p>Total: <span style={{ color: "#001A82" }}>{budget.total_amount.toFixed(2)} DA</span></p>
                <p>Spent: <span style={{ color: "#001A82" }}>{budget.spent.toFixed(2)} DA</span></p>
                <p>Remaining: <span style={{ color: "#001A82" }}>{(budget.total_amount - budget.spent).toFixed(2)} DA</span></p>
              </div>
            ))}
          </div>
        </BudgetSummary>

        <Section>
          <h3>Budget Division</h3>
          {chapters.map((ch) => {
            const { icon: Icon, color } = chapterStyles[ch.name] || { icon: FaBars, color: "#95a5a6" };
            return (
              <div
                style={{
                  boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                  borderRadius: 8,
                  marginBottom: 20,
                  padding: "8px 0px",
                }}
                key={ch.id}
              >
                <ToggleButton onClick={() => toggleChapter(ch.id)}>
                  <ChapterTitle>
                    <Icon size={20} color={color} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        alignItems: "start",
                      }}
                    >
                      {ch.name}
                      <span
                        style={{
                          fontSize: 12,
                          color: "grey",
                          textAlign: "left",
                        }}
                      >
                        {articles
                          .filter((ar) => ar.chapter_id === ch.id)
                          .slice(0, 2)
                          .map((ele) => ele.name)
                          .join(",")}{" "}
                        {articles.filter((ar) => ar.chapter_id === ch.id).length > 3 ? "..." : ""}
                      </span>
                    </div>
                  </ChapterTitle>
                  <div>
                    <MdDelete
                      size={20}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChapter(ch.id);
                      }}
                    />
                  </div>
                </ToggleButton>
                {openChapters[ch.id] && (
                  <List>
                    {articles
                      .filter((ar) => ar.chapter_id === ch.id)
                      .map((ar) => (
                        <li
                          key={ar.id}
                          style={{
                            boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                            borderRadius: 8,
                            margin: 20,
                            padding: "8px 0px",
                          }}
                        >
                          <ToggleButton onClick={() => toggleArticle(ar.id)}>
                            <div
                              style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "40%" }}
                            >
                              {openArticles[ar.id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                              {ar.name}
                            </div>
                            <div>
                              <p>Partial Total: {calculateArticleTotal(ar.id).toFixed(2)} DA</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                              {addInputVisible[ar.id] ? (
                                <AddInputContainer>
                                  <AddInput
                                    type="text"
                                    value={newItemName[ar.id] || ""}
                                    onChange={(e) => handleNewItemName(ar.id, e.target.value)}
                                    placeholder="Enter item name"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        addItem(ar.id, newItemName[ar.id]);
                                      }
                                    }}
                                  />
                                  <MdSave
                                    size={20}
                                    color="#001A82"
                                    onClick={() => addItem(ar.id, newItemName[ar.id])}
                                  />
                                  <MdDelete
                                    size={20}
                                    color="red"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAddInput(ar.id);
                                    }}
                                  />
                                </AddInputContainer>
                              ) : (
                                <MdAdd
                                  size={20}
                                  color="green"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAddInput(ar.id);
                                  }}
                                />
                              )}
                              <MdDelete
                                size={20}
                                color="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteArticle(ar.id);
                                }}
                              />
                            </div>
                          </ToggleButton>
                          {openArticles[ar.id] && (
                            <List>
                              {sousarticles
                                .filter((sa) => sa.article_id === ar.id)
                                .map((sa) => (
                                  <li
                                    key={sa.id}
                                    style={{
                                      boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                                      borderRadius: 8,
                                      margin: "8px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "8px 20px",
                                    }}
                                  >
                                    <div>{sa.name}</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                      {budgets.map(budget => (
                                        hasDivision(sa.id, budget.id) ? (
                                          <div key={budget.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span>Budget {budget.id}:</span>
                                            <span>{calculateItemPrice(sa.id, budget.id).toFixed(2)} DA</span>
                                          </div>
                                        ) : budget.total_amount - budget.spent > 0 && (
                                          <div key={budget.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span>Budget {budget.id}:</span>
                                            <input
                                              type="number"
                                              style={{
                                                width: 100,
                                                borderColor: "#001A82",
                                                borderWidth: 1,
                                                borderRadius: 8,
                                              }}
                                              value={expenseInputs[`${sa.id}_${budget.id}`] || ""}
                                              onChange={(e) => handleExpenseInput(sa.id, budget.id, e.target.value)}
                                            />
                                            <MdSave
                                              size={20}
                                              color="#001A82"
                                              onClick={(e) => saveExpense(e, sa.id, ar.id, sa.name, budget.id)}
                                            />
                                          </div>
                                        )
                                      ))}
                                    </div>
                                    <MdDelete
                                      size={20}
                                      color="red"
                                      onClick={() => deleteItem(sa.id)}
                                    />
                                  </li>
                                ))}
                            </List>
                          )}
                        </li>
                      ))}
                  </List>
                )}
              </div>
            );
          })}
        </Section>
        {(totalRemaining === 0 && totalBudget > 0) && (
          <div style={{ position: "absolute", top: 20, right: 20 }}>
            <Button
              text={"Generate Report"}
              handleClick={() => generatePDF()}
            />
          </div>
        )}
        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Container>
    </>
  );
};

export default BudgetDevisions;