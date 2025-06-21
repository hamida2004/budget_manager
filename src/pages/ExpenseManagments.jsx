import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Nav from "../components/nav";
import SideBar from "../components/SideBar";
import { useUser } from "../context/userContext";
import { MdSave } from "react-icons/md";
import jsPDF from "jspdf";

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

const ExpenseInput = styled.input`
  width: 100px;
  padding: 5px;
  border: 1px solid #001A82;
  border-radius: 8px;
  margin-right: 10px;
`;

const DescriptionInput = styled.input`
  width: 200px;
  padding: 5px;
  border: 1px solid #001A82;
  border-radius: 8px;
  margin-right: 10px;
`;

const ExpenseItem = styled.li`
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin: 8px 0;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`;

const GeneratePDFButton = styled.button`
  background-color: #001A82;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background-color: #0033a0;
  }
`;

function ExpenseManagments() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [sousarticles, setSousarticles] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [expenseInputs, setExpenseInputs] = useState({});
  const [descriptionInputs, setDescriptionInputs] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [budgetDivisions, setBudgetDivisions] = useState([]);
  const [expenses, setExpenses] = useState({}); // Store expenses by divisionId

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [divs, ch, ar, so] = await Promise.all([
          window.api.getBudgetDivisions(),
          window.api.getChapters(),
          window.api.getArticles(),
          window.api.getSousarticles(),
        ]);
        setChapters(ch || []);
        setArticles(ar || []);
        setSousarticles(so || []);
        setBudgetDivisions(divs || []);

        // Fetch expenses for all divisions
        const expensePromises = divs.map((div) => window.api.getExpensesByDivision(div.id));
        const allExpenses = await Promise.all(expensePromises);
        const expensesByDivision = divs.reduce((acc, div, index) => {
          acc[div.id] = allExpenses[index] || [];
          return acc;
        }, {});
        setExpenses(expensesByDivision);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load budget data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const toggleChapter = (id) => {
    setOpenChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpenseInput = (divisionId, value) => {
    setExpenseInputs((prev) => ({
      ...prev,
      [divisionId]: parseFloat(value) || 0,
    }));
  };

  const handleDescriptionInput = (divisionId, value) => {
    setDescriptionInputs((prev) => ({
      ...prev,
      [divisionId]: value,
    }));
  };

  const saveExpense = async (e, divisionId, name) => {
    e.preventDefault();
    setError("");
    const amount = expenseInputs[divisionId];
    const description = descriptionInputs[divisionId] || "";
    const division = budgetDivisions.find((d) => d.id === divisionId);
    if (!division) {
      setError("Budget division not found.");
      return;
    }

    const allocatedAmount = parseFloat(division.amount) || 0;
    const existingExpenses = expenses[divisionId] || [];
    const totalSpent = existingExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const remaining = allocatedAmount - totalSpent;

    if (!amount || amount <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (amount > remaining) {
      setError(`Expense amount (${amount.toFixed(2)} DA) exceeds remaining budget (${remaining.toFixed(2)} DA) for ${name}.`);
      return;
    }

    try {
      const newExpense = await window.api.addExpense({
        budget_division_id: divisionId,
        amount,
        description,
        name,
      });
      setExpenses((prev) => ({
        ...prev,
        [divisionId]: [...(prev[divisionId] || []), newExpense],
      }));
      setExpenseInputs((prev) => ({ ...prev, [divisionId]: 0 }));
      setDescriptionInputs((prev) => ({ ...prev, [divisionId]: "" }));

      // Add notification for the new expense
      await window.api.addNotification({
        title: "New Expense Added",
        content: `An expense of ${parseFloat(amount).toFixed(2)} DA was added for "${name}" in Budget ${division.budget_id}. Description: ${description || "No description"}`,
        amount: amount,
      });
    } catch (error) {
      console.error("Error saving expense:", error);
      setError(`Failed to save expense: ${error.message}`);
    }
  };

  const getDivisionsForItem = (itemId, type) => {
    return budgetDivisions.filter((div) =>
      (type === "chapter" && div.chapter_id === itemId) ||
      (type === "article" && div.article_id === itemId) ||
      (type === "sousarticle" && div.sousarticle_id === itemId)
    );
  };

  const generatePDF = () => {
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const lineHeight = 15;
    const tableStartY = 160;
    let y = tableStartY;
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = [tableWidth * 0.4, tableWidth * 0.3, tableWidth * 0.3];
    let isFirstPage = true;

    const addHeader = () => {
      if (!isFirstPage) return;
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text("People's Democratic Republic of Algeria", margin, 40);
      pdf.text("Expense Report", margin, 60);
      pdf.text(`Generated on: ${new Date().toLocaleString("en-US", { timeZone: "CET" })}`, margin, 80);
      pdf.text(`User: ${user?.email || "N/A"}`, margin, 100);
    };

    const checkPageBreak = (additionalHeight) => {
      if (y + additionalHeight > pageHeight - margin) {
        pdf.addPage();
        y = 60;
        isFirstPage = false;
        return true;
      }
      return false;
    };

    const drawTableRow = (label, amountSpent, amountRemaining, indent = 0, isBold = false) => {
      checkPageBreak(lineHeight + 10);
      const wrappedLabel = pdf.splitTextToSize(label, colWidths[0] - indent);
      const lineCount = wrappedLabel.length;
      const rowHeight = lineHeight * lineCount;

      pdf.setFont("Helvetica", isBold ? "bold" : "normal");
      pdf.setFontSize(10);
      pdf.text(wrappedLabel, margin + indent, y + 10, { maxWidth: colWidths[0] - indent });
      pdf.text(amountSpent || "0.00 DA", margin + colWidths[0] + colWidths[1] - 5, y + 10, { align: "right" });
      pdf.text(amountRemaining || "0.00 DA", margin + tableWidth - 5, y + 10, { align: "right" });

      pdf.rect(margin, y, colWidths[0], rowHeight);
      pdf.rect(margin + colWidths[0], y, colWidths[1], rowHeight);
      pdf.rect(margin + colWidths[0] + colWidths[1], y, colWidths[2], rowHeight);
      y += rowHeight > lineHeight ? rowHeight : lineHeight;
    };

    // --- Header ---
    addHeader();
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Description", margin + 10, y + 10);
    pdf.text("Amount Spent (DA)", margin + colWidths[0] + colWidths[1] - 5, y + 10, { align: "right" });
    pdf.text("Remaining (DA)", margin + tableWidth - 5, y + 10, { align: "right" });
    pdf.rect(margin, y, colWidths[0], lineHeight);
    pdf.rect(margin + colWidths[0], y, colWidths[1], lineHeight);
    pdf.rect(margin + colWidths[0] + colWidths[1], y, colWidths[2], lineHeight);
    y += lineHeight;

    let grandTotalSpent = 0;
    let grandTotalRemaining = 0;

    chapters.forEach((chapter) => {
      const chapterDivisions = getDivisionsForItem(chapter.id, "chapter");
      let chapterTotalSpent = 0;
      let chapterTotalRemaining = 0;

      // Chapter Row
      drawTableRow(chapter.name, "", "", 10, true);

      if (chapterDivisions.length > 0) {
        chapterDivisions.forEach((div) => {
          const spent = (expenses[div.id] || []).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
          const allocated = parseFloat(div.amount) || 0;
          const remaining = allocated - spent;
          if (spent > 0 || remaining > 0) {
            drawTableRow("Direct Allocation", formatDA(spent), formatDA(remaining), 20);
            chapterTotalSpent += spent;
            chapterTotalRemaining += remaining;
          }
        });
      }

      const chapterArticles = articles.filter((ar) => ar.chapter_id === chapter.id);
      chapterArticles.forEach((article) => {
        const articleDivisions = getDivisionsForItem(article.id, "article");
        let articleTotalSpent = 0;
        let articleTotalRemaining = 0;

        // Article Row
        drawTableRow(article.name, "", "", 20);

        if (articleDivisions.length > 0) {
          articleDivisions.forEach((div) => {
            const spent = (expenses[div.id] || []).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
            const allocated = parseFloat(div.amount) || 0;
            const remaining = allocated - spent;
            if (spent > 0 || remaining > 0) {
              drawTableRow(article.name, formatDA(spent), formatDA(remaining), 40);
              articleTotalSpent += spent;
              articleTotalRemaining += remaining;
            }
          });
        }

        const articleSousarticles = sousarticles.filter((sa) => sa.article_id === article.id);
        articleSousarticles.forEach((sousarticle) => {
          const sousarticleDivisions = getDivisionsForItem(sousarticle.id, "sousarticle");
          let sousarticleTotalSpent = 0;
          let sousarticleTotalRemaining = 0;

          // Sousarticle Row
          drawTableRow(sousarticle.name, "", "", 40);

          sousarticleDivisions.forEach((div) => {
            const spent = (expenses[div.id] || []).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
            const allocated = parseFloat(div.amount) || 0;
            const remaining = allocated - spent;
            if (spent > 0 || remaining > 0) {
              drawTableRow(sousarticle.name, formatDA(spent), formatDA(remaining), 60);
              sousarticleTotalSpent += spent;
              sousarticleTotalRemaining += remaining;
            }
          });
        });

        // Article Total
        if (articleTotalSpent > 0 || articleTotalRemaining > 0) {
          drawTableRow(`Total ${article.name}`, formatDA(articleTotalSpent), formatDA(articleTotalRemaining), 20, true);
          chapterTotalSpent += articleTotalSpent;
          chapterTotalRemaining += articleTotalRemaining;
        }
      });

      // Chapter Total
      if (chapterTotalSpent > 0 || chapterTotalRemaining > 0) {
        drawTableRow(`Total ${chapter.name}`, formatDA(chapterTotalSpent), formatDA(chapterTotalRemaining), 10, true);
        grandTotalSpent += chapterTotalSpent;
        grandTotalRemaining += chapterTotalRemaining;
      }
    });

    // Grand Total
    drawTableRow("TOTAL GENERAL DES DEPENSES", formatDA(grandTotalSpent), formatDA(grandTotalRemaining), 10, true);

    pdf.save("expense-report.pdf");
    alert("✅ PDF generated successfully!");
  };

  // Format DA helper
  function formatDA(value) {
    return `${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DA`;
  }

  if (loading) {
    return (
      <Container>
        <h2 style={{ color: "#001A82" }}>Loading...</h2>
      </Container>
    );
  }

  return (
    <>
      <Nav />
      <Container>
        <FaBars
          size={24}
          style={{ cursor: "pointer", alignSelf: "flex-start", position: "absolute" }}
          onClick={() => setSidebarOpen(true)}
        />
        <h2 style={{ color: "#001A82" }}>Expense Management</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Section>
          {chapters.map((ch) => {
            const divisions = getDivisionsForItem(ch.id, "chapter");
            if (divisions.length === 0) return null;

            return (
              <div key={ch.id} style={{ boxShadow: "0px 0px 5px rgba(0,0,0,0.2)", borderRadius: 8, marginBottom: 20, padding: "8px 0px" }}>
                <ToggleButton onClick={() => toggleChapter(ch.id)}>
                  <span>{ch.name}</span>
                  <span>Total Allocated: {divisions.reduce((sum, div) => sum + (parseFloat(div.amount) || 0), 0).toFixed(2)} DA</span>
                </ToggleButton>
                {openChapters[ch.id] && (
                  <List>
                    {articles
                      .filter((ar) => ar.chapter_id === ch.id)
                      .map((ar) => {
                        const articleDivisions = getDivisionsForItem(ar.id, "article");
                        if (articleDivisions.length === 0) return null;

                        return (
                          <ExpenseItem key={ar.id}>
                            <span>{ar.name}</span>
                            {articleDivisions.map((div) => (
                              <ExpenseFormItem
                                key={div.id}
                                div={div}
                                name={ar.name}
                                value={expenseInputs[div.id] || ""}
                                description={descriptionInputs[div.id] || ""}
                                onChange={handleExpenseInput}
                                onDescriptionChange={handleDescriptionInput}
                                onSave={saveExpense}
                                expenses={expenses[div.id] || []}
                              />
                            ))}
                          </ExpenseItem>
                        );
                      })}

                    {sousarticles
                      .filter((sa) => getDivisionsForItem(sa.id, "sousarticle").length > 0)
                      .map((sa) => (
                        <ExpenseItem key={sa.id}>
                          <span>{sa.name}</span>
                          {getDivisionsForItem(sa.id, "sousarticle").map((div) => (
                            <ExpenseFormItem
                              key={div.id}
                              div={div}
                              name={sa.name}
                              value={expenseInputs[div.id] || ""}
                              description={descriptionInputs[div.id] || ""}
                              onChange={handleExpenseInput}
                              onDescriptionChange={handleDescriptionInput}
                              onSave={saveExpense}
                              expenses={expenses[div.id] || []}
                            />
                          ))}
                        </ExpenseItem>
                      ))}
                  </List>
                )}
              </div>
            );
          })}
        </Section>
        <GeneratePDFButton onClick={generatePDF}>
          <MdSave size={20} />
          Generate PDF Expense Report
        </GeneratePDFButton>
        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Container>
    </>
  );
}

function ExpenseFormItem({ div, name, value, description, onChange, onDescriptionChange, onSave, expenses }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const fetchRemaining = async () => {
      try {
        const fetchedExpenses = await window.api.getExpensesByDivision(div.id);
        const spent = fetchedExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        setRemaining(parseFloat(div.amount) - spent);
      } catch (e) {
        setRemaining(0);
      }
    };

    fetchRemaining();
  }, [div, expenses]); // Re-fetch when expenses change

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "5px 0" }}>
      <span>{div.budget_id === 1 ? "Annual" : "Additional"}: {parseFloat(div.amount).toFixed(2)} DA (Remaining: {remaining.toFixed(2)} DA)</span>
      <AddInputContainer>
        <ExpenseInput
          type="number"
          value={value}
          onChange={(e) => onChange(div.id, e.target.value)}
          min="0"
          step="0.01"
          placeholder="Enter expense"
        />
        <DescriptionInput
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange(div.id, e.target.value)}
          placeholder="Enter description"
        />
        <MdSave
          size={20}
          color="#001A82"
          onClick={(e) => onSave(e, div.id, name)}
          style={{ cursor: "pointer" }}
        />
      </AddInputContainer>
    </div>
  );
}

export default ExpenseManagments;