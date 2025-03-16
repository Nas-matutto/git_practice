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
    
    // Function to get contribution changes
    function getContributionChanges() {
        const changes = [];
        const changeElements = document.querySelectorAll('.contribution-change');
        
        changeElements.forEach(element => {
            const yearInput = element.querySelector('.changeYear');
            const amountInput = element.querySelector('.changeAmount');
            
            if (yearInput && amountInput) {
                const year = parseInt(yearInput.value) || 0;
                const amount = parseFloat(amountInput.value) || 0;
                
                if (year > 0 && amount >= 0) {
                    changes.push({ year, amount });
                }
            }
        });
        
        // Sort changes by year (ascending)
        return changes.sort((a, b) => a.year - b.year);
    }
    
    // Function to calculate investment returns
    function calculateReturns() {
        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
        const baseMonthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 0;
        const annualGrowthRate = parseFloat(document.getElementById('annualGrowth').value) || 0;
        const years = parseInt(document.getElementById('years').value) || 0;
        
        const monthlyRate = annualGrowthRate / 100 / 12;
        const totalMonths = years * 12;
        
        let invested = initialInvestment;
        let currentValue = initialInvestment;
        
        // Get contribution changes
        const contributionChanges = getContributionChanges();
        
        const yearlyData = [];
        yearlyData.push({
            year: 0,
            invested: initialInvestment,
            value: initialInvestment,
            interest: 0,
            monthlyContribution: baseMonthlyContribution
        });
        
        // Calculate month by month
        for (let month = 1; month <= totalMonths; month++) {
            const currentYear = Math.ceil(month / 12);
            
            // Determine the monthly contribution based on changes
            let monthlyContribution = baseMonthlyContribution;
            
            for (const change of contributionChanges) {
                if (currentYear >= change.year) {
                    monthlyContribution = change.amount;
                } else {
                    break;
                }
            }
            
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
                    interest: currentValue - invested,
                    monthlyContribution: monthlyContribution
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
    
    // Add new contribution change
    document.getElementById('addChange').addEventListener('click', function() {
        const container = document.querySelector('.contribution-changes-container');
        const newChange = document.createElement('div');
        newChange.className = 'contribution-change';
        
        const lastYearInput = container.querySelector('.contribution-change:last-child .changeYear');
        const suggestedYear = lastYearInput ? parseInt(lastYearInput.value) + 5 : 5;
        
        newChange.innerHTML = `
            <div class="input-field">
                <label for="changeYear">Starting Year</label>
                <input type="number" class="changeYear" min="1" value="${suggestedYear}">
            </div>
            <div class="input-field">
                <label for="changeAmount">New Monthly Amount ($)</label>
                <input type="number" class="changeAmount" min="0" value="300">
            </div>
            <button class="remove-change">×</button>
        `;
        
        container.appendChild(newChange);
        
        // Add event listener to remove button
        newChange.querySelector('.remove-change').addEventListener('click', function() {
            container.removeChild(newChange);
            calculateReturns();
        });
        
        calculateReturns();
    });
    
    // Add event listener to initial remove button
    document.querySelector('.remove-change').addEventListener('click', function() {
        const container = document.querySelector('.contribution-changes-container');
        if (container.children.length > 1) {
            this.closest('.contribution-change').remove();
            calculateReturns();
        }
    });
    
    // Event listener for calculate button
    document.getElementById('calculate').addEventListener('click', calculateReturns);
    
    // Event listeners for input changes
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', calculateReturns);
    });
    
    // Calculate on page load with default values
    calculateReturns();
});