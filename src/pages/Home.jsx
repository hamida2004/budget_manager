import React, { useEffect, useState } from "react";
import { FaBars, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import SideBar from "../components/SideBar";
import Nav from "../components/nav";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useBudget } from "../context/budgetContext";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

const Container = styled.div`
  position: relative;
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
  padding: 20px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const LegendContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const Legend = styled.ul`
  list-style: none;
  padding: 0;
  flex: 1;
`;

const LegendItem = styled.li`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  position: relative;
  cursor: pointer;
  span {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 10px;
    background-color: ${(props) => props.color};
  }
`;

const Span = styled.span`
  width: 100%;
`;

const LegendHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-top: 5px;
`;

const Progress = styled.div`
  width: ${(props) => props.percent}%;
  height: 100%;
  background-color: ${(props) =>
    props.percent > 50 ? "#2ecc71" : props.percent > 20 ? "#f1c40f" : "#e74c3c"};
  border-radius: 4px;
`;

const ArticleList = styled.ul`
  list-style: none;
  padding-left: 20px;
  margin-top: 5px;
  display: ${(props) => (props.visible ? "block" : "none")};
`;

const ArticleItem = styled.li`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const SousarticleList = styled.ul`
  list-style: none;
  padding-left: 20px;
  margin-top: 5px;
  display: ${(props) => (props.visible ? "block" : "none")};
`;

const SousarticleItem = styled.li`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ShowMoreButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: #001A82;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  &:hover {
    text-decoration: underline;
  }
`;

const TransactionsSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  flex: 1;
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
  padding: 20px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const SummaryItem = styled.div`
  margin-bottom: 10px;
`;

function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { totalBudget, budgets } = useBudget();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sousarticles, setSousarticles] = useState([]);
  const [budgetDivisions, setBudgetDivisions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedArticles, setExpandedArticles] = useState({});
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [divs, notifs, sousarts, arts, chaps] = await Promise.all([
        window.api.getBudgetDivisions(),
        window.api.getNotifications(),
        window.api.getSousarticles(),
        window.api.getArticles(),
        window.api.getChapters(),
      ]);
      setBudgetDivisions(divs);
      setNotifications(
        notifs
          .filter((notif) => notif.title !== "Report Generated")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setSousarticles(sousarts);
      setArticles(arts);
      setChapters(chaps);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getSousarticleName = (id) => {
    const article = sousarticles.find((a) => a.id === id);
    return article ? article.name : "غير معروف";
  };

  const getArticleName = (id) => {
    const article = articles.find((a) => a.id === id);
    return article ? article.name : "Unknown";
  };

  const getChapterName = (id) => {
    const chapter = chapters.find((c) => c.id === id);
    return chapter ? chapter.name : "Unknown";
  };

  // Calculate chapter-level budget data
  const chapterBudgets = chapters.map((chapter) => {
    const relatedArticles = articles.filter((ar) => ar.chapter_id === chapter.id);
    const relatedSousarticles = sousarticles.filter((sa) =>
      relatedArticles.some((ar) => ar.id === sa.article_id)
    );
    const spent = budgetDivisions
      .filter(
        (div) =>
          div.chapter_id === chapter.id ||
          relatedArticles.some((ar) => ar.id === div.article_id) ||
          relatedSousarticles.some((sa) => sa.id === div.sousarticle_id)
      )
      .reduce((acc, div) => acc + (parseFloat(div.amount) || 0), 0);
    const allocated = spent; // Assuming allocated is the sum of spent
    const remaining = allocated - spent; // For now, remaining is 0
    const percentRemaining = allocated ? (remaining / allocated) * 100 : 0;
    return {
      id: chapter.id,
      name: chapter.name,
      allocated,
      spent,
      remaining,
      percentRemaining,
      hasDivisions: spent > 0,
    };
  });

  // Filter chapters with divisions
  const contributingChapters = chapterBudgets.filter((ch) => ch.hasDivisions);
  const displayedChapters = showAllChapters ? chapterBudgets : contributingChapters;

  // Total spent and remaining
  const totalSpent = chapterBudgets.reduce((acc, ch) => acc + ch.spent, 0);
  const remaining = totalBudget - totalSpent;

  // Pie chart data for contributing chapters
  const pieData = {
    labels: contributingChapters.map((ch) => ch.name),
    datasets: [
      {
        data: contributingChapters.map((ch) => ch.spent),
        backgroundColor: contributingChapters.map((_, i) => `hsl(${(i * 57) % 360}, 70%, 50%)`),
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw.toFixed(2)} DA`,
        },
      },
    },
    cutout: "70%", // Doughnut hole size
  };

  // Get articles for a chapter with budget details
  const getArticlesForChapter = (chapterId) => {
    const relatedArticles = articles.filter((ar) => ar.chapter_id === chapterId);
    return relatedArticles.map((ar) => {
      const relatedSousarticles = sousarticles.filter((sa) => sa.article_id === ar.id);
      const spent = budgetDivisions
        .filter(
          (div) =>
            div.article_id === ar.id ||
            relatedSousarticles.some((sa) => sa.id === div.sousarticle_id)
        )
        .reduce((acc, div) => acc + (parseFloat(div.amount) || 0), 0);
      const allocated = spent;
      const remaining = allocated - spent;
      const percentRemaining = allocated ? (remaining / allocated) * 100 : 0;
      return { id: ar.id, name: ar.name, spent, remaining, percentRemaining };
    });
  };

  // Get sousarticles for an article with budget details
  const getSousarticlesForArticle = (articleId) => {
    const relatedSousarticles = sousarticles.filter((sa) => sa.article_id === articleId);
    return relatedSousarticles.map((sa) => {
      const spent = budgetDivisions
        .filter((div) => div.sousarticle_id === sa.id)
        .reduce((acc, div) => acc + (parseFloat(div.amount) || 0), 0);
      const allocated = spent;
      const remaining = allocated - spent;
      const percentRemaining = allocated ? (remaining / allocated) * 100 : 0;
      return { id: sa.id, name: sa.name, spent, remaining, percentRemaining };
    });
  };

  // Toggle chapter expansion
  const toggleChapter = (id) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle article expansion
  const toggleArticle = (id) => {
    setExpandedArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
  const groupedNotifications = notifications.reduce((acc, notif) => {
    const date = new Date(notif.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(notif);
    return acc;
  }, {});

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
                <h3>Budget by Chapter</h3>
                <Doughnut data={pieData} options={pieOptions} width={100} height={100} />
                <Summary>
                  <SummaryItem>Total Budget: {totalBudget.toFixed(2)} DA</SummaryItem>
                </Summary>
              </PieWrapper>
              <LegendContainer>
                <Legend>
                  {displayedChapters.map((chapter) => (
                    <LegendItem key={chapter.id} color={`hsl(${(chapters.findIndex(c => c.id === chapter.id) * 57) % 360}, 70%, 50%)`}>
                      <LegendHeader onClick={() => toggleChapter(chapter.id)}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                          <span />
                          <Span
                            style={{
                              backgroundColor: 'white',
                              width: '100%',
                              height: 'fit-content',
                            }}
                          >
                            {chapter.name} - {chapter.spent.toFixed(2)} DA
                          </Span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {chapter.hasDivisions && (
                            expandedChapters[chapter.id] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                          )}
                        </div>
                      </LegendHeader>
                      {chapter.hasDivisions && (
                        <>
                          <ProgressBar>
                            <Progress percent={chapter.percentRemaining} />
                          </ProgressBar>
                          <ArticleList visible={expandedChapters[chapter.id]}>
                            {getArticlesForChapter(chapter.id).map((article) => (
                              <ArticleItem key={article.id}>
                                <LegendHeader onClick={() => toggleArticle(article.id)}>
                                  <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ marginLeft: 20 }} />
                                    <Span
                                      style={{
                                        backgroundColor: 'white',
                                        width: '100%',
                                        height: 'fit-content',
                                      }}
                                    >
                                      {article.name} - Spent: {article.spent.toFixed(2)} DA
                                    </Span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {article.spent > 0 && (
                                      expandedArticles[article.id] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
                                    )}
                                  </div>
                                </LegendHeader>
                                <ProgressBar>
                                  <Progress percent={article.percentRemaining} />
                                </ProgressBar>
                                <SousarticleList visible={expandedArticles[article.id]}>
                                  {getSousarticlesForArticle(article.id).map((sa) => (
                                    <SousarticleItem key={sa.id}>
                                      <span style={{ marginLeft: 40 }} />
                                      <span
                                        style={{
                                          backgroundColor: 'white',
                                          width: '100%',
                                        }}
                                      >
                                        {sa.name} - Spent: {sa.spent.toFixed(2)} DA
                                      </span>
                                    </SousarticleItem>
                                  ))}
                                </SousarticleList>
                              </ArticleItem>
                            ))}
                          </ArticleList>
                        </>
                      )}
                    </LegendItem>
                  ))}
                </Legend>
                {chapters.length > contributingChapters.length && (
                  <ShowMoreButton onClick={() => setShowAllChapters(!showAllChapters)}>
                    {showAllChapters ? "Show Less" : "Show More"}
                  </ShowMoreButton>
                )}
              </LegendContainer>
            </ReportSection>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'center',
                gap: 20,
              }}
            >
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
              <Summary>
                <h3>Budget Summary</h3>
                <SummaryItem>Total Transactions: {budgets.length + budgetDivisions.length}</SummaryItem>
                <SummaryItem>Total Budget: {totalBudget.toFixed(2)} DA</SummaryItem>
                <SummaryItem>Total Spent: {totalSpent.toFixed(2)} DA</SummaryItem>
                <SummaryItem>Total Remaining: {remaining.toFixed(2)} DA</SummaryItem>
              </Summary>
            </div>
          </MainContent>
        </Content>
      </Container>
    </>
  );
}

export default Home;