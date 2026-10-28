"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Category =
  | "All articles"
  | "Cloud infrastructure"
  | "Architecture"
  | "Security"
  | "Migration";

type Article = {
  id: number;
  category: Exclude<Category, "All articles">;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  featured?: boolean;
  icon: "cloud" | "network" | "shield" | "migration" | "server" | "database";
};

const categories: Category[] = [
  "All articles",
  "Cloud infrastructure",
  "Architecture",
  "Security",
  "Migration",
];

const articles: Article[] = [
  {
    id: 1,
    category: "Cloud infrastructure",
    title: "Understanding cloud infrastructure for your business",
    excerpt:
      "Explore the core components of cloud infrastructure and the questions business leaders should ask before moving workloads.",
    readTime: "6 min read",
    date: "Coming soon",
    featured: true,
    icon: "cloud",
  },
  {
    id: 2,
    category: "Architecture",
    title: "Virtual private clouds, explained",
    excerpt:
      "Understand isolated cloud networks, subnets, routing, and how network rules contribute to a considered infrastructure design.",
    readTime: "7 min read",
    date: "Coming soon",
    featured: true,
    icon: "network",
  },
  {
    id: 3,
    category: "Security",
    title: "A practical checklist for cloud security planning",
    excerpt:
      "Key questions about access, network exposure, data protection, monitoring, and operational responsibilities.",
    readTime: "8 min read",
    date: "Coming soon",
    icon: "shield",
  },
  {
    id: 4,
    category: "Migration",
    title: "Planning a cloud migration without unnecessary complexity",
    excerpt:
      "Learn how workload assessment, dependency mapping, migration stages, and post-migration checks fit into a migration plan.",
    readTime: "9 min read",
    date: "Coming soon",
    icon: "migration",
  },
  {
    id: 5,
    category: "Architecture",
    title: "How to think about compute sizing",
    excerpt:
      "Workload requirements, resource capacity, performance, and cost are important considerations when planning compute.",
    readTime: "5 min read",
    date: "Coming soon",
    icon: "server",
  },
  {
    id: 6,
    category: "Cloud infrastructure",
    title: "Building a backup and recovery plan",
    excerpt:
      "Understand recovery objectives, retention needs, and why restoration testing belongs in data protection planning.",
    readTime: "7 min read",
    date: "Coming soon",
    icon: "database",
  },
];

function ArticleIcon({ name }: { name: Article["icon"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const icons: Record<Article["icon"], React.ReactNode> = {
    cloud: (
      <>
        <path d="M7 18h10a4 4 0 0 0 .4-8A5.7 5.7 0 0 0 6.5 8.8 4.6 4.6 0 0 0 7 18Z" />
        <path d="m9 13 2 2 4-4" />
      </>
    ),
    network: (
      <>
        <rect x="9" y="2.5" width="6" height="5" rx="1.2" />
        <rect x="2.5" y="16.5" width="6" height="5" rx="1.2" />
        <rect x="15.5" y="16.5" width="6" height="5" rx="1.2" />
        <path d="M12 7.5v4M5.5 16.5v-5h13v5M12 11.5H5.5M12 11.5h6.5" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2.5 7 2.7v5.3c0 4.5-2.8 7.6-7 9.8-4.2-2.2-7-5.3-7-9.8V5.2l7-2.7Z" />
        <path d="m9 11.5 2 2 4-4" />
      </>
    ),
    migration: (
      <>
        <rect x="2.5" y="4" width="7" height="7" rx="1.5" />
        <rect x="14.5" y="13" width="7" height="7" rx="1.5" />
        <path d="M9.5 7.5h4a3 3 0 0 1 3 3v2.5M13.5 10l3 3 3-3" />
      </>
    ),
    server: (
      <>
        <rect x="3" y="3" width="18" height="7" rx="1.5" />
        <rect x="3" y="14" width="18" height="7" rx="1.5" />
        <path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      {icons[name]}
    </svg>
  );
}

export default function Blog() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("All articles");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredArticles = articles.filter((article) => article.featured);
  const featuredArticle = featuredArticles[0];
  const secondaryFeaturedArticle = featuredArticles[1];

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All articles" ||
        article.category === activeCategory;

      const matchesSearch =
        !query ||
        `${article.title} ${article.excerpt} ${article.category}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="blog-page">
      <section className="blog-hero">
        <div className="blog-container">
          <div className="blog-eyebrow">
            <span className="eyebrow-dot" />
            OPEX CLOUD / INSIGHTS
          </div>

          <div className="blog-hero-grid">
            <div className="blog-hero-copy">
              <h1>
                Clarity for
                <br />
                your next
                <br />
                <span>cloud decision.</span>
              </h1>

              <p>
                Ideas, practical guides, and technical perspectives on cloud
                infrastructure, architecture, security, and migration.
              </p>

              <a href="#latest-articles" className="blog-primary-button">
                Explore the blog
                <span aria-hidden="true">↘</span>
              </a>
            </div>

            <div className="blog-hero-art" aria-hidden="true">
              <div className="art-grid" />
              <div className="art-ring ring-one" />
              <div className="art-ring ring-two" />
              <div className="art-ring ring-three" />

              <div className="art-center">
                <ArticleIcon name="cloud" />
              </div>

              <div className="art-node art-node-one">
                <ArticleIcon name="server" />
              </div>
              <div className="art-node art-node-two">
                <ArticleIcon name="network" />
              </div>
              <div className="art-node art-node-three">
                <ArticleIcon name="shield" />
              </div>

              <span className="art-label art-label-one">INFRASTRUCTURE</span>
              <span className="art-label art-label-two">ARCHITECTURE</span>
              <span className="art-label art-label-three">SECURITY</span>
            </div>
          </div>

          <div className="blog-hero-bottom">
            <span>Technology insight for business and engineering teams.</span>
            <span>Enterprise cloud. Built for Nigeria.</span>
          </div>
        </div>
      </section>

      <section className="blog-featured-section">
        <div className="blog-container">
          <div className="blog-section-heading">
            <div>
              <span className="blog-kicker">EDITOR'S PICKS</span>
              <h2>Start with the essentials.</h2>
            </div>
            <p>
              Explore foundational topics for planning and understanding
              enterprise cloud infrastructure.
            </p>
          </div>

          <div className="blog-featured-grid">
            {[featuredArticle, secondaryFeaturedArticle].map(
              (article, index) => (
                <article
                  className={`blog-feature-card blog-feature-card-${index + 1}`}
                  key={article.id}
                >
                  <div className="feature-card-top">
                    <span className="blog-category-label">
                      {article.category}
                    </span>
                    <span className="feature-card-number">0{index + 1}</span>
                  </div>

                  <div className="feature-card-visual">
                    <div className="feature-visual-circle circle-one" />
                    <div className="feature-visual-circle circle-two" />
                    <div className="feature-visual-icon">
                      <ArticleIcon name={article.icon} />
                    </div>
                    <span className="feature-visual-caption">
                      OPEX CLOUD / FIELD NOTES
                    </span>
                  </div>

                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>

                  <div className="feature-card-footer">
                    <span>{article.readTime}</span>
                    <span className="blog-coming-soon">Coming soon</span>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <section className="blog-library-section" id="latest-articles">
        <div className="blog-container">
          <div className="blog-section-heading">
            <div>
              <span className="blog-kicker">THE OPEX CLOUD BLOG</span>
              <h2>Explore the latest thinking.</h2>
            </div>
            <p>
              Browse topics relevant to your infrastructure, technical planning,
              and cloud journey.
            </p>
          </div>

          <div className="blog-controls">
            <div className="blog-filters" aria-label="Filter blog articles">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`blog-filter ${
                    activeCategory === category ? "active" : ""
                  }`}
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="blog-search">
              <ArticleIcon name="cloud" />
              <span className="sr-only">Search blog articles</span>
              <input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <kbd>/</kbd>
            </label>
          </div>

          <div className="blog-results-count" aria-live="polite">
            {filteredArticles.length}{" "}
            {filteredArticles.length === 1 ? "article" : "articles"}
          </div>

          {filteredArticles.length > 0 ? (
            <div className="blog-article-grid">
              {filteredArticles.map((article) => (
                <article className="blog-article-card" key={article.id}>
                  <div className="article-card-top">
                    <div className="article-icon">
                      <ArticleIcon name={article.icon} />
                    </div>
                    <span className="blog-category-label">
                      {article.category}
                    </span>
                  </div>

                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>

                  <div className="article-card-footer">
                    <span>{article.readTime}</span>
                    <span className="blog-coming-soon">Coming soon</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="blog-empty-state">
              <div className="empty-state-icon">
                <ArticleIcon name="cloud" />
              </div>
              <h3>No articles found</h3>
              <p>Try another search term or select a different category.</p>
              <button
                type="button"
                className="blog-reset-button"
                onClick={() => {
                  setActiveCategory("All articles");
                  setSearchQuery("");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="blog-cta-section">
        <div className="blog-container">
          <div className="blog-cta">
            <div className="blog-cta-icon">
              <ArticleIcon name="cloud" />
            </div>

            <div className="blog-cta-copy">
              <span className="blog-kicker">LET'S TALK INFRASTRUCTURE</span>
              <h2>
                Have a cloud challenge
                <br />
                to work through?
              </h2>
              <p>
                Talk to the OPEX Cloud team about your infrastructure, workload,
                migration, or data requirements.
              </p>
            </div>

            <Link href="/contact" className="blog-cta-button">
              Talk to a Cloud Expert
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .blog-page {
          --navy: #07152f;
          --blue: #3977e8;
          --muted: #63718a;
          --border: #e4e9f1;
          overflow: hidden;
          background: #ffffff;
          color: var(--navy);
          font-family: inherit;
        }

        .blog-container {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        .blog-hero {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid #edf0f5;
          background: radial-gradient(
              ellipse at 83% 46%,
              rgba(57, 119, 232, 0.13),
              transparent 38%
            ),
            linear-gradient(180deg, #f8faff, #ffffff);
        }

        .blog-hero::before {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(106, 136, 184, 0.48) 0.7px,
            transparent 0.7px
          );
          background-size: 24px 24px;
          content: "";
          opacity: 0.2;
          pointer-events: none;
          mask-image: linear-gradient(90deg, transparent, #000);
        }

        .blog-hero .blog-container {
          position: relative;
          z-index: 1;
        }

        .blog-eyebrow,
        .blog-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #687993;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .blog-eyebrow {
          padding-top: 62px;
        }

        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--blue);
          box-shadow: 0 0 0 4px rgba(57, 119, 232, 0.1);
        }

        .blog-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 30px;
          min-height: 495px;
          padding: 32px 0 42px;
        }

        .blog-hero-copy h1 {
          margin: 0;
          font-size: clamp(45px, 6vw, 76px);
          font-weight: 760;
          letter-spacing: -0.075em;
          line-height: 0.99;
        }

        .blog-hero-copy h1 span {
          color: var(--blue);
        }

        .blog-hero-copy p {
          max-width: 505px;
          margin: 24px 0 28px;
          color: #596a84;
          font-size: 14px;
          line-height: 1.9;
        }

        .blog-primary-button,
        .blog-cta-button {
          display: inline-flex;
          min-height: 49px;
          align-items: center;
          justify-content: center;
          gap: 22px;
          padding: 0 21px;
          border: 1px solid var(--navy);
          border-radius: 999px;
          background: var(--navy);
          color: #ffffff;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
          transition: transform 180ms ease, background 180ms ease,
            box-shadow 180ms ease;
        }

        .blog-primary-button:hover,
        .blog-cta-button:hover {
          transform: translateY(-2px);
          background: #10264b;
          box-shadow: 0 10px 25px rgba(7, 21, 47, 0.15);
        }

        .blog-primary-button:focus-visible,
        .blog-cta-button:focus-visible,
        .blog-filter:focus-visible,
        .blog-reset-button:focus-visible {
          outline: 3px solid rgba(57, 119, 232, 0.45);
          outline-offset: 4px;
        }

        .blog-hero-art {
          position: relative;
          width: min(100%, 425px);
          aspect-ratio: 1;
          margin: 0 auto;
        }

        .art-grid {
          position: absolute;
          inset: 8%;
          background-image: linear-gradient(
              rgba(57, 119, 232, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(57, 119, 232, 0.06) 1px,
              transparent 1px
            );
          background-size: 24px 24px;
          mask-image: radial-gradient(circle, #000, transparent 72%);
        }

        .art-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px solid rgba(57, 119, 232, 0.19);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .ring-one {
          width: 42%;
          height: 42%;
        }

        .ring-two {
          width: 67%;
          height: 67%;
        }

        .ring-three {
          width: 92%;
          height: 92%;
          border-style: dashed;
        }

        .art-center {
          position: absolute;
          top: 50%;
          left: 50%;
          display: grid;
          width: 104px;
          height: 104px;
          place-items: center;
          border: 1px solid #dbe6fa;
          border-radius: 30px;
          background: linear-gradient(145deg, #ffffff, #edf4ff);
          color: var(--blue);
          box-shadow: 0 20px 55px rgba(39, 86, 161, 0.13);
          transform: translate(-50%, -50%);
        }

        .art-center :global(svg) {
          width: 42px;
          height: 42px;
        }

        .art-node {
          position: absolute;
          display: grid;
          width: 54px;
          height: 54px;
          place-items: center;
          border: 1px solid #e0e8f5;
          border-radius: 17px;
          background: #ffffff;
          color: var(--blue);
          box-shadow: 0 12px 30px rgba(7, 21, 47, 0.08);
        }

        .art-node :global(svg) {
          width: 23px;
          height: 23px;
        }

        .art-node-one {
          top: 13%;
          left: 48%;
        }

        .art-node-two {
          right: 8%;
          bottom: 26%;
        }

        .art-node-three {
          bottom: 12%;
          left: 20%;
        }

        .art-label {
          position: absolute;
          color: #7b8da8;
          font-size: 8px;
          font-weight: 750;
          letter-spacing: 0.12em;
        }

        .art-label-one {
          top: 10%;
          right: 4%;
        }

        .art-label-two {
          right: 0;
          bottom: 17%;
        }

        .art-label-three {
          bottom: 4%;
          left: 9%;
        }

        .blog-hero-bottom {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 19px 0;
          border-top: 1px solid #e8edf5;
          color: #7b879b;
          font-size: 10px;
          letter-spacing: 0.03em;
        }

        .blog-featured-section,
        .blog-library-section {
          padding: 88px 0;
        }

        .blog-featured-section {
          background: #ffffff;
        }

        .blog-section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 32px;
        }

        .blog-section-heading h2 {
          margin: 12px 0 0;
          font-size: clamp(30px, 4vw, 43px);
          font-weight: 740;
          letter-spacing: -0.06em;
          line-height: 1.12;
        }

        .blog-section-heading > p {
          max-width: 405px;
          margin: 0 0 2px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.85;
        }

        .blog-featured-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .blog-feature-card {
          display: flex;
          min-width: 0;
          min-height: 455px;
          flex-direction: column;
          padding: 26px;
          border: 1px solid var(--border);
          border-radius: 22px;
          background: #ffffff;
          transition: transform 220ms ease, box-shadow 220ms ease,
            border-color 220ms ease;
        }

        .blog-feature-card-2 {
          background: radial-gradient(
              circle at 100% 0,
              rgba(57, 119, 232, 0.08),
              transparent 38%
            ),
            #f9fbff;
        }

        .feature-card-top,
        .feature-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .blog-category-label {
          color: var(--blue);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .feature-card-number {
          color: #a1adbf;
          font-size: 11px;
        }

        .feature-card-visual {
          position: relative;
          display: grid;
          min-height: 180px;
          flex-shrink: 0;
          place-items: center;
          overflow: hidden;
          margin: 22px 0;
          border: 1px solid #e5ecf7;
          border-radius: 16px;
          background: radial-gradient(
              circle at center,
              rgba(57, 119, 232, 0.12),
              transparent 55%
            ),
            #f6f9ff;
        }

        .feature-visual-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          aspect-ratio: 1;
          border: 1px solid rgba(57, 119, 232, 0.19);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .circle-one {
          width: 130px;
        }

        .circle-two {
          width: 220px;
        }

        .feature-visual-icon {
          position: relative;
          display: grid;
          width: 64px;
          height: 64px;
          place-items: center;
          border: 1px solid #d9e5fa;
          border-radius: 20px;
          background: #ffffff;
          color: var(--blue);
          box-shadow: 0 12px 28px rgba(7, 21, 47, 0.07);
        }

        .feature-visual-icon :global(svg) {
          width: 30px;
          height: 30px;
        }

        .feature-visual-caption {
          position: absolute;
          right: 13px;
          bottom: 12px;
          color: #8796ad;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .blog-feature-card h3,
        .blog-article-card h3 {
          margin: 0;
          font-size: 19px;
          font-weight: 720;
          letter-spacing: -0.04em;
          line-height: 1.4;
        }

        .blog-feature-card > p,
        .blog-article-card > p {
          margin: 10px 0 20px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.85;
        }

        .feature-card-footer {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #e9edf4;
          color: #7b879a;
          font-size: 10px;
        }

        .blog-coming-soon {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #6d7d94;
          font-size: 10px;
          font-weight: 600;
        }

        .blog-coming-soon::before {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a5b5cc;
          content: "";
        }

        .blog-library-section {
          border-top: 1px solid #edf0f5;
          border-bottom: 1px solid #edf0f5;
          background: #f7f9fc;
        }

        .blog-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 32px 0 24px;
        }

        .blog-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .blog-filter {
          min-height: 37px;
          padding: 0 13px;
          border: 1px solid transparent;
          border-radius: 999px;
          background: transparent;
          color: #69778e;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          transition: color 160ms ease, background 160ms ease,
            border-color 160ms ease;
        }

        .blog-filter:hover {
          border-color: #dce4f0;
          color: var(--navy);
        }

        .blog-filter.active {
          border-color: var(--navy);
          background: var(--navy);
          color: #ffffff;
        }

        .blog-search {
          display: flex;
          width: min(100%, 255px);
          min-height: 42px;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #e0e6ef;
          border-radius: 12px;
          background: #ffffff;
          color: #8b9ab0;
        }

        .blog-search :global(svg) {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
        }

        .blog-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--navy);
          font: inherit;
          font-size: 11px;
        }

        .blog-search input::placeholder {
          color: #9aa6b8;
        }

        .blog-search:focus-within {
          border-color: #8db2f5;
          box-shadow: 0 0 0 3px rgba(57, 119, 232, 0.1);
        }

        .blog-search kbd {
          display: grid;
          width: 21px;
          height: 22px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e4e9f1;
          border-radius: 5px;
          background: #f8faff;
          color: #8b9ab0;
          font-size: 10px;
        }

        .blog-results-count {
          margin-bottom: 14px;
          color: #7d899d;
          font-size: 10px;
        }

        .blog-article-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .blog-article-card {
          display: flex;
          min-width: 0;
          min-height: 280px;
          flex-direction: column;
          padding: 23px;
          border: 1px solid #e4e9f1;
          border-radius: 18px;
          background: #ffffff;
          transition: transform 220ms ease, box-shadow 220ms ease,
            border-color 220ms ease;
        }

        .blog-article-card:hover {
          transform: translateY(-4px);
          border-color: #cbdaf1;
          box-shadow: 0 18px 45px rgba(7, 21, 47, 0.06);
        }

        .article-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 22px;
        }

        .article-icon {
          display: grid;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e0eafa;
          border-radius: 14px;
          background: #f1f6ff;
          color: var(--blue);
        }

        .article-icon :global(svg) {
          width: 21px;
          height: 21px;
        }

        .blog-article-card h3 {
          font-size: 17px;
        }

        .blog-article-card > p {
          font-size: 11px;
        }

        .article-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #edf0f5;
          color: #7d899d;
          font-size: 10px;
        }

        .blog-empty-state {
          display: flex;
          min-height: 270px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          border: 1px dashed #d7e0ed;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.65);
          text-align: center;
        }

        .empty-state-icon {
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          margin-bottom: 16px;
          border-radius: 15px;
          background: #edf4ff;
          color: var(--blue);
        }

        .empty-state-icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .blog-empty-state h3 {
          margin: 0;
          font-size: 19px;
          letter-spacing: -0.04em;
        }

        .blog-empty-state p {
          margin: 9px 0 20px;
          color: var(--muted);
          font-size: 12px;
        }

        .blog-reset-button {
          padding: 10px 16px;
          border: 1px solid #d9e2f0;
          border-radius: 999px;
          background: #ffffff;
          color: var(--navy);
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 650;
        }

        .blog-cta-section {
          padding: 78px 0;
          background: #ffffff;
        }

        .blog-cta {
          position: relative;
          display: flex;
          align-items: center;
          gap: 27px;
          overflow: hidden;
          padding: 43px;
          border: 1px solid #1c3459;
          border-radius: 25px;
          background: radial-gradient(
              circle at 95% 0,
              rgba(57, 119, 232, 0.24),
              transparent 34%
            ),
            #07152f;
          color: #ffffff;
        }

        .blog-cta-icon {
          display: grid;
          width: 62px;
          height: 62px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 19px;
          background: rgba(255, 255, 255, 0.07);
          color: #9fc0ff;
        }

        .blog-cta-icon :global(svg) {
          width: 30px;
          height: 30px;
        }

        .blog-cta-copy {
          flex: 1;
        }

        .blog-cta .blog-kicker {
          color: #9db7df;
        }

        .blog-cta-copy h2 {
          margin: 12px 0;
          font-size: clamp(27px, 3.5vw, 39px);
          font-weight: 740;
          letter-spacing: -0.06em;
          line-height: 1.12;
        }

        .blog-cta-copy p {
          max-width: 470px;
          margin: 0;
          color: #c0cde0;
          font-size: 12px;
          line-height: 1.85;
        }

        .blog-cta-button {
          flex-shrink: 0;
          border-color: #ffffff;
          background: #ffffff;
          color: var(--navy);
        }

        .blog-cta-button:hover {
          border-color: #dce8ff;
          background: #dce8ff;
          color: var(--navy);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          clip-path: inset(50%);
        }

        @media (max-width: 900px) {
          .blog-hero-grid {
            grid-template-columns: 1fr 0.8fr;
            gap: 10px;
          }

          .blog-hero-copy h1 {
            font-size: clamp(43px, 7vw, 62px);
          }

          .blog-controls {
            align-items: flex-start;
            flex-direction: column;
          }

          .blog-search {
            width: 100%;
          }

          .blog-article-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .blog-cta {
            flex-wrap: wrap;
          }

          .blog-cta-button {
            margin-left: 89px;
          }
        }

        @media (max-width: 600px) {
          .blog-container {
            width: min(100% - 36px, 480px);
          }

          .blog-eyebrow {
            padding-top: 39px;
          }

          .blog-hero-grid {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 38px 0 20px;
          }

          .blog-hero-copy h1 {
            font-size: clamp(43px, 12vw, 60px);
          }

          .blog-hero-copy p {
            margin: 20px 0 23px;
            font-size: 13px;
            line-height: 1.8;
          }

          .blog-hero-art {
            width: min(100%, 310px);
            margin-top: 15px;
          }

          .art-center {
            width: 82px;
            height: 82px;
            border-radius: 24px;
          }

          .art-node {
            width: 45px;
            height: 45px;
            border-radius: 14px;
          }

          .blog-hero-bottom {
            flex-direction: column;
            gap: 8px;
            font-size: 9px;
          }

          .blog-featured-section,
          .blog-library-section {
            padding: 62px 0;
          }

          .blog-section-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 25px;
          }

          .blog-section-heading h2 {
            font-size: 34px;
          }

          .blog-section-heading > p {
            font-size: 12px;
          }

          .blog-featured-grid,
          .blog-article-grid {
            grid-template-columns: 1fr;
          }

          .blog-feature-card {
            min-height: 420px;
            padding: 22px;
          }

          .feature-card-visual {
            min-height: 160px;
          }

          .blog-filters {
            gap: 6px;
          }

          .blog-filter {
            min-height: 35px;
            padding: 0 10px;
            font-size: 10px;
          }

          .blog-article-card {
            min-height: 250px;
          }

          .blog-cta-section {
            padding: 55px 0;
          }

          .blog-cta {
            align-items: flex-start;
            flex-direction: column;
            gap: 22px;
            padding: 27px 23px;
            border-radius: 21px;
          }

          .blog-cta-icon {
            width: 52px;
            height: 52px;
          }

          .blog-cta-copy h2 {
            font-size: 32px;
          }

          .blog-cta-button {
            width: 100%;
            margin-left: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
