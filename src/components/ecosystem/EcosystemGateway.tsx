import React, { useState, useEffect } from 'react';
import type { EcosystemManifest } from './types';
import { EcosystemExplorer } from './EcosystemExplorer';

const MANIFEST_URL = '/ecosystem-manifest.json';

export default function EcosystemGateway() {
	const [manifest, setManifest] = useState<EcosystemManifest | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isExplorerOpen, setIsExplorerOpen] = useState(false);

	useEffect(() => {
		fetch(MANIFEST_URL)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to load manifest');
				return res.json();
			})
			.then((data: EcosystemManifest) => {
				setManifest(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

	// Prevent body scroll when explorer is open
	useEffect(() => {
		if (isExplorerOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isExplorerOpen]);

	if (loading) {
		return (
			<div className="gateway">
				<div className="gateway-loading">
					<div className="spinner" />
					<span>Loading archive data...</span>
				</div>
				<style>{gatewayStyles}</style>
			</div>
		);
	}

	if (error || !manifest) {
		return (
			<div className="gateway">
				<div className="gateway-error">
					<span>Failed to load archive</span>
				</div>
				<style>{gatewayStyles}</style>
			</div>
		);
	}

	return (
		<>
			<div className="gateway">
				<div className="gateway-content">
					<div className="gateway-header">
						<h3 className="gateway-title">Ecosystem Archive</h3>
						<p className="gateway-description">
							Explore the complete collection of artifacts from the 30-day experiment
						</p>
					</div>

					<div className="gateway-stats">
						<div className="stat">
							<span className="stat-value">{manifest.totalFiles}</span>
							<span className="stat-label">files</span>
						</div>
						<div className="stat">
							<span className="stat-value">30</span>
							<span className="stat-label">days</span>
						</div>
						<div className="stat">
							<span className="stat-value">{manifest.stats.wordCount.toLocaleString()}</span>
							<span className="stat-label">words</span>
						</div>
					</div>

					<div className="gateway-actions">
						<button className="explore-button" onClick={() => setIsExplorerOpen(true)}>
							<span>Enter Archive</span>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</button>
						<a href="/ecosystem.zip" download className="download-link">
							Download All
						</a>
					</div>
				</div>

				{/* Preview dots showing timeline */}
				<div className="gateway-preview">
					{Array.from({ length: 30 }, (_, i) => {
						const day = manifest.days.find((d) => d.day === i + 1);
						const hasFiles = day && day.files.length > 0;
						return (
							<div
								key={i}
								className={`preview-dot ${hasFiles ? 'active' : ''}`}
								title={`Day ${i + 1}: ${day?.files.length || 0} files`}
							/>
						);
					})}
				</div>

				<style>{gatewayStyles}</style>
			</div>

			{isExplorerOpen && (
				<EcosystemExplorer manifest={manifest} onClose={() => setIsExplorerOpen(false)} />
			)}
		</>
	);
}

const gatewayStyles = `
	.gateway {
		background: var(--theme-bg-secondary);
		border: 1px solid var(--theme-border-primary);
		border-radius: 12px;
		padding: 2rem;
		margin: 2rem 0;
	}

	.gateway-loading,
	.gateway-error {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		color: var(--theme-text-muted);
	}

	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--theme-border-primary);
		border-top-color: var(--color-brand-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.gateway-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.gateway-header {
		text-align: center;
	}

	.gateway-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--theme-text-primary);
		margin: 0 0 0.5rem 0;
	}

	.gateway-description {
		color: var(--theme-text-muted);
		font-size: 0.9375rem;
		margin: 0;
	}

	.gateway-stats {
		display: flex;
		justify-content: center;
		gap: 3rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 600;
		color: var(--theme-text-primary);
	}

	.stat-label {
		font-size: 0.8125rem;
		color: var(--theme-text-muted);
		text-transform: lowercase;
	}

	.gateway-actions {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
	}

	.explore-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.75rem;
		background: var(--color-brand-accent);
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.explore-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 184, 76, 0.3);
	}

	.download-link {
		color: var(--theme-text-secondary);
		font-size: 0.875rem;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.download-link:hover {
		color: var(--color-brand-accent);
	}

	.gateway-preview {
		display: flex;
		justify-content: center;
		gap: 6px;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--theme-border-primary);
	}

	.preview-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--theme-border-secondary);
		transition: background 0.2s ease;
	}

	.preview-dot.active {
		background: var(--theme-text-muted);
	}

	@media (max-width: 640px) {
		.gateway {
			padding: 1.5rem;
		}

		.gateway-stats {
			gap: 2rem;
		}

		.stat-value {
			font-size: 1.5rem;
		}

		.gateway-actions {
			flex-direction: column;
			gap: 1rem;
		}

		.explore-button {
			width: 100%;
			justify-content: center;
		}

		.gateway-preview {
			flex-wrap: wrap;
			gap: 4px;
		}

		.preview-dot {
			width: 6px;
			height: 6px;
		}
	}
`;
