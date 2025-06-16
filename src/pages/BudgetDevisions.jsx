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
  const [wilaya, setWilaya] = useState('')
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

  const wilayas = [
    { id: 1, wilaya: "Adrar" },
    { id: 2, wilaya: "Chlef" },
    { id: 3, wilaya: "Laghouat" },
    { id: 4, wilaya: "Oum El Bouaghi" },
    { id: 5, wilaya: "Batna" },
    { id: 6, wilaya: "Béjaïa" },
    { id: 7, wilaya: "Biskra" },
    { id: 8, wilaya: "Béchar" },
    { id: 9, wilaya: "Blida" },
    { id: 10, wilaya: "Bouira" },
    { id: 11, wilaya: "Tamanrasset" },
    { id: 12, wilaya: "Tébessa" },
    { id: 13, wilaya: "Tlemcen" },
    { id: 14, wilaya: "Tiaret" },
    { id: 15, wilaya: "Tizi Ouzou" },
    { id: 16, wilaya: "Alger" },
    { id: 17, wilaya: "Djelfa" },
    { id: 18, wilaya: "Jijel" },
    { id: 19, wilaya: "Sétif" },
    { id: 20, wilaya: "Saïda" },
    { id: 21, wilaya: "Skikda" },
    { id: 22, wilaya: "Sidi Bel Abbès" },
    { id: 23, wilaya: "Annaba" },
    { id: 24, wilaya: "Guelma" },
    { id: 25, wilaya: "Constantine" },
    { id: 26, wilaya: "Médéa" },
    { id: 27, wilaya: "Mostaganem" },
    { id: 28, wilaya: "M'Sila" },
    { id: 29, wilaya: "Mascara" },
    { id: 30, wilaya: "Ouargla" },
    { id: 31, wilaya: "Oran" },
    { id: 32, wilaya: "El Bayadh" },
    { id: 33, wilaya: "Illizi" },
    { id: 34, wilaya: "Bordj Bou Arréridj" },
    { id: 35, wilaya: "Boumerdès" },
    { id: 36, wilaya: "El Tarf" },
    { id: 37, wilaya: "Tindouf" },
    { id: 38, wilaya: "Tissemsilt" },
    { id: 39, wilaya: "El Oued" },
    { id: 40, wilaya: "Khenchela" },
    { id: 41, wilaya: "Souk Ahras" },
    { id: 42, wilaya: "Tipaza" },
    { id: 43, wilaya: "Mila" },
    { id: 44, wilaya: "Aïn Defla" },
    { id: 45, wilaya: "Naâma" },
    { id: 46, wilaya: "Aïn Témouchent" },
    { id: 47, wilaya: "Ghardaïa" },
    { id: 48, wilaya: "Relizane" },
    { id: 49, wilaya: "Timimoun" },
    { id: 50, wilaya: "Bordj Badji Mokhtar" },
    { id: 51, wilaya: "Ouled Djellal" },
    { id: 52, wilaya: "Beni Abbès" },
    { id: 53, wilaya: "In Salah" },
    { id: 54, wilaya: "In Guezzam" },
    { id: 55, wilaya: "Touggourt" },
    { id: 56, wilaya: "Djanet" },
    { id: 57, wilaya: "El M'Ghair" },
    { id: 58, wilaya: "El Menia" },
  ];
  const findWilaya = (id) => {
    const wilaya = wilayas.find((w) => w.id === id);
    setWilaya(wilaya);
  };

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
        fetchBudgetDivisions();

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load budget data.");
      }
    })();
    console.log('///', budgetDivisions)

  }, [user, navigate]);

  const totalBudget = budgets.reduce((sum, budget) => sum + (budget.total_amount || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  function generatePDF() {
    try {
      findWilaya(laboratory.wilaya)
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const lineHeight = 15;
      const tableStartY = 160;
      let y = tableStartY;
      const tableWidth = pageWidth - 2 * margin;
      const colWidths = [tableWidth * 0.6, tableWidth * 0.2, tableWidth * 0.2]; // Libellé: 60%, Amount (Annual): 20%, Amount (Additional): 20%
      let isFirstPage = true;

      // Function to add header on first page only
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
          pdf.text(`Wilaya: ${wilaya || laboratory.wilaya || "N/A"}`, margin, 140);
        }
      };

      // Function to check for page break
      const checkPageBreak = (additionalHeight) => {
        if (y + additionalHeight > pageHeight - margin) {
          pdf.addPage();
          y = 60;
          isFirstPage = false;
          return true;
        }
        return false;
      };

      // Function to draw table row
      const drawTableRow = (label, amountAnnual, amountAdditional, indent = 0, isBold = false) => {
        checkPageBreak(lineHeight + 10);
        pdf.setFont("Helvetica", isBold ? "bold" : "normal");
        pdf.setFontSize(10);
        pdf.text(label, margin + indent, y + 10, { maxWidth: colWidths[0] - indent });
        pdf.text(amountAnnual, margin + colWidths[0] + colWidths[1] - 5, y + 10, { align: "right" });
        pdf.text(amountAdditional, margin + tableWidth - 5, y + 10, { align: "right" });
        pdf.rect(margin, y, colWidths[0], lineHeight); // Libellé cell
        pdf.rect(margin + colWidths[0], y, colWidths[1], lineHeight); // Amount (Annual) cell
        pdf.rect(margin + colWidths[0] + colWidths[1], y, colWidths[2], lineHeight); // Amount (Additional) cell
        y += lineHeight;
      };

      // Draw table header
      addHeader();
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Libellé", margin + 10, y + 10);
      pdf.text("Amount (Annual)", margin + colWidths[0] + colWidths[1] - 5, y + 10, { align: "right" });
      pdf.text("Amount (Additional)", margin + tableWidth - 5, y + 10, { align: "right" });
      pdf.rect(margin, y, colWidths[0], lineHeight);
      pdf.rect(margin + colWidths[0], y, colWidths[1], lineHeight);
      pdf.rect(margin + colWidths[0] + colWidths[1], y, colWidths[2], lineHeight);
      y += lineHeight;

      // Table Data
      let grandTotal = 0;
      chapters.forEach((chapter) => {
        const chapterArticles = articles.filter((ar) => ar.chapter_id === chapter.id);
        let chapterTotal = 0;

        // Chapter Row
        drawTableRow(chapter.name, "", "", 10, true);

        if (chapterArticles.length === 0) {
          drawTableRow("", "0.00", "0.00");
        } else {
          chapterArticles.forEach((article) => {
            const articleSousarticles = sousarticles.filter((sa) => sa.article_id === article.id);
            const articleTotal = calculateArticleTotal(article.id);
            chapterTotal += articleTotal;

            // Article Row
            drawTableRow(article.name, "", "", 20);

            if (articleSousarticles.length === 0) {
              drawTableRow("", "0.00", "0.00");
            } else {
              articleSousarticles.forEach((sousarticle) => {
                const initialDivision = budgetDivisions.find(
                  (div) => div.sousarticle_id === sousarticle.id && div.budget_id === 1
                );
                const additionalDivision = budgetDivisions.find(
                  (div) => div.sousarticle_id === sousarticle.id && div.budget_id !== 1
                );
                const amountAnnual = initialDivision ? parseFloat(initialDivision.amount) : 0;
                const amountAdditional = additionalDivision ? parseFloat(additionalDivision.amount) : 0;
                const formattedAmountAnnual = `$${amountAnnual.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                const formattedAmountAdditional = `$${amountAdditional.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                // Sousarticle Row
                drawTableRow(sousarticle.name, formattedAmountAnnual, formattedAmountAdditional, 40);
              });
            }

            // Article Total
            if (articleSousarticles.length > 0) {
              drawTableRow(
                "Total Partiel",
                "",
                `$${articleTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                20,
                true
              );
            }
          });
        }

        // Chapter Total
        drawTableRow(
          "Total Partiel",
          "",
          `$${chapterTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          10,
          true
        );
        grandTotal += chapterTotal;
      });

      // Grand Total
      drawTableRow(
        "TOTAL GENERAL DU BUDGET",
        "",
        `$${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        10,
        true
      );

      pdf.save("budget-report.pdf");
      alert("✅ PDF generated successfully!");
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      alert("Failed to generate PDF. Please check the console.");
    }
  }

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
    e.preventDefault();
    setError("");
    const amount = expenseInputs[`${sousarticleId}_${budgetId}`];
    const budget = budgets.find((b) => b.id === budgetId);

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
      await window.api.addBudgetDivision({
        budget_id: budgetId,
        sousarticle_id: sousarticleId,
        amount
      });

      const newSpent = budget.spent + amount;
      await window.api.updateBudgets({
        id: budgetId,
        year: budget.year,
        total_amount: budget.total_amount,
        spent: newSpent,
      });

      setBudgets((prevBudgets) =>
        prevBudgets.map((b) =>
          b.id === budgetId ? { ...b, spent: newSpent } : b
        )
      );

      await addExpense({ sousarticle_id: sousarticleId, article_id: articleId, name, amount });

      await window.api.addNotification({
        title: "New Expense Added",
        content: `An expense of ${parseFloat(amount).toFixed(2)} DA was added for "${name}" in Budget ${budgetId}.`,
        amount: amount,
      });

      setExpenseInputs((prev) => ({ ...prev, [`${sousarticleId}_${budgetId}`]: 0 }));

      fetchBudgetDivisions();
    } catch (error) {
      return
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
              width: "100%",
              display: "flex",
              padding: "0px 20px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {budgets.map((budget) => (
              <div key={budget.id}>
                <h4>{budget.type} {budget.id}</h4>
                <p>
                  Total: <span style={{ color: "#001A82" }}>{budget.total_amount.toFixed(2)} DA</span>
                </p>
                <p>
                  Spent: <span style={{ color: "#001A82" }}>{budget.spent.toFixed(2)} DA</span>
                </p>
                <p>
                  Remaining: <span style={{ color: "#001A82" }}>{(budget.total_amount - budget.spent).toFixed(2)} DA</span>
                </p>
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
                                      {budgets.map((budget) => (
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