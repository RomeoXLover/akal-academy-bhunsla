// Vercel Serverless Function — Save data to GitHub repo
module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).end();

    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return res.status(500).json({ error: "Server not configured." });
    }

    const { data, sha } = req.body;
    if (!data) return res.status(400).json({ error: "No data provided." });

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
    const body = { message: "Update school data", content, ...(sha ? { sha } : {}) };

    try {
        const ghRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`,
            {
                method: "PUT",
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );
        if (!ghRes.ok) {
            const err = await ghRes.json();
            throw new Error(err.message || `GitHub API error: ${ghRes.status}`);
        }
        const result = await ghRes.json();
        return res.json({ ok: true, sha: result.content?.sha });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
