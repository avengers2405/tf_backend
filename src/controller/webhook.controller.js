import { prisma } from "../db/index.js"
import analyzeInconsistency from "../services/inconsistencyService.js";
const prisma_ = prisma;
// Extract project_id from commit message
// Example: [PROJECT:101] Added login
function extractProjectId(message) {
  const match = message.match(/\[PROJECT:(.*?)\]/);
  return match ? match[1] : null;
}

// future scope : add weights based on files modified, like js, css, .json
function calculateDifficulty(additions, deletions, filesChanged) {
  // Define Weights
  const W_ADD = 1.0;  // Baseline for new code
  const W_DEL = 0.5;  // Deletions are effort, but usually less than creation
  const W_FILE = 10.0; // High weight to reward architectural spread (context switching)

  // 2. Calculate Weighted Effort
  const weightedEffort = (additions * W_ADD) + (deletions * W_DEL) + (filesChanged * W_FILE);

  // 3. Apply Natural Logarithm (The Damper)
  // Math.log1p(x) computes ln(1 + x). 
  // This handles the "1000 lines vs 100 lines" problem—the 1000th line 
  // shouldn't increase difficulty as much as the 10th line did.
  const score = Math.log1p(weightedEffort);

  // Return as a float with 2 decimal places for the DB
  return parseFloat(score.toFixed(2));
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

export const handleGitHubWebhook = async (req, res) => {
  const payload = req.body;
  console.log("Received webhook payload:", payload);
  if (!payload.commits || !payload.repository) {
    return res.status(400).send("Invalid payload");
  }
  const repoName = payload.repository.name;
  const owner = payload.repository.owner.name || payload.repository.owner.login;

  const project_id = extractProjectId(payload.commits[0].message);
  const ROLL_WINDOW = 7;
  try {
    // Map commits to an array of Promises
    console.log("Creating Promise for each commit...");

    //fetch last 7 cmmits.
    //history is a dyna,ic array
    const history = await prisma_.git_logbook_entries.findMany({
      where: {
        project_id: project_id,
      },
      orderBy: {
        commit_timestamp: 'desc',
      },
      take: ROLL_WINDOW,
    });
    console.log(`Fetched ${history.length} historical entries for inconsistency analysis.`);

    for (const commit of payload.commits) {

      if (!project_id) {
        console.log(`Skipping commit ${commit.id}: No Project ID tag found.`);
        return null;
      }

      const files_changed = commit.added.length + commit.modified.length + commit.removed.length;

      const { additions, deletions } = await getCommitStats(owner, repoName, commit.id);

      const difficulty = calculateDifficulty(additions, deletions, files_changed);

      //calculate inconsistency for each commit. 
      //implement a sliding window type approach where if length of array fetch exceeds then shift pointer to right and again cal mean and var. 
      //after each consistency check insert the entry in db. 
      const { is_anomaly, anomaly_reason } = analyzeInconsistency(commit, history);
      console.log("IsAnomaly: ", is_anomaly, "Reason: ", anomaly_reason);
      return prisma_.git_logbook_entries.upsert({
        where: { commit_id: commit.id },
        update: {},
        create: {
          project_id: project_id,
          commit_id: commit.id,
          commit_message: commit.message,
          pusher_name: payload.pusher.name,
          files_changed,
          difficulty_of_commit: difficulty,
          is_anomaly: is_anomaly,
          anomaly_reason: anomaly_reason,
          commit_timestamp: new Date(commit.timestamp),
        },
      });

    };

  } catch (err) {
    console.error("Critical Webhook Error:", err);
    // It's often better to send 200 even on error so GitHub doesn't retry failed logic,
    // but 500 is standard for debugging.
    res.status(500).send("Internal Server Error during processing");
  }
}

//work this through later.
// const authorizeChatAccess = (req, res, next) => {
//     const { userRole, userGroupId, managedGroups } = req.user; // From your Auth JWT
//     const { chatId } = req.params;

//     if (userRole === "student") {
//         if (chatId !== userGroupId) return res.status(403).send("Unauthorized");
//     } else if (userRole === "teacher") {
//         if (!managedGroups.includes(chatId)) return res.status(403).send("Unauthorized");
//     }
//     next();
// };