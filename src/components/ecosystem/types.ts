export type FileCategory =
	| 'journal'
	| 'experiments'
	| 'art'
	| 'messages'
	| 'story'
	| 'reflections'
	| 'research'
	| 'ideas'
	| 'program_garden'
	| 'projects'
	| 'root';

export interface EcosystemFile {
	id: string;
	filename: string;
	path: string;
	category: FileCategory;
	day: number;
	size: number;
	extension: string;
	title?: string;
	contentUrl?: string;
}

export interface DayData {
	day: number;
	files: EcosystemFile[];
	totalSize: number;
	categories: FileCategory[];
}

export interface EcosystemManifest {
	generatedAt: string;
	totalFiles: number;
	totalSize: number;
	days: DayData[];
	categories: Record<FileCategory, number>;
	stats: {
		wordCount: number;
		codeLines: number;
		imageCount: number;
	};
}

export interface ViewerFile extends EcosystemFile {
	content?: string;
	isLoading?: boolean;
	error?: string;
}

export type ViewState = 'timeline' | 'file-viewer';
