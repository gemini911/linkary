'use client';

import { useState } from 'react';
import styles from './Modal.module.css';

interface SubmitToolModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubmitToolModal({ isOpen, onClose }: SubmitToolModalProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        category: '',
        description: '',
    });

    if (!isOpen) return null;

    const resetForm = () => {
        setFormData({ name: '', url: '', category: '', description: '' });
        setMessage('');
        setIsSuccess(false);
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        setIsSuccess(false);

        try {
            const response = await fetch('/api/tool-submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    url: formData.url,
                    category: formData.category,
                    description: formData.description,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Submission failed');
            }

            setMessage('提交成功，感谢分享。我会尽快查看这个工具。');
            setIsSuccess(true);
            setFormData({ name: '', url: '', category: '', description: '' });
        } catch (error) {
            console.error('Submit tool failed:', error);
            setMessage(error instanceof Error ? error.message : 'Submission failed');
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <h2 className={styles.title}>Submit new tools</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label>Tool Name</label>
                        <input
                            required
                            value={formData.name}
                            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                            placeholder="e.g. TradingView"
                        />
                    </div>
                    <div className={styles.group}>
                        <label>URL</label>
                        <input
                            required
                            type="url"
                            value={formData.url}
                            onChange={(event) => setFormData({ ...formData, url: event.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className={styles.group}>
                        <label>Category</label>
                        <input
                            value={formData.category}
                            onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                            placeholder="e.g. 金融Skills"
                        />
                    </div>
                    <div className={styles.group}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                            rows={3}
                            placeholder="What is this tool useful for?"
                        />
                    </div>
                    {message && (
                        <p className={`${styles.message} ${isSuccess ? styles.successMessage : ''}`}>
                            {message}
                        </p>
                    )}
                    <div className={styles.actions}>
                        <button type="button" onClick={handleClose} className={styles.cancelBtn}>
                            取消
                        </button>
                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                            {loading ? 'Submitting...' : '确认'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
