// Vercel Serverless Function — Load data from GitHub repo
module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return res.status(500).json({ error: "Server not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO in Vercel env vars." });
    }

    try {
        const ghRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
        );
        if (ghRes.status === 404) return res.json({ data: null, sha: null });
        if (!ghRes.ok) throw new Error(`GitHub API error: ${ghRes.status}`);

        const file = await ghRes.json();
        const content = Buffer.from(file.content, "base64").toString("utf8");
        return res.json({ data: JSON.parse(content), sha: file.sha });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
