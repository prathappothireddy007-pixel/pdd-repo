/**
 * HTML Report Generator
 * Generates a professional dashboard-style HTML report
 */
const fs = require('fs');
const path = require('path');

function generateHtmlReport(testResults) {
    console.log("Generating HTML Reports...");

    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    const failRate = ((testResults.failed / testResults.total) * 100).toFixed(2);

    // Module breakdown
    const modules = {};
    testResults.tests.forEach(t => {
        if (!modules[t.module]) modules[t.module] = { passed: 0, failed: 0, total: 0 };
        modules[t.module].total++;
        if (t.status === 'PASSED') modules[t.module].passed++;
        if (t.status === 'FAILED') modules[t.module].failed++;
    });

    const moduleRows = Object.entries(modules).map(([mod, d]) => `
        <tr>
            <td>${mod}</td>
            <td>${d.total}</td>
            <td style="color:#16a34a;font-weight:600">${d.passed}</td>
            <td style="color:#dc2626;font-weight:600">${d.failed}</td>
            <td>${((d.passed / d.total) * 100).toFixed(1)}%</td>
        </tr>
    `).join('');

    const failedRows = testResults.tests.filter(t => t.status === 'FAILED').map(t => `
        <tr>
            <td><code>${t.id}</code></td>
            <td>${t.module}</td>
            <td>${t.name}</td>
            <td>${t.priority}</td>
            <td style="color:#dc2626">${t.errorMsg}</td>
            <td>${t.duration}ms</td>
        </tr>
    `).join('');

    const allTestRows = testResults.tests.map(t => `
        <tr class="${t.status === 'PASSED' ? 'row-pass' : 'row-fail'}">
            <td><code>${t.id}</code></td>
            <td>${t.module}</td>
            <td>${t.name}</td>
            <td>${t.priority}</td>
            <td><span class="badge ${t.status === 'PASSED' ? 'badge-pass' : 'badge-fail'}">${t.status}</span></td>
            <td>${t.duration}ms</td>
        </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BidSphere E2E Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e3a8a, #7c3aed); padding: 40px; text-align: center; }
        .header h1 { font-size: 2rem; margin-bottom: 8px; }
        .header p { opacity: 0.8; }
        .container { max-width: 1400px; margin: 0 auto; padding: 30px; }
        .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .card { background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #334155; }
        .card .value { font-size: 2.5rem; font-weight: 700; margin: 10px 0; }
        .card .label { color: #94a3b8; font-size: 0.9rem; }
        .card.pass .value { color: #4ade80; }
        .card.fail .value { color: #f87171; }
        .card.total .value { color: #60a5fa; }
        .card.rate .value { color: ${parseFloat(passRate) >= 95 ? '#4ade80' : '#f59e0b'}; }
        .section { background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #334155; }
        .section h2 { margin-bottom: 20px; font-size: 1.3rem; color: #f8fafc; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0f172a; padding: 12px; text-align: left; font-weight: 600; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #334155; font-size: 0.9rem; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .badge-pass { background: #064e3b; color: #4ade80; }
        .badge-fail { background: #450a0a; color: #f87171; }
        .row-fail { background: rgba(220, 38, 38, 0.05); }
        code { background: #334155; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
        .progress-bar { height: 8px; background: #334155; border-radius: 4px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4ade80, #22d3ee); border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 BidSphere E2E Test Execution Report</h1>
        <p>Execution Date: ${new Date().toISOString()} | Duration: ${testResults.duration}</p>
    </div>
    <div class="container">
        <div class="cards">
            <div class="card total">
                <div class="label">Total Tests</div>
                <div class="value">${testResults.total}</div>
            </div>
            <div class="card pass">
                <div class="label">Passed</div>
                <div class="value">${testResults.passed}</div>
            </div>
            <div class="card fail">
                <div class="label">Failed</div>
                <div class="value">${testResults.failed}</div>
            </div>
            <div class="card rate">
                <div class="label">Pass Rate</div>
                <div class="value">${passRate}%</div>
                <div class="progress-bar"><div class="progress-fill" style="width:${passRate}%"></div></div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Module Summary</h2>
            <table>
                <thead><tr><th>Module</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr></thead>
                <tbody>${moduleRows}</tbody>
            </table>
        </div>

        ${testResults.failed > 0 ? `
        <div class="section">
            <h2>❌ Failed Tests</h2>
            <table>
                <thead><tr><th>ID</th><th>Module</th><th>Test Name</th><th>Priority</th><th>Error</th><th>Duration</th></tr></thead>
                <tbody>${failedRows}</tbody>
            </table>
        </div>` : ''}

        <div class="section">
            <h2>📋 All Test Cases (${testResults.total})</h2>
            <table>
                <thead><tr><th>ID</th><th>Module</th><th>Test Name</th><th>Priority</th><th>Status</th><th>Duration</th></tr></thead>
                <tbody>${allTestRows}</tbody>
            </table>
        </div>
    </div>
</body>
</html>`;

    const dir = path.join(__dirname, '..', 'reports', 'html');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'execution-report.html'), html);
    fs.writeFileSync(path.join(dir, 'dashboard.html'), html); // Same content for dashboard
    console.log(`HTML reports saved to ${dir}`);
}

module.exports = { generateHtmlReport };
