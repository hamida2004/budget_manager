import html2canvas from "html2canvas";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { MdAdd, MdDelete, MdExpandLess, MdExpandMore, MdSave } from "react-icons/md";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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
  padding: 8px 20px;
  width: 100%;
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

const generatePDF = async (totalBudget, totalSpent, remainingBudget, expenses, laboratory) => {
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
    heading.style.color = "#001A82";
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
        <p><strong>Remaining:</strong> ${remainingBudget.toFixed(2)} DA</p>
      </div>
    `;
    container.appendChild(summary);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.border = "1px solid black";
    table.innerHTML = `
      <thead style="background-color:#001A82; color:white;">
        <tr>
          <th style="border: 1px solid #000; padding: 5px;">#</th>
          <th style="border: 1px solid #000; padding: 5px;">Name</th>
          <th style="border: 1px solid #000; padding: 5px;">Amount (DA)</th>
        </tr>
      </thead>
      <tbody>
        ${expenses
          .map(
            (exp, i) => `
          <tr>
            <td style="border: 1px solid #000; padding: 5px;">${i + 1}</td>
            <td style="border: 1px solid #000; padding: 5px;">${exp.name || "Unnamed"}</td>
            <td style="border: 1px solid #000; padding: 5px;">${parseFloat(exp.amount).toFixed(2)} DA</td>
          </tr>
        `
          )
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

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { totalBudget, totalSpent, remainingBudget, expenses, addExpense, deleteExpense } = useBudget();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [sousarticles, setSousarticles] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [openArticles, setOpenArticles] = useState({});
  const [expenseInputs, setExpenseInputs] = useState({});
  const [error, setError] = useState("");
  const [laboratory, setLaboratory] = useState({});
  const [addInputVisible, setAddInputVisible] = useState({}); // Track which article shows input
  const [newItemName, setNewItemName] = useState({}); // Track input values per article

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
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load budget data.");
      }
    })();
  }, [user, navigate]);

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
      const expense = expenses.find((exp) => exp.sousarticle_id === id);
      if (expense) {
        await deleteExpense(expense.id);
        const newSpent = totalSpent - expense.amount;
        await window.api.updateTotalBudget({
          amount: totalBudget,
          spent: newSpent,
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item.");
    }
  };

  const handleExpenseInput = (sousarticleId, value) => {
    setExpenseInputs((prev) => ({ ...prev, [sousarticleId]: parseFloat(value) || 0 }));
  };

  const saveExpense = async (sousarticleId, articleId, name) => {
    setError("");
    const amount = expenseInputs[sousarticleId];

    if (!amount || amount <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (totalBudget <= 0) {
      setError("Cannot add expenses: Total budget is 0 or negative.");
      return;
    }

    try {
      const budgets = await window.api.getBudgets();
      if (!budgets || budgets.length === 0) {
        setError("No budget found. Please create a budget first.");
        return;
      }
      const budgetId = budgets[0].id;

      await window.api.addBudgetDivision({
        budget_id: budgetId,
        sousarticle_id: sousarticleId,
        amount,
      });

      const newSpent = totalSpent + amount;
      await window.api.updateTotalBudget({
        amount: totalBudget,
        spent: newSpent,
      });

      await addExpense({ sousarticle_id: sousarticleId, article_id: articleId, name, amount });

      await window.api.addNotification({
        title: "New Expense Added",
        content: `An expense of ${parseFloat(amount).toFixed(2)} DA was added for "${name}".`,
        amount:amount
      });

      setExpenseInputs((prev) => ({ ...prev, [sousarticleId]: 0 }));
    } catch (error) {
      console.error("Error saving expense:", error);
      setError(`Failed to save expense: ${error.message}`);
    }
  };

  const calculateArticleTotal = (articleId) => {
    return expenses
      .filter((d) => d.article_id === articleId)
      .reduce((acc, d) => acc + (d.amount || 0), 0);
  };

  const calculateItemPrice = (subarticleId) => {
    const found = expenses.find((d) => d.sousarticle_id === subarticleId);
    return found ? found.amount : expenseInputs[subarticleId] || 0;
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
        <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
          <h3>
            Total: <span style={{ color: "#001A82", marginLeft: 8 }}>{totalBudget.toFixed(2)} DA</span>
          </h3>
          <h3>
            Spent: <span style={{ color: "#001A82", marginLeft: 8 }}>{totalSpent.toFixed(2)} DA</span>
          </h3>
          <h3>
            Remaining: <span style={{ color: "#001A82", marginLeft: 8 }}>{remainingBudget.toFixed(2)} DA</span>
          </h3>
        </div>

        <Section>
          <h3>Budget Division</h3>
          {chapters.map((ch) => (
            <div
              style={{ margin: "8px 0px", borderBottomColor: "#000", borderBottomWidth: 2, borderBottomStyle: "solid" }}
              key={ch.id}
            >
              <ToggleButton onClick={() => toggleChapter(ch.id)}>
                <div>
                  {openChapters[ch.id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}{" "}
                  {ch.name}
                </div>
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
                          borderBottomColor: "#999",
                          borderBottomWidth: 2,
                          borderBottomStyle: "solid",
                          margin: "8px 0px",
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
                                    margin: "8px 0px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 20px",
                                    borderColor: "#ddd",
                                    borderWidth: 2,
                                    borderStyle: "solid",
                                  }}
                                >
                                  <div>{sa.name}</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <input
                                      type="number"
                                      style={{
                                        width: 100,
                                        borderColor: "#001A82",
                                        borderWidth: 1,
                                        borderRadius: 8,
                                      }}
                                      value={calculateItemPrice(sa.id)}
                                      onChange={(e) => handleExpenseInput(sa.id, e.target.value)}
                                    />
                                    <MdSave
                                      size={20}
                                      color="#001A82"
                                      onClick={() => saveExpense(sa.id, ar.id, sa.name)}
                                    />
                                    <MdDelete
                                      size={20}
                                      color="red"
                                      onClick={() => deleteItem(sa.id)}
                                    />
                                  </div>
                                </li>
                              ))}
                          </List>
                        )}
                      </li>
                    ))}
                </List>
              )}
            </div>
          ))}
        </Section>
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          <Button
            text={"Generate Report"}
            handleClick={() => generatePDF(totalBudget, totalSpent, remainingBudget, expenses, laboratory)}
          />
        </div>
        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Container>
    </>
  );
};

export default Home;