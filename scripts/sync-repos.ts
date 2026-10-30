// Syncs each tool's GitHub repo metadata from mai-tools' tools.json:
//   - description: the English description (overwritten when different)
//   - homepage:    the tool's site, or mai-tools for CLIs/libraries (only set when empty)
//   - topics:      tools.json topics added to the repo (existing topics are never removed)
//
// Runs locally with your `gh` session; dry-run unless --apply is passed.
//
// Usage:
//   bun scripts/sync-repos.ts                                          # dry-run, published JSON
//   bun scripts/sync-repos.ts --apply                                  # apply changes
//   bun scripts/sync-repos.ts ../mai-tools/static/tools.json [--apply] # local checkout

import { defaultSource, loadTools, localize, maiToolsUrl, type Tool } from "./tools.ts";

const owner = "FS-Frost";

type RepoInfo = {
    description: string;
    homepageUrl: string;
    repositoryTopics: { name: string }[] | null;
};

function gh(args: string[]): string {
    const result = Bun.spawnSync(["gh", ...args]);
    if (result.exitCode !== 0) {
        throw new Error(`gh ${args.join(" ")} failed: ${result.stderr.toString().trim()}`);
    }

    return result.stdout.toString();
}

function homepage(tool: Tool): string {
    const url = new URL(tool.href, maiToolsUrl);
    return tool.external && url.hostname === "fs-frost.github.io" ? tool.href : maiToolsUrl;
}

const args = Bun.argv.slice(2);
const apply = args.includes("--apply");
const source = args.find((arg) => !arg.startsWith("--")) ?? defaultSource;
const tools = (await loadTools(source)).filter((tool) => tool.repo !== undefined);

let pending = 0;
for (const tool of tools) {
    const repo = `${owner}/${tool.repo}`;
    const info: RepoInfo = JSON.parse(gh(["repo", "view", repo, "--json", "description,homepageUrl,repositoryTopics"]));
    const currentTopics = (info.repositoryTopics ?? []).map((topic) => topic.name);

    const edit: string[] = [];
    const changes: string[] = [];

    const description = localize(tool.description, "en");
    if (info.description !== description) {
        edit.push("--description", description);
        changes.push(`description: "${info.description}" -> "${description}"`);
    }

    if (info.homepageUrl === "" || info.homepageUrl === null) {
        edit.push("--homepage", homepage(tool));
        changes.push(`homepage: (empty) -> ${homepage(tool)}`);
    }

    const newTopics = (tool.topics ?? []).filter((topic) => !currentTopics.includes(topic));
    if (newTopics.length > 0) {
        edit.push("--add-topic", newTopics.join(","));
        changes.push(`topics: +${newTopics.join(", +")}`);
    }

    if (edit.length === 0) {
        console.log(`= ${repo}`);
        continue;
    }

    pending++;
    console.log(`~ ${repo}`);
    for (const change of changes) {
        console.log(`    ${change}`);
    }

    if (apply) {
        gh(["repo", "edit", repo, ...edit]);
    }
}

console.log(apply ? `\nApplied changes to ${pending} repos.` : `\n${pending} repos would change. Re-run with --apply.`);
