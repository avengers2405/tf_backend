import crypto from "crypto";

export const verifyGitHubSignature = (req, res, buf) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) throw new Error("Missing signature");


  const hmac = crypto.createHmac("sha256", process.env.GITHUB_SECRET);
  const digest = "sha256=" + hmac.update(buf).digest("hex");

  if (signature !== digest) {
    throw new Error("Invalid GitHub webhook signature");
  }
  console.log("GitHub webhook signature verified");
};