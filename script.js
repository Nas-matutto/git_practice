function calculateReturn() {
    // Get user inputs
    let initial = parseFloat(document.getElementById('initial').value) || 0;
    let monthly = parseFloat(document.getElementById('monthly').value) || 0;
    let growth = parseFloat(document.getElementById('growth').value) || 0;
    let years = parseInt(document.getElementById('years').value) || 1;

    // Convert annual growth % to decimal and monthly rate
    let annualRate = growth / 100;
    let monthlyRate = annualRate / 12;
    let months = years * 12;

    // Compound Interest Formula for Monthly Contributions
    let futureValue = initial * Math.pow(1 + monthlyRate, months);
    for (let i = 1; i <= months; i++) {
        futureValue += monthly * Math.pow(1 + monthlyRate, months - i);
    }

    // Format the output
    document.getElementById('result').innerHTML = 
        `Estimated Value: <strong>$${futureValue.toFixed(2)}</strong>`;
}
