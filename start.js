const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
    server: '\x1b[36m', // Cyan
    client: '\x1b[35m', // Magenta
    reset: '\x1b[0m'    // Reset
};

function runCommand(command, args, cwd, name) {
    const color = colors[name] || colors.reset;
    
    const process = spawn(command, args, {
        cwd: path.join(__dirname, cwd),
        shell: true,
        stdio: 'pipe'
    });

    process.stdout.on('data', (data) => {
        console.log(`${color}[${name}]:${colors.reset} ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`${color}[${name} error]:${colors.reset} ${data.toString().trim()}`);
    });

    process.on('error', (error) => {
        console.error(`${color}[${name} error]:${colors.reset} ${error.message}`);
    });

    process.on('close', (code) => {
        if (code !== 0) {
            console.log(`${color}[${name}]:${colors.reset} Process exited with code ${code}`);
        }
    });

    return process;
}

console.log('Starting server and client...');

// Start server
const server = runCommand('npm', ['start'], 'server', 'server');

// Wait 5 seconds before starting client to ensure server is up
setTimeout(() => {
    const client = runCommand('npm', ['start'], 'client', 'client');
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\nGracefully shutting down...');
        server.kill();
        client.kill();
        process.exit(0);
    });
}, 5000);
