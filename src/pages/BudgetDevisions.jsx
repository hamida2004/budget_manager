import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaBars, FaMoneyBillWave, FaFlask, FaTools, FaCar, FaLightbulb, FaUserTie, FaWrench, FaRecycle } from "react-icons/fa";
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

const BudgetDevisions = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { addExpense, deleteExpense } = useBudget();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [wilaya, setWilaya] = useState('');
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
  const [newChapterName, setNewChapterName] = useState("");
  const [showChapterInput, setShowChapterInput] = useState(false);

  const findWilaya = (id) => {
    const wilaya = wilayas.find((w) => w.id === parseInt(id));
    setWilaya(wilaya ? wilaya.wilaya : '');
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

  const fetchLaboratory = async () => {
    try {
      const lab = await window.api.getLaboratory();
      setLaboratory(lab[0] || {});
      if (lab[0]?.wilaya) findWilaya(lab[0].wilaya);
    } catch (error) {
      console.error("Error fetching laboratory:", error);
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
  }, [user, navigate]);

  const totalBudget = budgets.reduce((sum, budget) => sum + (budget.total_amount || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  function generatePDF() {
    try {
      findWilaya(laboratory.wilaya);
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const lineHeight = 15;
      const tableStartY = 160;
      let y = tableStartY;
      const tableWidth = pageWidth - 2 * margin;
      const colWidths = [tableWidth * 0.6, tableWidth * 0.2, tableWidth * 0.2];
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
          pdf.text(`Wilaya: ${wilaya || laboratory.wilaya || "N/A"}`, margin, 140);
        }
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

      const drawTableRow = (label, amountAnnual, amountAdditional, indent = 0, isBold = false) => {
        checkPageBreak(lineHeight + 10);
        const wrappedLabel = pdf.splitTextToSize(label, colWidths[0] - indent);
        const lineCount = wrappedLabel.length;
        const rowHeight = lineHeight * lineCount;

        pdf.setFont("Helvetica", isBold ? "bold" : "normal");
        pdf.setFontSize(10);
        pdf.text(wrappedLabel, margin + indent, y + 10, { maxWidth: colWidths[0] - indent });
        pdf.text(amountAnnual || "0.00 DA", margin + colWidths[0] + colWidths[1] - 5, y + 10, { align: "right" });
        pdf.text(amountAdditional || "0.00 DA", margin + tableWidth - 5, y + 10, { align: "right" });

        pdf.rect(margin, y, colWidths[0], rowHeight);
        pdf.rect(margin + colWidths[0], y, colWidths[1], rowHeight);
        pdf.rect(margin + colWidths[0] + colWidths[1], y, colWidths[2], rowHeight);
        y += rowHeight > lineHeight ? rowHeight : lineHeight;
      };

      // --- Header ---
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

      let grandTotal = 0;

      chapters.forEach((chapter) => {
        const chapterArticles = articles.filter((ar) => ar.chapter_id === chapter.id);
        let chapterTotal = 0;

        // Chapter Row
        drawTableRow(chapter.name, "", "", 10, true);

        if (chapterArticles.length === 0) {
          // Check for chapter-level distribution
          const initialDivision = budgetDivisions.find((div) => div.chapter_id === chapter.id && !div.article_id && div.budget_id === 1);
          const additionalDivision = budgetDivisions.find((div) => div.chapter_id === chapter.id && !div.article_id && div.budget_id !== 1);
          const amountAnnual = initialDivision ? parseFloat(initialDivision.amount) : 0;
          const amountAdditional = additionalDivision ? parseFloat(additionalDivision.amount) : 0;
          chapterTotal += amountAnnual + amountAdditional;

          if (amountAnnual > 0 || amountAdditional > 0) {
            drawTableRow("Total Chapter", formatDA(amountAnnual), formatDA(amountAdditional), 20, true);
          }
        } else {
          chapterArticles.forEach((article) => {
            const articleDivisions = budgetDivisions.filter(
              (div) => div.article_id === article.id && !div.sousarticle_id
            );
            let articleTotal = 0;

            // Article Row
            drawTableRow(article.name, "", "", 20);

            if (articleDivisions.length > 0) {
              articleDivisions.forEach((division) => {
                const amountAnnual = division.budget_id === 1 ? parseFloat(division.amount) : 0;
                const amountAdditional = division.budget_id !== 1 ? parseFloat(division.amount) : 0;
                if (amountAnnual > 0 || amountAdditional > 0) {
                  drawTableRow(article.name, formatDA(amountAnnual), formatDA(amountAdditional), 40);
                  articleTotal += amountAnnual + amountAdditional;
                }
              });
            }

            const articleSousarticles = sousarticles.filter((sa) => sa.article_id === article.id);
            if (articleSousarticles.length > 0) {
              articleSousarticles.forEach((sousarticle) => {
                const initialDivision = budgetDivisions.find(
                  (div) => div.sousarticle_id === sousarticle.id && div.budget_id === 1
                );
                const additionalDivision = budgetDivisions.find(
                  (div) => div.sousarticle_id === sousarticle.id && div.budget_id !== 1
                );
                const amountAnnual = initialDivision ? parseFloat(initialDivision.amount) : 0;
                const amountAdditional = additionalDivision ? parseFloat(additionalDivision.amount) : 0;
                if (amountAnnual > 0 || amountAdditional > 0) {
                  drawTableRow(sousarticle.name, formatDA(amountAnnual), formatDA(amountAdditional), 40);
                  articleTotal += amountAnnual + amountAdditional;
                }
              });
            } else if (articleDivisions.length === 0) {
              // Skip empty rows
            }

            // Article Total
            if (articleTotal > 0) {
              chapterTotal += articleTotal;
            }
          });
          // Chapter Total
          if (chapterTotal > 0) {
            drawTableRow("Total Article", "", formatDA(chapterTotal), 10, true);
          }
        }

        grandTotal += chapterTotal;
      });

      // Grand Total
      drawTableRow("TOTAL GENERAL DU BUDGET", "", formatDA(grandTotal), 10, true);

      pdf.save("budget-report.pdf");
      alert("✅ PDF generated successfully!");
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      alert("Failed to generate PDF. Please check the console.");
    }

    // Format DA helper
    function formatDA(value) {
      return `${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} DA`;
    }
  }

  const toggleChapter = (id) => {
    setOpenChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleArticle = (id) => {
    setOpenArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addChapter = async () => {
    if (!newChapterName || newChapterName.trim() === "") {
      setError("Please enter a valid chapter name.");
      return;
    }
    try {
      const newChapter = { name: newChapterName.trim() };
      const result = await window.api.addChapter(newChapter);
      setChapters((prev) => [...prev, result]);
      setNewChapterName("");
      setShowChapterInput(false);
    } catch (error) {
      console.error("Error adding chapter:", error);
      setError("Failed to add chapter.");
    }
  };

  const addArticle = async (chapterId, name) => {
    if (!name || name.trim() === "") {
      setError("Please enter a valid article name.");
      return;
    }
    try {
      const newArticle = { name: name.trim(), chapter_id: chapterId };
      const result = await window.api.addArticle(newArticle);
      setArticles((prev) => [...prev, result]);
      setAddInputVisible((prev) => ({ ...prev, [`chapter_${chapterId}`]: false }));
      setNewItemName((prev) => ({ ...prev, [`chapter_${chapterId}`]: "" }));
    } catch (error) {
      console.error("Error adding article:", error);
      setError("Failed to add article.");
    }
  };

  const addSousarticle = async (articleId, name) => {
    if (!name || name.trim() === "") {
      setError("Please enter a valid sousarticle name.");
      return;
    }
    try {
      const newItem = { name: name.trim(), article_id: articleId };
      const result = await window.api.addSousarticle(newItem);
      setSousarticles((prev) => [...prev, result]);
      setAddInputVisible((prev) => ({ ...prev, [articleId]: false }));
      setNewItemName((prev) => ({ ...prev, [articleId]: "" }));
    } catch (error) {
      console.error("Error adding sousarticle:", error);
      setError("Failed to add sousarticle.");
    }
  };

  const toggleAddInput = (id, type = 'sousarticle') => {
    const key = type === 'article' ? `chapter_${id}` : id;
    setAddInputVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (!addInputVisible[key]) {
      setNewItemName((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleNewItemName = (id, value, type = 'sousarticle') => {
    const key = type === 'article' ? `chapter_${id}` : id;
    setNewItemName((prev) => ({ ...prev, [key]: value }));
  };

  const deleteChapter = async (id) => {
    try {
      await window.api.deleteChapter(id);
      setChapters((prev) => prev.filter((ch) => ch.id !== id));
      setArticles((prev) => prev.filter((ar) => ar.chapter_id !== id));
      setSousarticles((prev) => prev.filter((sa) => !articles.some(ar => ar.id === sa.article_id && ar.chapter_id === id)));
    } catch (error) {
      console.error("Error deleting chapter:", error);
      setError("Failed to delete chapter.");
    }
  };

  const deleteArticle = async (id) => {
    try {
      await window.api.deleteArticle(id);
      setArticles((prev) => prev.filter((ar) => ar.id !== id));
      setSousarticles((prev) => prev.filter((sa) => sa.article_id === id));
    } catch (error) {
      console.error("Error deleting article:", error);
      setError("Failed to delete article.");
    }
  };

  const deleteSousarticle = async (id) => {
    try {
      await window.api.deleteSousarticle(id);
      setSousarticles((prev) => prev.filter((sa) => sa.id !== id));
      const divisions = budgetDivisions.filter((div) => div.sousarticle_id === id);
      for (const division of divisions) {
        await deleteExpense(division.id);
      }
      fetchBudgetDivisions();
    } catch (error) {
      console.error("Error deleting sousarticle:", error);
      setError("Failed to delete sousarticle.");
    }
  };

  const handleExpenseInput = (id, budgetId, value, type = 'sousarticle') => {
    const key = type === 'chapter' ? `chapter_${id}` : type === 'article' ? `article_${id}` : id;
    setExpenseInputs((prev) => ({
      ...prev,
      [`${key}_${budgetId}`]: parseFloat(value) || 0,
    }));
  };

  const saveExpense = async (e, id, parentId, name, budgetId, type = 'sousarticle') => {
    e.preventDefault();
    setError("");
    const key = type === 'chapter' ? `chapter_${id}` : type === 'article' ? `article_${id}` : id;
    const amount = expenseInputs[`${key}_${budgetId}`];
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
      const divisionData = { budget_id: budgetId, amount };
      if (type === 'chapter') {
        divisionData.chapter_id = id;
      } else if (type === 'article') {
        divisionData.article_id = id;
        divisionData.chapter_id = parentId; // parentId is chapter_id for articles
      } else if (type === 'sousarticle') {
        divisionData.sousarticle_id = id;
        const article = articles.find((ar) => ar.id === parentId);
        divisionData.article_id = parentId;
        divisionData.chapter_id = article ? article.chapter_id : null;
      }

      await window.api.addBudgetDivision(divisionData);

      const newSpent = budget.spent + amount;
      await window.api.updateBudgets({
        id: budgetId,
        year: budget.year,
        type: budget.type,
        total_amount: budget.total_amount,
        spent: newSpent,
      });

      setBudgets((prevBudgets) =>
        prevBudgets.map((b) =>
          b.id === budgetId ? { ...b, spent: newSpent } : b
        )
      );

      await addExpense({
        sousarticle_id: type === 'sousarticle' ? id : undefined,
        article_id: type === 'article' ? id : type === 'sousarticle' ? parentId : undefined,
        chapter_id: type === 'chapter' ? id : type === 'sousarticle' && divisionData.chapter_id ? divisionData.chapter_id : undefined,
        name,
        amount
      });

      setExpenseInputs((prev) => ({ ...prev, [`${key}_${budgetId}`]: 0 }));
      fetchBudgetDivisions();
    } catch (error) {
      console.error("Error saving expense:", error);
      setError(`Failed to save expense: ${error.message}`);
    }
  };

  const calculateArticleTotal = (articleId) => {
    const articleDivisions = budgetDivisions
      .filter((div) => div.article_id === articleId && !div.sousarticle_id)
      .reduce((acc, div) => acc + (parseFloat(div.amount) || 0), 0);
    const sousarticleDivisions = budgetDivisions
      .filter((div) => sousarticles.find((sa) => sa.id === div.sousarticle_id && sa.article_id === articleId))
      .reduce((acc, div) => acc + (parseFloat(div.amount) || 0), 0);
    return articleDivisions + sousarticleDivisions;
  };

  const calculateChapterTotal = (chapterId) => {
    const articleTotals = articles
      .filter((ar) => ar.chapter_id === chapterId)
      .reduce((acc, ar) => acc + calculateArticleTotal(ar.id), 0);
    const chapterDivisions = budgetDivisions
      .filter((div) => div.chapter_id === chapterId && !div.article_id && !div.sousarticle_id)
      .reduce((acc, div) => acc + (parseFloat(div.amount) || 0), 0);
    return articleTotals + chapterDivisions;
  };

  const calculateItemPrice = (id, budgetId, type = 'sousarticle') => {
    const division = budgetDivisions.find((div) =>
      (type === 'chapter' && div.chapter_id === id && !div.article_id && !div.sousarticle_id) ||
      (type === 'article' && div.article_id === id && !div.sousarticle_id) ||
      (type === 'sousarticle' && div.sousarticle_id === id)
    );
    return division ? parseFloat(division.amount) : expenseInputs[`${type === 'chapter' ? `chapter_${id}` : type === 'article' ? `article_${id}` : id}_${budgetId}`] || 0;
  };

  const hasDivision = (id, budgetId, type = 'sousarticle') => {
    return budgetDivisions.some((div) =>
      (type === 'chapter' && div.chapter_id === id && !div.article_id && !div.sousarticle_id) ||
      (type === 'article' && div.article_id === id && !div.sousarticle_id) ||
      (type === 'sousarticle' && div.sousarticle_id === id)
    );
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
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0px 20px'
            }}
          >
            <h3>Budget Division</h3>
            {showChapterInput ? (
              <AddInputContainer style={{ marginBottom: 20 }}>
                <AddInput
                  type="text"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="Enter chapter name"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addChapter();
                  }}
                />
                <MdSave
                  size={20}
                  color="#001A82"
                  onClick={addChapter}
                />
                <MdDelete
                  size={20}
                  color="red"
                  onClick={() => setShowChapterInput(false)}
                />
              </AddInputContainer>
            ) : (
              <MdAdd
                size={24}
                color="green"
                onClick={() => setShowChapterInput(true)}
                style={{
                  cursor: 'pointer'
                }}
              />
            )}
          </div>
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
                        {articles.filter((ar) => ar.chapter_id === ch.id).length > 2 ? "..." : ""}
                      </span>
                    </div>
                  </ChapterTitle>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <p>Chapter Total: {calculateChapterTotal(ch.id).toFixed(2)} DA</p>
                    <MdDelete
                      size={20}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChapter(ch.id);
                      }}
                    />
                    {addInputVisible[`chapter_${ch.id}`] ? (
                      <AddInputContainer style={{ margin: "8px 20px" }}>
                        <AddInput
                          type="text"
                          value={newItemName[`chapter_${ch.id}`] || ""}
                          onChange={(e) => handleNewItemName(ch.id, e.target.value, 'article')}
                          placeholder="Enter article name"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addArticle(ch.id, newItemName[`chapter_${ch.id}`]);
                            }
                          }}
                        />
                        <MdSave
                          size={20}
                          color="#001A82"
                          onClick={() => addArticle(ch.id, newItemName[`chapter_${ch.id}`])}
                        />
                        <MdDelete
                          size={20}
                          color="red"
                          onClick={() => toggleAddInput(ch.id, 'article')}
                        />
                      </AddInputContainer>
                    ) : (
                      <MdAdd
                        size={24}
                        color="green"
                        onClick={() => toggleAddInput(ch.id, 'article')}
                        style={{
                          cursor: 'pointer'
                        }}
                      />
                    )}
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
                              <p>Article Total: {calculateArticleTotal(ar.id).toFixed(2)} DA</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                              {addInputVisible[ar.id] ? (
                                <AddInputContainer>
                                  <AddInput
                                    type="text"
                                    value={newItemName[ar.id] || ""}
                                    onChange={(e) => handleNewItemName(ar.id, e.target.value)}
                                    placeholder="Enter sousarticle name"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        addSousarticle(ar.id, newItemName[ar.id]);
                                      }
                                    }}
                                  />
                                  <MdSave
                                    size={20}
                                    color="#001A82"
                                    onClick={() => addSousarticle(ar.id, newItemName[ar.id])}
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
                              <div
                                style={{
                                  boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                                  borderRadius: 8,
                                  margin: "8px 20px",
                                  padding: "8px 20px",
                                }}
                              >
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'start',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: 8
                                  }}
                                >
                                  {budgets.map((b) => {
                                    const division = budgetDivisions.find(
                                      (budget) => budget.article_id === ar.id && budget.budget_id === b.id && !budget.sousarticle_id
                                    );
                                    const amount = division ? parseFloat(division.amount) : 0;
                                    const inputKey = `article_${ar.id}_${b.id}`; // Align with existing key format

                                    return (
                                      <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span>{b.id === 1 ? "Annual" : "Additional"}:</span>
                                        {amount > 0 ? (
                                          <span>{amount.toFixed(2)} DA</span>
                                        ) : (
                                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            {b.total_amount - b.spent > 0 ? (
                                              <>
                                                <input
                                                  type="number"
                                                  style={{
                                                    width: 100,
                                                    borderColor: "#001A82",
                                                    borderWidth: 1,
                                                    borderRadius: 8,
                                                  }}
                                                  value={expenseInputs[inputKey] || ""}
                                                  onChange={(e) => handleExpenseInput(ar.id, b.id, e.target.value, 'article')}
                                                  min="0"
                                                  step="0.01"
                                                  placeholder="Enter amount"
                                                />
                                                <MdSave
                                                  size={20}
                                                  color="#001A82"
                                                  onClick={(e) => {
                                                    saveExpense(e, ar.id, ch.id, ar.name, b.id, 'article');
                                                    // Reset input field after saving
                                                    setExpenseInputs((prev) => ({ ...prev, [inputKey]: "" }));
                                                  }}
                                                  disabled={!expenseInputs[inputKey] || parseFloat(expenseInputs[inputKey]) <= 0}
                                                />
                                              </>
                                            ) : (
                                              <span>0.00 DA</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </span>
                              </div>
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
                                      {budgets.map((b) => {
                                        const division = budgetDivisions.find(
                                          (budget) => budget.sousarticle_id === sa.id && budget.budget_id === b.id
                                        );
                                        const amount = division ? parseFloat(division.amount) : 0;
                                        const inputKey = `${sa.id}_${b.id}`; // Align with handleExpenseInput key format

                                        return (
                                          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span>{b.id === 1 ? "Annual" : "Additional"}:</span>
                                            {amount > 0 ? (
                                              <span>{amount.toFixed(2)} DA</span>
                                            ) : (
                                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                {b.total_amount - b.spent > 0 ? (
                                                  <>
                                                    <input
                                                      type="number"
                                                      style={{
                                                        width: 100,
                                                        borderColor: "#001A82",
                                                        borderWidth: 1,
                                                        borderRadius: 8,
                                                      }}
                                                      value={expenseInputs[inputKey] || ""}
                                                      onChange={(e) => handleExpenseInput(sa.id, b.id, e.target.value, 'sousarticle')}
                                                      min="0"
                                                      step="0.01"
                                                      placeholder="Enter amount"
                                                    />
                                                    <MdSave
                                                      size={20}
                                                      color="#001A82"
                                                      onClick={(e) => {
                                                        saveExpense(e, sa.id, ar.id, sa.name, b.id, 'sousarticle');
                                                        // Reset input field after saving
                                                        setExpenseInputs((prev) => ({ ...prev, [inputKey]: "" }));
                                                      }}
                                                      disabled={!expenseInputs[inputKey] || parseFloat(expenseInputs[inputKey]) <= 0}
                                                    />
                                                  </>
                                                ) : (
                                                  <span>0.00 DA</span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <MdDelete
                                      size={20}
                                      color="red"
                                      onClick={() => deleteSousarticle(sa.id)}
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
          {(totalRemaining === 0 && totalBudget > 0) && (
            <div style={{ position: "absolute", top: 20, right: 20 }}>
              <Button
                text={"Generate Report"}
                handleClick={() => generatePDF()}
              />
            </div>
          )}
        </Section>
        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Container>
    </>
  );
};

export default BudgetDevisions;