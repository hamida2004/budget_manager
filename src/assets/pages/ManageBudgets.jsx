import html2canvas from "html2canvas";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { MdAdd, MdDelete } from "react-icons/md";
import { jsPDF } from "jspdf";
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

const Button = styled.button`
  background-color: #00092b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
`;

const generatePDF = async (budgets, laboratory, totalBudget) => {
  try {
    // Create a container for the report
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial";
    container.style.fontSize = "12px";
    container.style.background = "#fff";
    container.style.width = "800px"; // Fixed width for PDF rendering
    container.style.margin = "0 auto";

    // Heading
    const heading = document.createElement("h2");
    heading.textContent = "تقسيم ميزانية التسيير الخاصة بمخبر الذكاء الاصطناعي وتطبيقاته";
    heading.style.textAlign = "center";
    container.appendChild(heading);

    // Laboratory Information
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

    // Summary Section
    const summary = document.createElement("div");
    summary.style.marginBottom = "20px";
    summary.innerHTML = `
      <p><strong>Total Budget:</strong> ${totalBudget.toFixed(2)} DA</p>
    `;
    container.appendChild(summary);

    // Table Section
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.border = "1px solid black";
    table.innerHTML = `
      <thead style="background-color:#001A82; color:white;">
        <tr>
          <th style="border: 1px solid #000; padding: 5px;">#</th>
          <th style="border: 1px solid #000; padding: 5px;">Year</th>
          <th style="border: 1px solid #000; padding: 5px;">Type</th>
          <th style="border: 1px solid #000; padding: 5px;">Total Amount (DA)</th>
          <th style="border: 1px solid #000; padding: 5px;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${budgets.map((b, i) => `
          <tr>
            <td style="border: 1px solid #000; padding: 5px;">${i + 1}</td>
            <td style="border: 1px solid #000; padding: 5px;">${b.year}</td>
            <td style="border: 1px solid #000; padding: 5px;">${b.type}</td>
            <td style="border: 1px solid #000; padding: 5px;">${parseFloat(b.total_amount).toFixed(2)} DA</td>
            <td style="border: 1px solid #000; padding: 5px;">${new Date(b.created_at).toISOString().split("T")[0]}</td>
          </tr>
        `).join("")}
      </tbody>
    `;
    container.appendChild(table);

    // Append the container to the DOM (hidden)
    container.style.position = "absolute";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    // Render the container to a canvas
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // Create the PDF
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(`budgets-report-${new Date().toISOString().split("T")[0]}.pdf`);

    // Clean up
    document.body.removeChild(container);

    // Add notification for generating the report
    await window.api.addNotification({
      title: "Report Generated",
      content: "A budget report has been downloaded.",
      amount:null
    });

    alert("✅ PDF generated successfully!");
  } catch (err) {
    console.error("❌ Error generating PDF:", err);
    alert("Failed to generate PDF. Please check the console.");
  }
};
const ManageBudgets = () => {
  const { budgets, totalBudget, refreshBudgets } = useBudget();
  const [form, setForm] = useState({ year: "", total_amount: "", type: "initial" });
  const [laboratory, setLaboratory] = useState(null);

  useEffect(() => {
    fetchLaboratory();
  }, []);

  const fetchLaboratory = async () => {
    try {
      const lab = await window.api.getLaboratory();
      setLaboratory(lab[0]);
    } catch (error) {
      console.error("Error fetching laboratory:", error);
    }
  };

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
      refreshBudgets();
      setForm({ year: "", total_amount: "", type: "initial" });
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

      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
        }}
      >
        <Button onClick={() => generatePDF(budgets, laboratory, totalBudget)}>
          Generate Report
        </Button>
      </div>
      <Link to="/">Go Back</Link>
    </Container>
  );
};

export default ManageBudgets;