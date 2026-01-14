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

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };


    const categories = ['All', ...Array.from(new Set(initialTools.map((tool) => tool.category || 'Uncategorized')))];

    const filteredTools = activeCategory === 'All'
        ? tools
        : tools.filter(tool => (tool.category || 'Uncategorized') === activeCategory);

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Categories</div>
                <nav className={styles.nav}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`${styles.navLink} ${activeCategory === category ? styles.activeNavLink : ''}`}
                        >
                            {category}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Tools for UI/UX desinger</h1>
                        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Your personal toolkit managed on Supabase</p>
                    </div>
                    <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                        + Add Tool
                    </button>
                </header>

                <AddSiteModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(newTool) => setTools([newTool, ...tools])}
                    supabaseUrl={supabaseUrl}
                    supabaseKey={supabaseKey}
                />

                {activeCategory === 'All' ? (
                    // Group by category when in 'All' view
                    Array.from(new Set(tools.map(t => t.category || 'Uncategorized'))).map(category => (
                        <section key={category} className={styles.section}>
                            <div className={styles.categoryHeader}>
                                <h2 className={styles.categoryTitle}>{category}</h2>
                                <div className={styles.categoryLine} />
                            </div>
                            <div className={styles.grid}>
                                {tools
                                    .filter(tool => (tool.category || 'Uncategorized') === category)
                                    .map(tool => (
                                        <ToolCard key={tool.id} tool={tool} />
                                    ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <section className={styles.section}>
                        <div className={styles.categoryHeader}>
                            <h2 className={styles.categoryTitle}>{activeCategory}</h2>
                            <div className={styles.categoryLine} />
                        </div>
                        <div className={styles.grid}>
                            {filteredTools.map(tool => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    </section>
                )}
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
    // 优先级：1. 数据库手动上传的 logo -> 2. Clearbit 高清 Logo 服务 -> 3. 本地高清默认图 (带版本号避开缓存)
    // 移除 Google 服务，因为它在找不到图标时会返回一个极度模糊的默认地球，导致无法触发 onError
    const initialIcon = tool.logo ||
        `https://logo.clearbit.com/${rootDomain}`;

    const [imgSrc, setImgSrc] = useState(initialIcon || '/earth-fill.png?v=1');

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
                        src={imgSrc || '/earth-fill.png?v=1'}
                        alt={tool.name}
                        width={24}
                        height={24}
                        className={styles.cardImage}
                        onError={() => {
                            // 如果 initialIcon 加载失败（不论是手动 logo 还是 Clearbit），直接退回到本地高清图
                            if (imgSrc !== '/earth-fill.png?v=1') {
                                setImgSrc('/earth-fill.png?v=1');
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
