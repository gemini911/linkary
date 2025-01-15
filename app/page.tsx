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
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://linkary-puce.vercel.app";
    console.log("Fetching tools from:", baseUrl);
    console.log("Full API URL:", `${baseUrl}/api/sites`);

    const res = await fetch(`${baseUrl}/api/sites`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API Response Status:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to fetch tools: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("API Response Data:", data);

    // 确保数据格式正确
    if (!data || !Array.isArray(data.tools)) {
      throw new Error("Invalid tools data format");
    }

    // 添加默认分类
    const toolsWithCategory = data.tools.map((tool: Tool) => ({
      ...tool,
      category: tool.category || "未分类",
    }));

    return { tools: toolsWithCategory };
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
      <div className={styles.header}>{/* 未来放置 logo 和关联插件按钮 */}</div>
      <div className={styles.main}>
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
