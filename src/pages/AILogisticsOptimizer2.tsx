import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, Database, TrendingUp, Home, DollarSign, Calculator, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RealEstateAnalyzer = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const fileInputRef = useRef(null);

  // Demo data - realistic multi-family properties
  const demoData = [
    {
      property_name: "Maple Grove Apartments",
      address: "1234 Oak Street, Austin, TX 78704",
      units: 12,
      avg_rent: 1200,
      occupied_units: 11,
      other_income_monthly: 500,
      purchase_price: 1800000,
      down_payment_pct: 25,
      interest_rate: 6.5,
      loan_term_years: 30,
      closing_costs: 45000,
      initial_capex: 60000,
      vacancy_rate_assumption: 8,
      management_fee_pct: 6,
      taxes_annual: 21600,
      insurance_annual: 12000,
      repairs_annual: 18000,
      utilities_annual: 8400,
      payroll_annual: 15000,
      admin_annual: 3600,
      marketing_annual: 2400,
      other_opex_annual: 4800,
      capex_reserve_per_unit_annual: 800
    },
    {
      property_name: "Sunset Villas",
      address: "5678 Elm Avenue, Dallas, TX 75201",
      units: 40,
      avg_rent: 1450,
      occupied_units: 38,
      other_income_monthly: 1200,
      purchase_price: 7200000,
      down_payment_pct: 30,
      interest_rate: 6.2,
      loan_term_years: 30,
      closing_costs: 144000,
      initial_capex: 200000,
      vacancy_rate_assumption: 5,
      management_fee_pct: 5,
      taxes_annual: 86400,
      insurance_annual: 36000,
      repairs_annual: 28800,
      utilities_annual: 19200,
      payroll_annual: 48000,
      admin_annual: 14400,
      marketing_annual: 7200,
      other_opex_annual: 12000,
      capex_reserve_per_unit_annual: 900
    },
    {
      property_name: "Pinecrest Towers",
      address: "9101 Pine Boulevard, Houston, TX 77001",
      units: 100,
      avg_rent: 1350,
      occupied_units: 94,
      other_income_monthly: 3000,
      purchase_price: 16500000,
      down_payment_pct: 20,
      interest_rate: 6.8,
      loan_term_years: 30,
      closing_costs: 330000,
      initial_capex: 500000,
      vacancy_rate_assumption: 7,
      management_fee_pct: 4.5,
      taxes_annual: 198000,
      insurance_annual: 99000,
      repairs_annual: 81000,
      utilities_annual: 54000,
      payroll_annual: 120000,
      admin_annual: 33000,
      marketing_annual: 18000,
      other_opex_annual: 27000,
      capex_reserve_per_unit_annual: 750
    }
  ];

  const calculateMetrics = (property) => {
    // Revenue calculations
    const grossRentAnnual = property.avg_rent * property.units * 12;
    const otherIncomeAnnual = property.other_income_monthly * 12;
    const grossPotentialIncome = grossRentAnnual + otherIncomeAnnual;
    const vacancyLoss = grossPotentialIncome * (property.vacancy_rate_assumption / 100);
    const effectiveGrossIncome = grossPotentialIncome - vacancyLoss;

    // Operating expenses
    const managementFee = effectiveGrossIncome * (property.management_fee_pct / 100);
    const capexReserve = property.capex_reserve_per_unit_annual * property.units;
    const totalOpex = property.taxes_annual + property.insurance_annual + property.repairs_annual + 
                     property.utilities_annual + property.payroll_annual + property.admin_annual + 
                     property.marketing_annual + property.other_opex_annual + managementFee + capexReserve;

    // NOI and ratios
    const noi = effectiveGrossIncome - totalOpex;
    const capRate = (noi / property.purchase_price) * 100;
    const oer = (totalOpex / effectiveGrossIncome) * 100;

    // Financing calculations
    const loanAmount = property.purchase_price * (1 - property.down_payment_pct / 100);
    const monthlyRate = property.interest_rate / 100 / 12;
    const numPayments = property.loan_term_years * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    const dscr = noi / annualDebtService;

    // Cash flow analysis
    const totalCashInvested = property.purchase_price * (property.down_payment_pct / 100) + 
                             property.closing_costs + property.initial_capex;
    const beforeTaxCashFlow = noi - annualDebtService;
    const cashOnCash = (beforeTaxCashFlow / totalCashInvested) * 100;

    // Breakeven occupancy
    const fixedCosts = property.taxes_annual + property.insurance_annual + property.payroll_annual + 
                      property.admin_annual + property.marketing_annual + property.other_opex_annual + 
                      capexReserve + annualDebtService;
    const variableCostPerUnit = (property.repairs_annual + property.utilities_annual + managementFee) / property.units;
    const breakEvenOccupancy = (fixedCosts / (property.avg_rent * 12 - variableCostPerUnit)) / property.units * 100;

    return {
      grossPotentialIncome,
      effectiveGrossIncome,
      vacancyLoss,
      totalOpex,
      noi,
      capRate,
      oer,
      dscr,
      cashOnCash,
      breakEvenOccupancy,
      beforeTaxCashFlow,
      totalCashInvested,
      annualDebtService,
      loanAmount,
      monthlyPayment,
      expenseBreakdown: {
        taxes: property.taxes_annual,
        insurance: property.insurance_annual,
        repairs: property.repairs_annual,
        utilities: property.utilities_annual,
        payroll: property.payroll_annual,
        admin: property.admin_annual,
        marketing: property.marketing_annual,
        management: managementFee,
        capex: capexReserve,
        other: property.other_opex_annual
      }
    };
  };

  const generateInsights = (property, metrics) => {
    const insights = [];
    
    // Cap rate analysis
    if (metrics.capRate > 8) {
      insights.push(`Strong ${metrics.capRate.toFixed(1)}% cap rate indicates good income potential relative to price.`);
    } else if (metrics.capRate < 5) {
      insights.push(`Low ${metrics.capRate.toFixed(1)}% cap rate suggests premium pricing or appreciation play.`);
    }

    // DSCR analysis
    if (metrics.dscr > 1.3) {
      insights.push(`Excellent ${metrics.dscr.toFixed(2)}x debt coverage provides strong safety margin.`);
    } else if (metrics.dscr < 1.2) {
      insights.push(`DSCR of ${metrics.dscr.toFixed(2)}x is tight - consider higher down payment.`);
    }

    // Expense ratio analysis
    if (metrics.oer > 60) {
      insights.push(`High ${metrics.oer.toFixed(1)}% operating ratio indicates potential efficiency improvements.`);
    } else if (metrics.oer < 45) {
      insights.push(`Low ${metrics.oer.toFixed(1)}% operating ratio shows efficient property management.`);
    }

    // Repair analysis
    const repairRatio = (property.repairs_annual / metrics.totalOpex) * 100;
    if (repairRatio > 20) {
      insights.push(`Repairs account for ${repairRatio.toFixed(1)}% of expenses - may need capital improvements.`);
    }

    // Cash-on-cash analysis
    if (metrics.cashOnCash > 8) {
      insights.push(`Strong ${metrics.cashOnCash.toFixed(1)}% cash-on-cash return exceeds typical market expectations.`);
    } else if (metrics.cashOnCash < 6) {
      insights.push(`${metrics.cashOnCash.toFixed(1)}% cash-on-cash return may require value-add strategy.`);
    }

    return insights;
  };

  const runAnalysis = async (useDemo = true) => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const dataToAnalyze = useDemo ? demoData : []; // For now, always use demo data
    
    // Calculate portfolio summary first
    const totalUnits = dataToAnalyze.reduce((sum, p) => sum + p.units, 0);
    const totalPurchasePrice = dataToAnalyze.reduce((sum, p) => sum + p.purchase_price, 0);
    
    const results = {
      isDemoData: useDemo,
      timestamp: new Date().toISOString(),
      properties: dataToAnalyze.map(property => {
        const metrics = calculateMetrics(property);
        const insights = generateInsights(property, metrics);
        return {
          ...property,
          metrics,
          insights
        };
      }),
      portfolioSummary: {
        totalUnits,
        totalPurchasePrice,
        totalNOI: 0, // Will be calculated below
        avgCapRate: 0, // Will be calculated below
        totalCashFlow: 0 // Will be calculated below
      }
    };

    // Now calculate the remaining portfolio summary values
    const totalNOI = results.properties.reduce((sum, p) => sum + p.metrics.noi, 0);
    const avgCapRate = results.properties.reduce((sum, p) => sum + p.metrics.capRate, 0) / results.properties.length;
    const totalCashFlow = results.properties.reduce((sum, p) => sum + p.metrics.beforeTaxCashFlow, 0);

    results.portfolioSummary.totalNOI = totalNOI;
    results.portfolioSummary.avgCapRate = avgCapRate;
    results.portfolioSummary.totalCashFlow = totalCashFlow;

    setAnalysisResults(results);
    setIsAnalyzing(false);
  };

  const downloadPDF = async () => {
    if (!analysisResults) return;

    // Generate comprehensive PDF report using Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [
          {
            role: "user",
            content: `Generate a complete professional PDF-style report in HTML format for this real estate deal analysis. 

CRITICAL REQUIREMENTS:
- Generate a COMPLETE report covering ALL properties in detail
- Use proper page breaks between sections
- Ensure no text is cut off
- Include ALL data and insights for every property
- Format for proper PDF printing/saving

Data to analyze: ${JSON.stringify(analysisResults, null, 2)}

STRUCTURE REQUIRED:
1. Cover Page with title "Multi-Family Deal Analysis Report ${analysisResults.isDemoData ? '(Demo Data)' : ''}"
2. Executive Summary (portfolio overview)
3. Complete analysis for EACH property including:
   - Property overview and location
   - All financial metrics (Cap Rate, DSCR, Cash-on-Cash, etc.)
   - Income and expense breakdown
   - AI insights and recommendations
   - Charts/tables representation
4. Portfolio Summary and Conclusions
5. Appendix with assumptions

FORMATTING:
- Use CSS for professional styling
- Include page breaks: page-break-after: always;
- Proper margins for PDF: margin: 1in;
- Professional typography
- Tables with borders and proper spacing
- Clear section headers
- Include date and disclaimer footer

Return ONLY the complete HTML document ready for PDF conversion.`
          }
        ]
      })
    });

    const data = await response.json();
    let htmlContent = data.content[0].text;
    
    // Clean up any markdown formatting that might have been added
    htmlContent = htmlContent.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Ensure we have a complete HTML document
    if (!htmlContent.includes('<!DOCTYPE html>')) {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Real Estate Analysis Report</title>
<style>
@media print {
  body { margin: 0; }
  .page-break { page-break-after: always; }
}
body { 
  font-family: Arial, sans-serif; 
  line-height: 1.6; 
  margin: 1in;
  font-size: 12px;
}
.header { text-align: center; margin-bottom: 30px; }
.metrics-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.metrics-table th, .metrics-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
.metrics-table th { background-color: #f2f2f2; }
.insights { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff; }
h1 { color: #333; font-size: 24px; }
h2 { color: #555; font-size: 18px; margin-top: 30px; }
h3 { color: #777; font-size: 16px; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
    }

    // Create and download HTML file that can be printed to PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real-estate-analysis-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also open in new tab for immediate PDF printing
    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // Add print instruction
    setTimeout(() => {
      alert('Report opened in new tab. Use your browser\'s Print function and select "Save as PDF" for best results.');
    }, 1000);
  };

  const downloadJSON = () => {
    if (!analysisResults) return;

    const blob = new Blob([JSON.stringify(analysisResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real-estate-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link to="/apps" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Apps
        </Link>
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Home className="text-blue-600" />
                AI Real Estate Deal Analyzer
              </h1>
              <p className="text-gray-600 mt-2">Automated multi-family property analysis with AI-powered insights</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => runAnalysis(true)}
                disabled={isAnalyzing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    Run Demo Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CSV Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="text-gray-600" />
            Data Input
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload CSV File
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Upload your property data CSV for analysis
              </p>
              {csvFile && (
                <p className="text-sm text-green-600 mt-2">
                  File selected: {csvFile.name}
                </p>
              )}
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Mode</h3>
              <p className="text-sm text-blue-700 mb-4">
                Try the analyzer with realistic sample data including 3 multi-family properties 
                with varying performance metrics.
              </p>
              <button
                onClick={() => runAnalysis(true)}
                disabled={isAnalyzing}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Use Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {analysisResults && (
          <>
            {/* Portfolio Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calculator className="text-gray-600" />
                  Portfolio Summary {analysisResults.isDemoData && <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Demo Data</span>}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={downloadPDF}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Download PDF Report
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download JSON
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisResults.portfolioSummary.totalUnits}</div>
                  <div className="text-sm text-gray-600">Total Units</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${(analysisResults.portfolioSummary.totalPurchasePrice / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Purchase Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${(analysisResults.portfolioSummary.totalNOI / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Annual NOI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysisResults.portfolioSummary.avgCapRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Cap Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    ${(analysisResults.portfolioSummary.totalCashFlow / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Cash Flow</div>
                </div>
              </div>
            </div>

            {/* Individual Property Analysis */}
            {analysisResults.properties.map((property, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {property.property_name}
                </h3>
                <p className="text-gray-600 mb-4">{property.address}</p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{property.units}</div>
                    <div className="text-xs text-gray-600">Units</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">{property.metrics.capRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Cap Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{property.metrics.dscr.toFixed(2)}x</div>
                    <div className="text-xs text-gray-600">DSCR</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-orange-600">{property.metrics.cashOnCash.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Cash-on-Cash</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-teal-600">{property.metrics.oer.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Op Ratio</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-red-600">{property.metrics.breakEvenOccupancy.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Breakeven</div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Expense Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-3">Operating Expenses Breakdown</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.entries(property.metrics.expenseBreakdown).map(([key, value]) => ({
                            name: key.charAt(0).toUpperCase() + key.slice(1),
                            value: value
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={(entry) => `${entry.name}: $${(entry.value/1000).toFixed(0)}K`}
                        >
                          {Object.entries(property.metrics.expenseBreakdown).map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Financial Summary */}
                  <div>
                    <h4 className="font-semibold mb-3">Financial Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Potential Income:</span>
                        <span className="font-semibold">${property.metrics.grossPotentialIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effective Gross Income:</span>
                        <span className="font-semibold">${property.metrics.effectiveGrossIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Operating Expenses:</span>
                        <span className="font-semibold">${property.metrics.totalOpex.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-semibold">Net Operating Income:</span>
                        <span className="font-bold text-green-600">${property.metrics.noi.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Debt Service:</span>
                        <span className="font-semibold">${property.metrics.annualDebtService.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-semibold">Before-Tax Cash Flow:</span>
                        <span className="font-bold text-blue-600">${property.metrics.beforeTaxCashFlow.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
                    <AlertCircle size={16} />
                    AI-Generated Insights
                  </h4>
                  <div className="space-y-2">
                    {property.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Getting Started */}
        {!analysisResults && !isAnalyzing && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Home className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze Your Deals?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upload your property data CSV or try our demo to see how AI can automate your real estate 
              deal analysis with professional-grade metrics, insights, and reporting.
            </p>
            <button
              onClick={() => runAnalysis(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Try Demo Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealEstateAnalyzer;
