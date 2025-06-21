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
  margin: 8px 0;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
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

const Summary = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
`;

function Report() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budgetDivisions, setBudgetDivisions] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [sousarticles, setSousarticles] = useState([]);
  const [laboratory, setLaboratory] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState({});
  const [error, setError] = useState("");
  const [openDivisions, setOpenDivisions] = useState({});

  const getItemName = (division) => {
    if (division.chapter_id) {
      const chapter = chapters.find((ch) => ch.id === division.chapter_id);
      return chapter ? chapter.name : "Unknown Chapter";
    }
    if (division.article_id) {
      const article = articles.find((ar) => ar.id === division.article_id);
      return article ? article.name : "Unknown Article";
    }
    if (division.sousarticle_id) {
      const sousarticle = sousarticles.find((sa) => sa.id === division.sousarticle_id);
      return sousarticle ? sousarticle.name : "Unknown Sousarticle";
    }
    return "Unnamed Division";
  };

  useEffect(() => {
    if (!user) return navigate("/login");
    (async () => {
      try {
        const [divs, ch, ar, so, lab] = await Promise.all([
          window.api.getBudgetDivisions(),
          window.api.getChapters(),
          window.api.getArticles(),
          window.api.getSousarticles(),
          window.api.getLaboratory(),
        ]);
        setBudgetDivisions(divs || []);
        setChapters(ch || []);
        setArticles(ar || []);
        setSousarticles(so || []);
        setLaboratory(lab[0] || {});

        // Fetch expenses for all divisions
        const expensePromises = divs.map((div) => window.api.getExpensesByDivision(div.id));
        const allExpenses = await Promise.all(expensePromises);
        const expensesByDivision = divs.reduce((acc, div, index) => {
          acc[div.id] = allExpenses[index] || [];
          return acc;
        }, {});
        setExpenses(expensesByDivision);

        // Initialize filtered expenses
        setFilteredExpenses(
          divs.reduce((acc, div) => {
            acc[div.id] = expensesByDivision[div.id].filter((exp) => {
              const expDate = new Date(exp.created_at);
              return !fromDate || !toDate || (expDate >= new Date(fromDate) && expDate <= new Date(toDate));
            });
            return acc;
          }, {})
        );
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
    setFilteredExpenses(
      budgetDivisions.reduce((acc, div) => {
        acc[div.id] = expenses[div.id].filter((exp) => {
          const expDate = new Date(exp.created_at);
          return expDate >= new Date(fromDate) && expDate <= new Date(toDate);
        });
        return acc;
      }, {})
    );
  };

  const toggleDivision = (id) => {
    setOpenDivisions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDA = (value) => {
    return `${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DA`;
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
      if (laboratory) {
        pdf.text(`Ministry of Higher Education and Scientific Research`, margin, 60);
        pdf.text(`${laboratory.univ || "N/A"}`, margin, 80);
        pdf.text(`Faculty of Exact Science`, margin, 100);
        pdf.text(`Laboratory: ${laboratory.name || "N/A"}`, margin, 120);
        pdf.text(`Wilaya: ${laboratory.wilaya || "N/A"}`, margin, 140);
      }
      pdf.text(`Report Period: ${fromDate} to ${toDate}`, margin, 160);
      pdf.text(`Generated on: ${new Date().toLocaleString("en-US", { timeZone: "CET" })}`, margin, 180); // 10:34 AM CET, June 21, 2025
      pdf.text(`User: ${user?.email || "N/A"}`, margin, 200);
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
      const chapterDivisions = budgetDivisions.filter((div) => div.chapter_id === chapter.id);
      let chapterTotalSpent = 0;
      let chapterTotalRemaining = 0;

      // Chapter Row
      drawTableRow(chapter.name, "", "", 10, true);

      chapterDivisions.forEach((div) => {
        const spent = (filteredExpenses[div.id] || []).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        const allocated = parseFloat(div.amount) || 0;
        const remaining = allocated - spent;
        if (spent > 0 || remaining > 0) {
          drawTableRow(getItemName(div), formatDA(spent), formatDA(remaining), 20);
          chapterTotalSpent += spent;
          chapterTotalRemaining += remaining;
        }
      });

      const chapterArticles = articles.filter((ar) => ar.chapter_id === chapter.id);
      chapterArticles.forEach((article) => {
        const articleDivisions = budgetDivisions.filter((div) => div.article_id === article.id);
        let articleTotalSpent = 0;
        let articleTotalRemaining = 0;

        // Article Row
        drawTableRow(article.name, "", "", 20);

        articleDivisions.forEach((div) => {
          const spent = (filteredExpenses[div.id] || []).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
          const allocated = parseFloat(div.amount) || 0;
          const remaining = allocated - spent;
          if (spent > 0 || remaining > 0) {
            drawTableRow(getItemName(div), formatDA(spent), formatDA(remaining), 40);
            articleTotalSpent += spent;
            articleTotalRemaining += remaining;
          }
        });

        const articleSousarticles = sousarticles.filter((sa) => sa.article_id === article.id);
        articleSousarticles.forEach((sousarticle) => {
          const sousarticleDivisions = budgetDivisions.filter((div) => div.sousarticle_id === sousarticle.id);
          let sousarticleTotalSpent = 0;
          let sousarticleTotalRemaining = 0;

          // Sousarticle Row
          drawTableRow(sousarticle.name, "", "", 40);

          sousarticleDivisions.forEach((div) => {
            const spent = (filteredExpenses[div.id] || []).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
            const allocated = parseFloat(div.amount) || 0;
            const remaining = allocated - spent;
            if (spent > 0 || remaining > 0) {
              drawTableRow(getItemName(div), formatDA(spent), formatDA(remaining), 60);
              sousarticleTotalSpent += spent;
              sousarticleTotalRemaining += remaining;
            }
          });

          // Sousarticle Total
          if (sousarticleTotalSpent > 0 || sousarticleTotalRemaining > 0) {
            drawTableRow(`Total ${sousarticle.name}`, formatDA(sousarticleTotalSpent), formatDA(sousarticleTotalRemaining), 50, true);
            articleTotalSpent += sousarticleTotalSpent;
            articleTotalRemaining += articleTotalRemaining;
          }
        });

        // Article Total
        if (articleTotalSpent > 0 || articleTotalRemaining > 0) {
          drawTableRow(`Total ${article.name}`, formatDA(articleTotalSpent), formatDA(articleTotalRemaining), 30, true);
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

  // Last 5 expenses for summary (flattened from all divisions)
  const allExpenses = Object.values(expenses).flat();
  const lastFiveExpenses = allExpenses.slice(-5).reverse();

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
          <h3>Recent Expenses</h3>
          <Summary>
            <p>Total Spent (Last 5): {lastFiveExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0).toFixed(2)} DA</p>
          </Summary>
          <List>
            {lastFiveExpenses.map((exp) => {
              const amount = `-${exp.amount.toFixed(2)} DA`;
              const date = new Date(exp.created_at).toLocaleDateString();
              const division = budgetDivisions.find((div) => div.id === exp.budget_division_id);
              const name = division ? getItemName(division) : "Unknown";
              return (
                <li key={exp.id}>
                  <ToggleButton onClick={() => toggleDivision(exp.budget_division_id || exp.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaMoneyBillWave size={20} color="#001A82" />
                      <span>{name}</span>
                    </div>
                    <div>{openDivisions[exp.budget_division_id || exp.id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}</div>
                  </ToggleButton>
                  {openDivisions[exp.budget_division_id || exp.id] && (
                    <TransactionItem>
                      <span>Amount: {amount}</span>
                      <span>Date: {date}</span>
                      <span>Type: Expense</span>
                    </TransactionItem>
                  )}
                </li>
              );
            })}
          </List>
        </Section>
        <Section>
          <h3>Filter Expenses</h3>
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
            {budgetDivisions.map((div) => {
              const filteredExp = filteredExpenses[div.id] || [];
              if (filteredExp.length === 0) return null;
              const name = getItemName(div);
              const totalSpent = filteredExp.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
              const allocated = parseFloat(div.amount) || 0;
              const remaining = allocated - totalSpent;
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
                    <div>
                      {filteredExp.map((exp) => {
                        const amount = `-${exp.amount.toFixed(2)} DA`;
                        const date = new Date(exp.created_at).toLocaleDateString();
                        return (
                          <TransactionItem key={exp.id}>
                            <span>Amount: {amount}</span>
                            <span>Date: {date}</span>
                            <span>Type: Expense</span>
                          </TransactionItem>
                        );
                      })}
                      <Summary>
                        <p>Total Spent: {totalSpent.toFixed(2)} DA</p>
                        <p>Remaining: {remaining.toFixed(2)} DA</p>
                      </Summary>
                    </div>
                  )}
                </li>
              );
            })}
          </List>
          {Object.values(filteredExpenses).some((exp) => exp.length > 0) && (
            <GeneratePDFButton onClick={generatePDF}>
              <MdExpandLess size={20} />
              Generate PDF Report
            </GeneratePDFButton>
          )}
          <Summary>
            <p>Total Expenses (Filtered): {Object.values(filteredExpenses).flat().reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0).toFixed(2)} DA</p>
          </Summary>
        </Section>
        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Container>
    </>
  );
}

export default Report;