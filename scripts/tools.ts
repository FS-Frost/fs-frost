// Shared access to mai-tools' tools.json for the scripts in this folder.

export const defaultSource = "https://fs-frost.github.io/mai-tools/tools.json";
export const maiToolsUrl = "https://fs-frost.github.io/mai-tools/";

export type Locale = "en" | "es";

export type LocalizedText = string | { en: string; es: string };

export type Tool = {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    category: string;
    href: string;
    external: boolean;
    stack: string[];
    /** GitHub repo name under FS-Frost; absent for tools that live inside mai-tools. */
    repo?: string;
    topics?: string[];
};

/** Loads tools.json from a URL or a local path (e.g. ../mai-tools/static/tools.json). */
export async function loadTools(source: string): Promise<Tool[]> {
    if (source.startsWith("http")) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`GET ${source} failed: ${response.status}`);
        }

        return response.json();
    }

    return Bun.file(source).json();
}

export function localize(text: LocalizedText, locale: Locale): string {
    return typeof text === "string" ? text : text[locale];
}
