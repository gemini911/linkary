'use client';

import { useState, useEffect } from 'react';
import styles from '../app/page.module.css';
import AddSiteModal from './AddSiteModal';

interface Tool {
    id: number;
    name: string;
    url: string;
    tags: string[];
    logo?: string;
    category: string;
    description?: string;
}

interface DashboardClientProps {
    initialTools: Tool[];
    supabaseUrl: string;
    supabaseKey: string;
}

export default function DashboardClient({ initialTools, supabaseUrl, supabaseKey }: DashboardClientProps) {
    const [tools, setTools] = useState(initialTools);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.body.setAttribute('data-theme', savedTheme);

        // 管理员模式逻辑：通过 URL 参数 ?admin=true 激活
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('admin') === 'true') {
            localStorage.setItem('isAdmin', 'true');
            setIsAdmin(true);
        } else if (queryParams.get('admin') === 'false') {
            localStorage.removeItem('isAdmin');
            setIsAdmin(false);
        } else {
            setIsAdmin(localStorage.getItem('isAdmin') === 'true');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };


    const categories = ['All', ...Array.from(new Set(tools.map((tool) => tool.category || 'Uncategorized')))];

    const filteredTools = activeCategory === 'All'
        ? tools
        : tools.filter(tool => (tool.category || 'Uncategorized') === activeCategory);

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.heroMeta}>Fast Design Directory</div>
                    <h1 className={styles.title}>Tools for designers who move fast.</h1>
                    <p className={styles.subtitle}>
                        A curated launchpad for design, product, and creative work.
                    </p>
                    {isAdmin && (
                        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                            + Add Tool
                        </button>
                    )}
                </section>

                <section className={styles.library} aria-label="Tool library">
                    <div className={styles.tabs} role="tablist" aria-label="Filter tools by category">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={activeCategory === category}
                                onClick={() => setActiveCategory(category)}
                                className={`${styles.tab} ${activeCategory === category ? styles.activeTab : ''}`}
                            >
                                <span>{category}</span>
                                <span className={styles.tabCount}>
                                    {category === 'All'
                                        ? tools.length
                                        : tools.filter(tool => (tool.category || 'Uncategorized') === category).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    <AddSiteModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAdd={(newTool) => setTools([newTool, ...tools])}
                        supabaseUrl={supabaseUrl}
                        supabaseKey={supabaseKey}
                    />

                    <section className={styles.section}>
                        <div className={styles.categoryHeader}>
                            <div>
                                <h2 className={styles.categoryTitle}>
                                    {activeCategory === 'All' ? 'All tools' : activeCategory}
                                </h2>
                                <p className={styles.categorySubtitle}>
                                    {filteredTools.length} {filteredTools.length === 1 ? 'resource' : 'resources'} ready to open.
                                </p>
                            </div>
                        </div>
                        <div className={styles.grid}>
                            {filteredTools.map(tool => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    </section>
                </section>
            </main>

            <button className={styles.themeToggle} onClick={toggleTheme} title="Toggle Theme">
                {theme === 'dark' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                )}
            </button>
        </div>
    );
}

function ToolCard({ tool }: { tool: Tool }) {
    // 智能提取主域名 (e.g., docs.nextjs.org -> nextjs.org)
    const getRootDomain = (urlStr: string) => {
        try {
            const host = new URL(urlStr).hostname;
            const parts = host.split('.');
            if (parts.length > 2) {
                return parts.slice(-2).join('.');
            }
            return host;
        } catch {
            return '';
        }
    };

    const rootDomain = getRootDomain(tool.url);
    // 优先级：1. 数据库 Logo -> 2. Google 高清 Favicon (128px) -> 3. Unavatar 兜底
    const initialIcon = tool.logo || `https://www.google.com/s2/favicons?domain=${rootDomain}&sz=128`;
    const [imgSrc, setImgSrc] = useState(initialIcon);

    return (
        <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
        >
            <div className={styles.cardHeader}>
                <div className={styles.cardImageWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imgSrc}
                        alt={tool.name}
                        width={24}
                        height={24}
                        className={styles.cardImage}
                        onError={() => {
                            if (imgSrc.includes('google.com')) {
                                // 如果 Google 没加载出来（如某些内网或被屏蔽站点），尝试 Unavatar
                                setImgSrc(`https://unavatar.io/${rootDomain}`);
                            } else if (imgSrc.includes('unavatar.io')) {
                                // 如果 Unavatar 也失败，使用本地兜底
                                setImgSrc('/earth-fill.png?v=2');
                            }
                        }}
                    />
                </div>
                <h3 className={styles.cardTitle}>{tool.name}</h3>
            </div>
            <p className={styles.description}>
                {tool.description || 'No description provided for this tool.'}
            </p>
            <div className={styles.tags}>
                {tool.tags?.map((tag) => (
                    <span key={tag} className={styles.tag}>
                        {tag}
                    </span>
                ))}
            </div>
        </a>
    );
}
