const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(__dirname, "budget.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

const initSQL = `
PRAGMA foreign_keys = ON;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  username TEXT,
  password TEXT
);

-- LABORATORY
CREATE TABLE IF NOT EXISTS laboratory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  univ TEXT NOT NULL
);

-- CHAPTERS
CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- ARTICLES
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  chapter_id INTEGER,
  FOREIGN KEY(chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- SOUSARTICLES
CREATE TABLE IF NOT EXISTS sousarticles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  article_id INTEGER,
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  type TEXT DEFAULT 'initial',
  total_amount REAL NOT NULL,
  spent REAL DEFAULT 0.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- BUDGET DIVISIONS
CREATE TABLE IF NOT EXISTS budget_divisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  sousarticle_id INTEGER NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  FOREIGN KEY(budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY(sousarticle_id) REFERENCES sousarticles(id) ON DELETE CASCADE
);

-- TOTAL BUDGET
CREATE TABLE IF NOT EXISTS total_budget (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL,
  spent INTEGER NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  amount INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

const data = [
  ["1", "REMBOURSEMENT DES FRAIS"],
  ["1.1", "Frais de mission et de déplacement en Algérie liés aux activités de développement de la recherche"],
  ["1.2", "Frais de mission et de déplacement à l'étranger liés aux activités de développement de la recherche"],
  ["1.3", "Rencontres scientifiques liées au développement de la recherche (Frais d'organisation, frais d'hébergement et de restauration et frais de transport)"],
  ["1.4", "Honoraires des enquêteurs"],
  ["1.5", "Honoraires des guides"],
  ["1.6", "Honoraires des experts et consultants"],
  ["1.7", "Frais d'études, de travaux et de prestation réalisés pour le compte de l'entité de recherche"],
  ["1.8", "Frais d'inscription et de participation aux colloques et séminaires scientifique en Algérie et à l'étranger"],
  ["1.9", "Frais de déplacement et de prise en charge des doctorants en Algérie"],

  ["2", "FOURNITURES"],
  ["2.1", "Produits chimiques"],
  ["2.2", "Produits consommables (y compris consommable informatique)"],
  ["2.3", "Composants électroniques, mécaniques et audiovisuels"],
  ["2.4", "Papeterie et fourniture de bureau"],
  ["2.5", "Périodiques"],
  ["2.6", "Documentation et ouvrages de recherche"],
  ["2.7", "Fournitures des besoins de laboratoires (animaux, plantes etc.…"],
  ["2.8", "Matériels, instrument et petits outillages scientifiques"],
  ["2.9", "Approvisionnement en gaz spécifique au laboratoire"],

  ["3", "CHARGES ANNEXES"],
  ["3.1", "Impression et édition des documents scientifiques et techniques"],
  ["3.2", "Frais de PTT (fax, internet, messagerie express, Frais d'installation de réseau téléphonique) et affranchissement postal"],
  ["3.3", "Autres frais (impôt et taxes, droits de douane, frais financiers, frais de transit et Frais d'assurances)"],
  ["3.4", "Frais de transport d'équipements"],
  ["3.5", "Banque de données (acquisition et abonnement)"],
  ["3.6", "Frais de traduction des documents scientifiques"],
  ["3.7", "Frais de publicité et publications"],
  ["3.8", "Conception, réalisation et maintenance de site web"],

  ["4", "PARC AUTOMOBILE"],
  ["4.1", "Location de véhicules et engins pour les travaux de recherche à réaliser sur terrain"],

  ["5", "FRAIS DE VALORISATION ET DE DEVELOPPEMENT TECHNOLOGIQUE"],
  ["5.1", "Frais d'accompagnement des porteurs de projets de recherche en Algérie"],
  ["5.2", "Frais de propriété intellectuelle servis au profit des institutions homologuées en Algérie et à l'étranger"],
  ["5.2.1", "Recherche d'antériorité"],
  ["5.2.2", "Demande de dépôt de brevet, de marque et de modèle"],
  ["5.2.3", "Dépôt de logiciel"],
  ["5.2.4", "Protection des obtentions végétales, animales et autres"],
  ["5.2.5", "Frais de mandataires"],
  ["5.2.6", "Protection des brevets et logiciels déposés en Algérie et à l'étranger"],
  ["5.3", "Frais de conception et de définition du projet à mettre en valeur"],
  ["5.4", "Frais d'évaluation et de faisabilité du projet valorisable (maturation du projet = plan d'affaire)"],
  ["5.5", "Frais d'expérimentation et de développement des produits à mettre en valeur"],
  ["5.6", "Frais d'incubation"],
  ["5.7", "Frais de service à l'innovation"],
  ["5.8", "Frais de conception et de réalisation de prototypes, maquettes, préséries, installations pilotes et démonstrations"],

  ["6", "RETRIBUTION DES ACTIVITES DES CHERCHEURS"],
  ["6.1", "Rétribution des activités de recherche des chercheurs mobilisés dans le cadre des programmes nationaux de recherche"],
  ["6.2", "Sécurité sociale"],
  ["6.2.1", "Régime général"],
  ["6.2.2", "Assurance chômage"],
  ["6.2.3", "Retraite anticipée"],

  ["7", "Maintenance des équipements scientifique, informatique et matériels de reprographie"],
  ["8", "Renouvellement des équipements scientifique et informatique"],
];

// Helper to run db.run with promise
function runAsync(statement, params) {
  return new Promise((resolve, reject) => {
    statement.run(params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function insertInitialData() {
  return new Promise((resolve, reject) => {
    const chapterMap = {};
    const articleMap = {};

    db.serialize(async () => {
      const insertChapter = db.prepare("INSERT INTO chapters (name) VALUES (?)");
      const insertArticle = db.prepare("INSERT INTO articles (name, chapter_id) VALUES (?, ?)");
      const insertSousArticle = db.prepare("INSERT INTO sousarticles (name, article_id) VALUES (?, ?)");

      try {
        for (const [code, name] of data) {
          const parts = code.split(".");

          if (parts.length === 1) {
            const chapterId = await runAsync(insertChapter, [name]);
            chapterMap[code] = chapterId;
          } else if (parts.length === 2) {
            const chapterId = chapterMap[parts[0]];
            if (chapterId) {
              const articleId = await runAsync(insertArticle, [name, chapterId]);
              articleMap[code] = articleId;
            }
          } else if (parts.length === 3) {
            const articleCode = `${parts[0]}.${parts[1]}`;
            const articleId = articleMap[articleCode];
            if (articleId) {
              await runAsync(insertSousArticle, [name, articleId]);
            }
          }
        }

        insertChapter.finalize();
        insertArticle.finalize();
        insertSousArticle.finalize();
        console.log("✅ Initial data inserted successfully.");
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

db.serialize(() => {
  db.exec(initSQL, async (err) => {
    if (err) {
      console.error("❌ Failed to initialize database:", err.message);
    } else {
      console.log("✅ Database initialized successfully.");
      try {
        await insertInitialData();
      } catch (err) {
        console.error("❌ Failed to insert initial data:", err.message);
      }
    }
  });
});

module.exports = db;
