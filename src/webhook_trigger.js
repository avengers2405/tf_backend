import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

import crypto from "crypto";

const verifyGitHubSignature = (req, res, buf) => {
    const signature = req.headers["x-hub-signature-256"];
    if (!signature) throw new Error("Missing signature");


    const hmac = crypto.createHmac("sha256", process.env.GITHUB_SECRET);
    const digest = "sha256=" + hmac.update(buf).digest("hex");

    if (signature !== digest) {
        throw new Error("Invalid GitHub webhook signature");
    }
    console.log("GitHub webhook signature verified");
};

app.use(express.json({
    verify: verifyGitHubSignature
}));

const logbookMemory = []; 

// Extract project_id from commit message
// Example: [PROJECT:101] Added login
function extractProjectId(message) {
    const match = message.match(/\[PROJECT:(.*?)\]/);
    return match ? match[1] : null;
}

// Difficulty calculation
function calculateDifficulty(additions, deletions, filesChanged) {
    const score = additions + deletions + filesChanged * 5;

    if (score < 20) return 0; // easy
    if (score < 100) return 1; // medium
    return 2; // hard
}

async function getCommitStats(owner, repo, commitSha) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json"
        }
    });

    const data = await response.json();

    return {
        additions: data.stats?.additions || 0,
        deletions: data.stats?.deletions || 0
    };
}


app.post("/webhook/git", async (req, res) => {
    const payload = req.body;
    console.log("Received webhook payload:", payload);
    if (!payload.commits || !payload.repository) {
        return res.status(400).send("Invalid payload");
    }

    const repoName = payload.repository.name;
    const owner = payload.repository.owner.name || payload.repository.owner.login;

    for (const commit of payload.commits) {

        console.log("Commit file Details:", commit.added.length, commit.modified.length, commit.removed.length);
        const files_changed =
            commit.added.length +
            commit.modified.length +
            commit.removed.length;

        const { additions, deletions } = await getCommitStats(
            owner,
            repoName,
            commit.id
        );

        const difficulty_of_commit = calculateDifficulty(
            additions,
            deletions,
            files_changed
        );

        //need to store the commits for the project id , in their particular phase id , to generate the progress report. 
        const entry = {
            project_id: extractProjectId(commit.message),
            commit_id: commit.id,
            commit_message: commit.message,
            files_changed,
            additions,
            deletions,
            difficulty_of_commit,
            commit_timestamp: commit.timestamp,
            received_at: new Date()
        };

        // Store in logbook memory
        logbookMemory.push(entry);
        console.log("\nLogbook Entry Added:", entry);

        // Trigger AI logbook chat
        //triggerSmartAILogbook(entry);
    }

    res.status(200).send("Smart Logbook Updated");});

app.listen(PORT, () => {
    console.log(`🚀 Smart AI Logbook running on port ${PORT}`);
});
