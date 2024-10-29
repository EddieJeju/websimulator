document.addEventListener('DOMContentLoaded', function() {
    const simulateBtn = document.getElementById('simulate');
    let efficiencyChart = null;

    simulateBtn.addEventListener('click', async function() {
        try {
            const roomSize = {
                width: parseFloat(document.getElementById('roomWidth').value),
                length: parseFloat(document.getElementById('roomLength').value)
            };
            const insulation = document.getElementById('insulation').value;
            const heatingMethod = document.getElementById('heatingMethod').value;

            console.log('Sending calculation request with:', { roomSize, insulation, heatingMethod });

            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomSize,
                    insulation,
                    heatingMethod
                })
            });

            const data = await response.json();
            console.log('Received calculation data:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            updateVisualization(roomSize, data);
            updateEfficiencyChart(data);
            updateCostAnalysis(data);
            updateEnvironmentalImpact(data);
        } catch (error) {
            console.error('Error in simulation:', error);
            alert('Error calculating results. Please try again.');
        }
    });

    function updateEfficiencyChart(data) {
        const ctx = document.getElementById('efficiencyChart');
        
        if (efficiencyChart) {
            efficiencyChart.destroy();
        }

        efficiencyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Efficiency', 'Heat Output', 'Heat Loss'],
                datasets: [{
                    label: 'Heating Metrics',
                    data: [
                        data.efficiency,
                        data.heat_output,
                        data.heat_loss
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateCostAnalysis(data) {
        try {
            document.getElementById('installationCost').textContent = `$${data.installation_cost.toLocaleString()}`;
            document.getElementById('monthlyCost').textContent = `$${data.monthly_cost.toLocaleString()}`;
            document.getElementById('energyRate').textContent = `$${data.energy_rate.toFixed(2)}/kWh`;
        } catch (error) {
            console.error('Error updating cost analysis:', error);
        }
    }

    function updateEnvironmentalImpact(data) {
        try {
            document.getElementById('monthlyEmissions').textContent = `${data.monthly_emissions.toLocaleString()} kg`;
            document.getElementById('renewablePercentage').textContent = `${data.renewable_percentage}%`;
            document.getElementById('emissionsPerKwh').textContent = `${data.emissions_per_kwh.toFixed(3)} kg/kWh`;
        } catch (error) {
            console.error('Error updating environmental impact:', error);
        }
    }

    // Trigger initial simulation
    simulateBtn.click();
});
