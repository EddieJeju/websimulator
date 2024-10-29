function updateVisualization(roomSize, heatData) {
    const canvas = document.getElementById('heatMap');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw room outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Create heat distribution based on heating method
    switch(document.getElementById('heatingMethod').value) {
        case 'fireplace':
            // Heat source from one side (left wall)
            const fireplaceGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            fireplaceGradient.addColorStop(0, `rgba(255, 100, 0, ${heatData.efficiency/100})`);
            fireplaceGradient.addColorStop(1, 'rgba(0, 0, 255, 0.1)');
            ctx.fillStyle = fireplaceGradient;
            break;
            
        case 'hypocaust':
            // Heat source from bottom with multiple channels
            const hypocaustGradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            hypocaustGradient.addColorStop(0, `rgba(255, 50, 0, ${heatData.efficiency/100})`);
            hypocaustGradient.addColorStop(0.4, `rgba(255, 50, 0, ${heatData.efficiency/150})`);
            hypocaustGradient.addColorStop(1, 'rgba(0, 0, 255, 0.1)');
            ctx.fillStyle = hypocaustGradient;
            break;
            
        case 'ondol':
            // Korean ondol - multiple floor channels with gradual spread
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Create multiple heating channels
            const channelCount = 5;
            const channelWidth = canvas.width / channelCount;
            
            for(let i = 0; i < channelCount; i++) {
                const channelGradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                channelGradient.addColorStop(0, `rgba(255, 150, 0, ${heatData.efficiency/100})`);
                channelGradient.addColorStop(0.3, `rgba(255, 150, 0, ${heatData.efficiency/150})`);
                channelGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
                
                ctx.fillStyle = channelGradient;
                ctx.fillRect(i * channelWidth, 0, channelWidth * 0.8, canvas.height);
            }
            break;

        case 'pech':
            // Russian pech - central masonry mass with strong heat retention
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Central heat mass
            const pechGradient = ctx.createRadialGradient(
                canvas.width/2, canvas.height/2, 0,
                canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2
            );
            pechGradient.addColorStop(0, `rgba(255, 0, 50, ${heatData.efficiency/80})`);
            pechGradient.addColorStop(0.3, `rgba(255, 0, 50, ${heatData.efficiency/100})`);
            pechGradient.addColorStop(0.7, `rgba(255, 0, 50, ${heatData.efficiency/150})`);
            pechGradient.addColorStop(1, 'rgba(255, 0, 50, 0)');
            
            ctx.fillStyle = pechGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'kang':
            // Chinese kang - heated platform with concentrated heat
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Heated platform area (bottom third of room)
            const kangGradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.7);
            kangGradient.addColorStop(0, `rgba(255, 200, 0, ${heatData.efficiency/80})`);
            kangGradient.addColorStop(0.4, `rgba(255, 200, 0, ${heatData.efficiency/120})`);
            kangGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            
            ctx.fillStyle = kangGradient;
            ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
            break;

        case 'brazier':
            // Medieval brazier - mobile heat source with local impact
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Multiple heat spots to represent mobility
            const spots = [
                {x: canvas.width/2, y: canvas.height/2},
                {x: canvas.width/3, y: canvas.height/3},
                {x: canvas.width*2/3, y: canvas.height*2/3}
            ];
            
            spots.forEach(spot => {
                const brazierGradient = ctx.createRadialGradient(
                    spot.x, spot.y, 0,
                    spot.x, spot.y, canvas.width/4
                );
                brazierGradient.addColorStop(0, `rgba(255, 100, 0, ${heatData.efficiency/100})`);
                brazierGradient.addColorStop(0.5, `rgba(255, 100, 0, ${heatData.efficiency/200})`);
                brazierGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
                
                ctx.fillStyle = brazierGradient;
                ctx.beginPath();
                ctx.arc(spot.x, spot.y, canvas.width/4, 0, Math.PI * 2);
                ctx.fill();
            });
            break;
            
        case 'radiator':
            // Modern radiator - wall mounted with efficient spread
            const radiatorGradient = ctx.createLinearGradient(canvas.width, 0, 0, 0);
            radiatorGradient.addColorStop(0, `rgba(255, 0, 100, ${heatData.efficiency/100})`);
            radiatorGradient.addColorStop(1, 'rgba(0, 0, 255, 0.1)');
            ctx.fillStyle = radiatorGradient;
            break;
            
        case 'underfloor':
            // Modern underfloor - even distribution
            const underfloorGradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            underfloorGradient.addColorStop(0, `rgba(255, 0, 150, ${heatData.efficiency/100})`);
            underfloorGradient.addColorStop(0.2, `rgba(255, 0, 150, ${heatData.efficiency/150})`);
            underfloorGradient.addColorStop(1, 'rgba(0, 0, 255, 0.1)');
            ctx.fillStyle = underfloorGradient;
            break;
    }
    
    // Fill the room if not already filled by the specific method
    if (!['ondol', 'pech', 'kang', 'brazier'].includes(document.getElementById('heatingMethod').value)) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
