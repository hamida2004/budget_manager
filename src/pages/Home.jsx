import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import SideBar from "../components/SideBar";
import Nav from "../components/nav";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useBudget } from "../context/budgetContext";

const Container = styled.div`
  position:relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Amount = styled.span`
  margin-left: 10px;
  ${({ title }) =>
    title === "New Budget Added"
      ? `color: #2ecc71; font-weight: bold;`
      : `color: #e74c3c; font-weight: bold;`}
  &:before {
    content: ${({ title }) => (title === "New Budget Added" ? '"+ "' : '"- "')};
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  margin-left: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #fff;
  margin-left: 20px;
`;

const ReportSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 40px;
`;

const PieWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PieChart = styled.div`
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: conic-gradient(
    ${(props) =>
    props.colors
      .map((color, i) => `${color.color} ${color.start}% ${color.end}%`)
      .join(", ")}
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
`;

const Legend = styled.ul`
  list-style: none;
  padding: 0;
  flex: 1;
`;

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  span {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 10px;
    background-color: ${(props) => props.color};
  }
`;

const TransactionsSection = styled.div`
  margin-top: 20px;
`;

const TransactionGroup = styled.div`
  margin-bottom: 20px;
`;

const TransactionItem = styled.div`
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  padding-left: 20px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    border-radius: 4px 0 0 4px;
    background-color: ${(props) =>
    props.$title === "Report Generated"
      ? "#b3e5fc"
      : props.$title === "New Budget Added"
        ? "#2ecc71"
        : "#e74c3c"};
  }
`;

const Summary = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
`;

function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const {totalBudget } = useBudget();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sousarticles, setSousArticles] = useState([]);
  const [budgetDivisions, setBudgetDivisions] = useState([]);

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchBudgetDivisions();
    fetchNotifications();
    fetchSousArticles();
  }, [user, navigate]);

  const fetchBudgetDivisions = async () => {
    try {
      const devs = await window.api.getBudgetDivisions();
      setBudgetDivisions(devs);
      console.log("Budget Divisions:", devs);
    } catch (error) {
      console.error("Error fetching budget divisions:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notifs = await window.api.getNotifications();
      const filteredNotifs = notifs
        .filter((notif) => notif.title !== "Report Generated")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(filteredNotifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

 
  const fetchSousArticles = async () => {
    try {
      const articles = await window.api.getSousarticles();
      setSousArticles(articles);
    } catch (error) {
      console.error("Error loading articles:", error);
    }
  };


  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
  const groupedNotifications = notifications.reduce((acc, notif) => {
    const date = new Date(notif.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(notif);
    return acc;
  }, {});

  // New: Calculate totalSpent from divisions
  const totalSpent = budgetDivisions.reduce((acc, div) => acc + (div.amount || 0), 0);
  const remaining = totalBudget - totalSpent;

  const getSousArticleName = (id) => {
    const article = sousarticles.find((a) => a.id === id);
    return article ? article.name : "غير معروف";
  };

  // Pie chart data
  let cumulative = 0;
  const pieData = budgetDivisions.map((division, i) => {
    const start = cumulative;
    const percent = totalBudget ? (division.amount / totalBudget) * 100 : 0;
    cumulative += percent;
    return {
      name: getSousArticleName(division.sousarticle_id
      ) || `Division ${i + 1}`,
      color: `hsl(${(i * 57) % 360}, 70%, 50%)`,
      amount: division.amount || 0,
      start,
      end: cumulative,
    };
  });

  // Add remaining budget as a gray slice
  if (remaining > 0) {
    pieData.push({
      name: "Remaining",
      color: "#ccc",
      amount: remaining,
      start: cumulative,
      end: 100,
    });
  }

  return (
    <>
      <Nav />
      <Container>
        <FaBars
          size={24}
          style={{ cursor: "pointer", alignSelf: "flex-start", position: "absolute", top: 10, left: 10 }}
          onClick={() => setSidebarOpen(true)}
        />
        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        <Content>
          <MainContent>
            <ReportSection>
              <PieWrapper>
                <h3>Budget Divisions</h3>
                <PieChart colors={pieData}>
                  <div>{totalSpent} DA</div>
                </PieChart>
                <Summary>
                  <p>Total Budget: {totalBudget} DA</p>
                  <p>Remaining Budget: {remaining} DA</p>
                </Summary>
              </PieWrapper>
              <Legend>
                {pieData.map((item) => (
                  <LegendItem key={item.name} color={item.color}>
                    <span /> {item.name} - {item.amount} DA
                  </LegendItem>
                ))}
              </Legend>
            </ReportSection>

            <TransactionsSection>
              <h3>Transactions</h3>
              {Object.entries(groupedNotifications).map(([date, notifs]) => (
                <TransactionGroup key={date}>
                  <h4>{date === today ? "Today" : date === yesterday ? "Yesterday" : date}</h4>
                  {notifs.map((notif) => (
                    <TransactionItem key={notif.id} $title={notif.title}>
                      <strong>{notif.title}</strong>
                      <p>
                        {notif.content}
                        {notif.amount && <Amount title={notif.title}>{parseFloat(notif.amount).toFixed(2)} DA</Amount>}
                      </p>
                      <small>{new Date(notif.created_at).toLocaleString()}</small>
                    </TransactionItem>
                  ))}
                </TransactionGroup>
              ))}
            </TransactionsSection>
          </MainContent>
        </Content>
      </Container>
    </>
  );
}

export default Home;
