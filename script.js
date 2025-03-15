document.addEventListener('DOMContentLoaded', function() {
    // Initialize chart
    let ctx = document.getElementById('investmentChart').getContext('2d');
    let investmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Amount Invested',
                    backgroundColor: '#4a90e2',
                    data: []
                },
                {
                    label: 'Interest Earned',
                    backgroundColor: '#66c29a',
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Years'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '$' + context.raw.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                            return label;
                        }
                    }
                }
            }
        }
    });
    
    // Function to calculate investment returns
    function calculateReturns() {
        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
        const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 0;
        const annualGrowthRate = parseFloat(document.getElementById('annualGrowth').value) || 0;
        const years = parseInt(document.getElementById('years').value) || 0;
        
        const monthlyRate = annualGrowthRate / 100 / 12;
        const totalMonths = years * 12;
        
        let invested = initialInvestment;
        let currentValue = initialInvestment;
        
        const yearlyData = [];
        yearlyData.push({
            year: 0,
            invested: initialInvestment,
            value: initialInvestment,
            interest: 0
        });
        
        // Calculate month by month
        for (let month = 1; month <= totalMonths; month++) {
            // Add monthly contribution
            invested += monthlyContribution;
            
            // Add interest for the month
            currentValue = (currentValue + monthlyContribution) * (1 + monthlyRate);
            
            // Store yearly data
            if (month % 12 === 0) {
                const year = month / 12;
                yearlyData.push({
                    year: year,
                    invested: invested,
                    value: currentValue,
                    interest: currentValue - invested
                });
            }
        }
        
        // Update results
        document.getElementById('totalInvested').textContent = formatCurrency(invested);
        document.getElementById('totalValue').textContent = formatCurrency(currentValue);
        document.getElementById('totalInterest').textContent = formatCurrency(currentValue - invested);
        
        // Update chart
        updateChart(yearlyData);
    }
    
    // Format number as currency
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    // Update the chart with new data
    function updateChart(yearlyData) {
        const years = yearlyData.map(data => 'Year ' + data.year);
        const invested = yearlyData.map(data => data.invested);
        const interest = yearlyData.map(data => data.interest);
        
        investmentChart.data.labels = years;
        investmentChart.data.datasets[0].data = invested;
        investmentChart.data.datasets[1].data = interest;
        investmentChart.update();
    }
    
    // Event listener for calculate button
    document.getElementById('calculate').addEventListener('click', calculateReturns);
    
    // Calculate on page load with default values
    calculateReturns();
});