'use client';

import { useState } from 'react';
import styles from './Modal.module.css';

interface Tool {
    id: number;
    name: string;
    url: string;
    tags: string[];
    logo: string;
    category: string;
    description?: string;
}

interface AddSiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (site: Tool) => void;
    supabaseUrl: string;
    supabaseKey: string;
}

export default function AddSiteModal({ isOpen, onClose, onAdd, supabaseUrl, supabaseKey }: AddSiteModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        category: '',
        tags: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newSite = {
            name: formData.name,
            url: formData.url,
            category: formData.category || 'Uncategorized',
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
            description: formData.description,
            logo: `https://www.google.com/s2/favicons?domain=${new URL(formData.url).hostname}&sz=64`
        };

        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/sites`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(newSite)
            });

            if (response.ok) {
                const data = await response.json();
                onAdd(data[0]);
                onClose();
                setFormData({ name: '', url: '', category: '', tags: '', description: '' });
            }
        } catch (err) {
            console.error('Error adding site:', err);
            alert('Failed to add site. Check your Supabase configuration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 className={styles.title}>Add New Tool</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label>Name</label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. ChatGPT"
                        />
                    </div>
                    <div className={styles.group}>
                        <label>URL</label>
                        <input
                            required
                            type="url"
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className={styles.group}>
                        <label>Category</label>
                        <input
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g. AI, Development"
                        />
                    </div>
                    <div className={styles.group}>
                        <label>Tags (comma separated)</label>
                        <input
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="chat, llm"
                        />
                    </div>
                    <div className={styles.group}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                            {loading ? 'Adding...' : 'Add Tool'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
