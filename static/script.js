document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clear-btn');
    const predictBtn = document.getElementById('predict-btn');
    const predictionSpan = document.getElementById('prediction');
    const confidenceSpan = document.getElementById('confidence');

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set initial canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drawing settings
    ctx.strokeStyle = 'black'; // Draw in black
    ctx.lineWidth = 15; // Thick lines for better recognition after resizing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        predictionSpan.textContent = '-';
        confidenceSpan.textContent = '-';
    });

    predictBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');

        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: dataURL }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                } else {
                    predictionSpan.textContent = data.digit;
                    confidenceSpan.textContent = (data.confidence * 100).toFixed(2) + '%';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during prediction.');
            });
    });
});
