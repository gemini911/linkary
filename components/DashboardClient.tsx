'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../app/page.module.css';
import AddSiteModal from './AddSiteModal';

interface Tool {
    id: number;
    name: string;
    url: string;
    tags: string[];
    logo: string;
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
                        <h1 className={styles.title}>Tool Navigator</h1>
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
        </div>
    );
}

function ToolCard({ tool }: { tool: Tool }) {
    const [error, setError] = useState(false);
    const faviconUrl = tool.logo || `https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=64`;

    return (
        <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
        >
            <div className={styles.cardHeader}>
                <div className={styles.cardImageWrapper}>
                    <img
                        src={error ? '/default-favicon.png' : faviconUrl}
                        alt={tool.name}
                        width={24}
                        height={24}
                        className={styles.cardImage}
                        onError={() => setError(true)}
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
