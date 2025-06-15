import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/button'
import { useBudget } from "../context/budgetContext";

function Report() {
    const [laboratory, setLaboratory] = useState({});
    useEffect(() => {
        fetchLaboratory()
    }, [])
    const fetchLaboratory = async () => {
        try {
            const lab = await window.api.getLaboratory();
            setLaboratory(lab[0] || {});
        } catch (error) {
            console.error("Error fetching laboratory:", error);
        }
    };
    const {  budgets,totalBudget, totalSpent, remainingBudget, expenses } = useBudget();


    const generateBudgetsPDF = async (budgets, laboratory, totalBudget) => {
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
    return (
        <>
            <div>Report</div>
            <div
            style={{
                alignItems:'center',
                justifyContent:'center',
                display:'flex',
                width:400
            }}
            ><div >
                <Button
                    text={"Generate Report"}
                    handleClick={() => generatePDF(totalBudget, totalSpent, remainingBudget, expenses, laboratory)}
                />
            </div>
            <div
               
            >
                <Button text={' Generate budgets Report'} handleClick={() => generateBudgetsPDF(budgets, laboratory, totalBudget)}>
                   
                </Button>
            </div>
            </div>
            <Link to={'/'}>go back</Link>
        </>
    )
}

export default Report