import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';

interface HubertInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	disabled?: boolean;
	placeholder?: string;
}

export interface HubertInputHandle {
	focus: () => void;
}

/**
 * Auto-resizing textarea input for Hubert chat.
 * Uses a clean CSS-based approach with proper state management.
 */
const HubertInput = forwardRef<HubertInputHandle, HubertInputProps>(
	({ value, onChange, onSubmit, disabled = false, placeholder = "Type a message..." }, ref) => {
		const textareaRef = useRef<HTMLTextAreaElement>(null);
		const [isMultiline, setIsMultiline] = useState(false);

		useImperativeHandle(ref, () => ({
			focus: () => textareaRef.current?.focus(),
		}));

		// Adjust textarea height based on content
		const adjustHeight = useCallback(() => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			// Reset to auto to get accurate scrollHeight
			textarea.style.height = 'auto';

			// Get the natural content height
			const scrollHeight = textarea.scrollHeight;

			// Clamp between min (44px) and max (200px)
			const minHeight = 44;
			const maxHeight = 200;
			const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));

			textarea.style.height = `${newHeight}px`;

			// Update multiline state (threshold at ~1.5 lines)
			setIsMultiline(newHeight > 52);
		}, []);

		// Adjust height whenever value changes
		useEffect(() => {
			adjustHeight();
		}, [value, adjustHeight]);

		// Also adjust on window resize
		useEffect(() => {
			window.addEventListener('resize', adjustHeight);
			return () => window.removeEventListener('resize', adjustHeight);
		}, [adjustHeight]);

		const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				if (!disabled && value.trim()) {
					onSubmit();
				}
			}
		};

		return (
			<div
				className={`hubert-input-wrapper relative bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] focus-within:border-[var(--theme-border-strong)] transition-all duration-200 ease-out ${
					isMultiline ? 'p-4 rounded-[28px]' : 'flex items-center px-6 py-2 rounded-full'
				}`}
			>
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					aria-label="Type your message"
					rows={1}
					className={`bg-transparent text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-subtle)] text-base outline-none resize-none overflow-hidden ${
						isMultiline
							? 'w-full leading-relaxed px-2'
							: 'flex-1 leading-normal'
					}`}
					style={{
						minHeight: '24px',
					}}
				/>

				<div className={`transition-all duration-150 ${isMultiline ? 'flex justify-end mt-3' : 'ml-3 flex-shrink-0'}`}>
					<button
						type="button"
						onClick={onSubmit}
						disabled={disabled || !value.trim()}
						aria-label="Send message"
						className="w-10 h-10 rounded-full bg-[var(--theme-text-primary)] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-[var(--theme-bg-primary)]"
						>
							<path d="M12 19V5M5 12l7-7 7 7"/>
						</svg>
					</button>
				</div>
			</div>
		);
	}
);

HubertInput.displayName = 'HubertInput';

export default HubertInput;
