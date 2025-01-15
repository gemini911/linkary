import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

interface Tool {
  name: string;
  url: string;
  tags: string[];
  logo: string;
  category: string;
}

interface ToolsResponse {
  tools: Tool[];
}

async function getTools(): Promise<ToolsResponse> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/sites`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch tools");
    }

    const data = await res.json();
    return data || { tools: [] };
  } catch (error) {
    console.error("Error fetching tools:", error);
    return { tools: [] };
  }
}

export default async function Home() {
  const data = await getTools();
  const tools = data?.tools || [];

  // 获取所有分类
  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  return (
    <div className={styles.container}>
      {/* 预留区域 */}
      <div className={styles.header}>{/* 未来放置 logo 和关联插件按钮 */}</div>
      <div className={styles.main}>
        {/* 左侧分类导航 */}
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>分类</h2>
          <nav className={styles.nav}>
            {categories.map((category) => (
              <Link
                key={category}
                href={`#${category}`}
                className={styles.navLink}
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>

        {/* 右侧内容区域 */}
        <div className={styles.content}>
          <h1 className={styles.title}>工具导航</h1>

          {categories.map((category) => (
            <section key={category} id={category} className={styles.section}>
              <div className={styles.categoryTitle}>{category}</div>
              <div className={`${styles.grid} ${styles.gridCols1}`}>
                {tools
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.card}
                    >
                      <div className={styles.cardHeader}>
                        <Image
                          src={tool.logo}
                          alt={tool.name}
                          width={32}
                          height={32}
                          className={styles.cardImage}
                        />
                        <h3 className={styles.cardTitle}>{tool.name}</h3>
                      </div>
                      <div className={styles.tags}>
                        {tool.tags.map((tag: string) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
