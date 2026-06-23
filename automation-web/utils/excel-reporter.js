/**
 * Excel Report Generator
 * Generates multi-sheet Automation_Test_Report.xlsx
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function generateExcelReport(testResults) {
    console.log("Generating Excel Reports...");
    
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Execution Metrics
    const summaryData = [
        ["Metric", "Value"],
        ["Total Tests", testResults.total],
        ["Passed", testResults.passed],
        ["Failed", testResults.failed],
        ["Skipped", testResults.skipped],
        ["Execution Duration", testResults.duration],
        ["Pass Rate", `${((testResults.passed / testResults.total) * 100).toFixed(2)}%`],
        ["Execution Date", new Date().toISOString()],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "Execution Metrics");
    
    // Sheet 2: All Executed Test Cases
    const executedData = [["Test ID", "Module", "Test Name", "Priority", "Status", "Execution Time (ms)", "Error"]];
    testResults.tests.forEach(t => {
        executedData.push([t.id, t.module, t.name, t.priority, t.status, t.duration, t.errorMsg || '']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(executedData), "Executed Test Cases");

    // Sheet 3: Passed Tests
    const passedData = [["Test ID", "Module", "Test Name", "Priority", "Duration (ms)"]];
    testResults.tests.filter(t => t.status === 'PASSED').forEach(t => {
        passedData.push([t.id, t.module, t.name, t.priority, t.duration]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(passedData), "Passed Tests");

    // Sheet 4: Failed Tests
    const failedData = [["Test ID", "Module", "Test Name", "Priority", "Duration (ms)", "Failure Reason"]];
    testResults.tests.filter(t => t.status === 'FAILED').forEach(t => {
        failedData.push([t.id, t.module, t.name, t.priority, t.duration, t.errorMsg]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(failedData), "Failed Tests");

    // Sheet 5: Skipped Tests
    const skippedData = [["Test ID", "Module", "Test Name", "Priority", "Reason"]];
    testResults.tests.filter(t => t.status === 'SKIPPED').forEach(t => {
        skippedData.push([t.id, t.module, t.name, t.priority, t.errorMsg]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(skippedData), "Skipped Tests");

    // Sheet 6: Module Summary (Defect Summary)
    const modules = {};
    testResults.tests.forEach(t => {
        if (!modules[t.module]) modules[t.module] = { passed: 0, failed: 0, total: 0 };
        modules[t.module].total++;
        if (t.status === 'PASSED') modules[t.module].passed++;
        if (t.status === 'FAILED') modules[t.module].failed++;
    });
    const defectData = [["Module", "Total", "Passed", "Failed", "Pass Rate"]];
    Object.entries(modules).forEach(([mod, data]) => {
        defectData.push([mod, data.total, data.passed, data.failed, `${((data.passed / data.total) * 100).toFixed(1)}%`]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(defectData), "Defect Summary");

    // Write files
    const dir = path.join(__dirname, '..', 'reports', 'excel');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    XLSX.writeFile(wb, path.join(dir, 'Automation_Test_Report.xlsx'));
    
    // Also generate separate failed/passed workbooks
    const wbPassed = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbPassed, XLSX.utils.aoa_to_sheet(passedData), "Passed Tests");
    XLSX.writeFile(wbPassed, path.join(dir, 'Passed_Test_Cases.xlsx'));
    
    const wbFailed = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbFailed, XLSX.utils.aoa_to_sheet(failedData), "Failed Tests");
    XLSX.writeFile(wbFailed, path.join(dir, 'Failed_Test_Cases.xlsx'));

    const wbSummary = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbSummary, XLSX.utils.aoa_to_sheet(summaryData), "Summary");
    XLSX.utils.book_append_sheet(wbSummary, XLSX.utils.aoa_to_sheet(defectData), "Module Summary");
    XLSX.writeFile(wbSummary, path.join(dir, 'Summary_Report.xlsx'));

    console.log(`Excel reports saved to ${dir}`);
}

module.exports = { generateExcelReport };
