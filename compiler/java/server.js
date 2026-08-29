const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawn } = require("child_process");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "1mb" }));

function runProcess(command, args, input, cwd, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);

      resolve({
        code: code ?? -1,
        stdout,
        stderr,
        timedOut
      });
    });

    child.on("error", (error) => {
      clearTimeout(timer);

      resolve({
        code: -1,
        stdout,
        stderr: error.message,
        timedOut: false
      });
    });

    child.stdin.write(input || "");
    child.stdin.end();
  });
}


// Health check
app.get("/", (req, res) => {
  res.json({
    status: "Java Compiler Running",
    compiler: "javac",
    runtime: "java"
  });
});


// Java compile + run
app.post("/run", async (req, res) => {
  const { code, input = "", timeout = 5000 } = req.body;

  if (!code) {
    return res.status(400).json({
      status: "compile_error",
      output: "",
      compilerOutput: "Java code is required."
    });
  }

  const jobId = crypto.randomUUID();
  const jobDir = path.join(os.tmpdir(), `java-${jobId}`);

  try {
    await fs.promises.mkdir(jobDir, { recursive: true });

    const sourceFile = path.join(jobDir, "Main.java");

    await fs.promises.writeFile(
      sourceFile,
      String(code),
      "utf8"
    );

    // Compile
    const compile = await runProcess(
      "javac",
      ["Main.java"],
      "",
      jobDir,
      Number(timeout)
    );

    if (compile.timedOut) {
      return res.json({
        status: "compile_error",
        output: "",
        compilerOutput: "Compilation timed out."
      });
    }

    if (compile.code !== 0) {
      return res.json({
        status: "compile_error",
        output: "",
        compilerOutput: compile.stderr
      });
    }

    // Run
    const run = await runProcess(
      "java",
      ["-cp", jobDir, "Main"],
      input,
      jobDir,
      Number(timeout)
    );

    if (run.timedOut) {
      return res.json({
        status: "runtime_error",
        output: run.stdout,
        compilerOutput: "Execution timed out."
      });
    }

    if (run.code !== 0) {
      return res.json({
        status: "runtime_error",
        output: run.stdout,
        compilerOutput: run.stderr
      });
    }

    return res.json({
      status: "compiled",
      output: run.stdout,
      compilerOutput: run.stderr
    });

  } catch (error) {
    return res.status(500).json({
      status: "runtime_error",
      output: "",
      compilerOutput: error.message
    });

  } finally {
    fs.promises.rm(jobDir, {
      recursive: true,
      force: true
    }).catch(() => {});
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Java compiler server running on port ${PORT}`);
});
