const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

// ANSI Terminal Colors
const colors = {
  reset: '\x1b[0m',
  system: '\x1b[1;31m',           // Bold Red
  frontend: '\x1b[36m',             // Cyan
  backendApi: '\x1b[32m',           // Green
  workerReminders: '\x1b[33m',      // Yellow
  workerNotifications: '\x1b[34m',   // Blue
  consumerAudit: '\x1b[35m',         // Magenta
  consumerAnalytics: '\x1b[1;36m',   // Bold Cyan
  mlPcos: '\x1b[1;32m',              // Bold Green
  mlCycle: '\x1b[1;33m',             // Bold Yellow
  mlArticle: '\x1b[1;34m'            // Bold Blue
};

const activeProcesses = [];
let isShuttingDown = false;

// Gracefully terminate all child processes
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${colors.system}[System] Shutting down all services...${colors.reset}`);
  
  for (const proc of activeProcesses) {
    if (proc.pid) {
      try {
        // Kill the process group (using negative PID) to stop uvicorn/nodemon and their children
        process.kill(-proc.pid, 'SIGINT');
      } catch (err) {
        // Process might have already exited
      }
    }
  }
  
  // Give background processes a moment to cleanup and exit
  setTimeout(() => {
    console.log(`${colors.system}[System] Cleanup complete. Bye!${colors.reset}`);
    process.exit(0);
  }, 1500);
}

// Intercept exit signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Fallback safety handlers
process.on('uncaughtException', (err) => {
  console.error(`\n${colors.system}[System] Uncaught Exception: ${err.message}${colors.reset}`);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`\n${colors.system}[System] Unhandled Rejection at: ${promise}, reason: ${reason}${colors.reset}`);
  shutdown();
});

// Helper to check if a port is open
function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(800);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

// Helper to wait until a port is open
async function waitForPort(port, name, timeoutMs = 20000) {
  const start = Date.now();
  console.log(`${colors.system}[System] Waiting for ${name} on port ${port}...${colors.reset}`);
  while (Date.now() - start < timeoutMs) {
    if (await checkPort(port)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.warn(`${colors.system}[System] Warning: Timeout waiting for ${name} on port ${port}. Proceeding anyway...${colors.reset}`);
  return false;
}

// Helper to resolve ML uvicorn command
function getMLServiceConfig(serviceName, serviceSubdir, port) {
  const venvPath = path.join(__dirname, 'ml-model', '.venv');
  const venvBin = path.join(venvPath, 'bin');
  const cwd = path.join(__dirname, 'ml-model', serviceSubdir);
  
  const localUvicorn = path.join(venvBin, 'uvicorn');
  if (fs.existsSync(localUvicorn)) {
    return {
      command: localUvicorn,
      args: ['app.main:app', '--reload', '--port', String(port)],
      cwd
    };
  }
  
  const localPython = path.join(venvBin, 'python');
  if (fs.existsSync(localPython)) {
    return {
      command: localPython,
      args: ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', String(port)],
      cwd
    };
  }
  
  return {
    command: 'uvicorn',
    args: ['app.main:app', '--reload', '--port', String(port)],
    cwd
  };
}

// Function to start a service
function startService(name, command, args, cwd, color) {
  console.log(`${colors.system}[System] Spawning ${name}...${colors.reset}`);
  
  // Use detached: true so we can kill the entire process group later
  const child = spawn(command, args, {
    cwd,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: 'true' }
  });
  
  activeProcesses.push(child);
  
  // Set up line-buffered logging
  let stdoutBuffer = '';
  child.stdout.on('data', (data) => {
    stdoutBuffer += data.toString();
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop(); // Keep last incomplete line
    for (const line of lines) {
      if (line.trim() !== '') {
        console.log(`${color}[${name}]${colors.reset} ${line}`);
      }
    }
  });
  
  let stderrBuffer = '';
  child.stderr.on('data', (data) => {
    stderrBuffer += data.toString();
    const lines = stderrBuffer.split('\n');
    stderrBuffer = lines.pop();
    for (const line of lines) {
      if (line.trim() !== '') {
        console.log(`${color}[${name}] (stderr)${colors.reset} ${line}`);
      }
    }
  });
  
  child.on('close', (code) => {
    if (!isShuttingDown) {
      console.log(`${colors.system}[System] Service [${name}] exited with code ${code}${colors.reset}`);
    }
  });
  
  child.on('error', (err) => {
    console.error(`${colors.system}[System] Failed to start service [${name}]: ${err.message}${colors.reset}`);
  });
}

// Main runner function
async function main() {
  console.log(`${colors.system}[System] Starting SheCare Platform...${colors.reset}`);
  
  // 1. Docker infrastructure
  try {
    console.log(`${colors.system}[System] Running docker compose...${colors.reset}`);
    execSync('docker compose up -d redis zookeeper kafka', { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    console.error(`${colors.system}[System] Failed to execute docker compose. Please make sure docker is running.${colors.reset}`);
  }
  
  // 2. Wait for ports (Redis: 6379, Kafka: 9092)
  await waitForPort(6379, 'Redis');
  await waitForPort(9092, 'Kafka');
  
  // 3. Kafka initialization
  console.log(`${colors.system}[System] Initializing Kafka topics...${colors.reset}`);
  try {
    execSync('npm run kafka:init', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });
  } catch (err) {
    console.warn(`${colors.system}[System] Warning: Kafka topic initialization failed. Moving forward...${colors.reset}`);
  }
  
  // 4. Start all services
  
  // ML config
  const pcosConfig = getMLServiceConfig('ml-pcos', 'pcos-service', 8000);
  const cycleConfig = getMLServiceConfig('ml-cycle', 'cycle-service', 8001);
  const articleConfig = getMLServiceConfig('ml-article', 'article-service', 8002);
  
  const services = [
    // FastAPI ML Services
    { name: 'ml-pcos', ...pcosConfig, color: colors.mlPcos },
    { name: 'ml-cycle', ...cycleConfig, color: colors.mlCycle },
    { name: 'ml-article', ...articleConfig, color: colors.mlArticle },
    
    // Backend API Server
    {
      name: 'backend-api',
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.join(__dirname, 'backend'),
      color: colors.backendApi
    },
    
    // Backend Workers and Consumers
    {
      name: 'worker-reminders',
      command: 'npm',
      args: ['run', 'worker:reminders'],
      cwd: path.join(__dirname, 'backend'),
      color: colors.workerReminders
    },
    {
      name: 'worker-notifications',
      command: 'npm',
      args: ['run', 'worker:notifications'],
      cwd: path.join(__dirname, 'backend'),
      color: colors.workerNotifications
    },
    {
      name: 'consumer-audit',
      command: 'npm',
      args: ['run', 'consumer:audit'],
      cwd: path.join(__dirname, 'backend'),
      color: colors.consumerAudit
    },
    {
      name: 'consumer-analytics',
      command: 'npm',
      args: ['run', 'consumer:analytics'],
      cwd: path.join(__dirname, 'backend'),
      color: colors.consumerAnalytics
    },
    
    // Frontend Next.js Dev Server
    {
      name: 'frontend',
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.join(__dirname, 'frontend'),
      color: colors.frontend
    }
  ];
  
  for (const s of services) {
    startService(s.name, s.command, s.args, s.cwd, s.color);
  }
  
  console.log(`${colors.system}[System] All services started. Press Ctrl+C to terminate.${colors.reset}\n`);
}

main().catch((err) => {
  console.error(`${colors.system}[System] Bootstrap failed: ${err.message}${colors.reset}`);
  shutdown();
});
