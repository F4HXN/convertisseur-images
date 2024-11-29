# js/script.js
const els = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('qualityValue'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    keepRatio: document.getElementById('keepRatio'),
    resetSize: document.getElementById('resetSize'),
    downloadBtn: document.getElementById('downloadBtn'),
    sourcePreview: document.getElementById('sourcePreview'),
    convertedPreview: document.getElementById('convertedPreview'),
    sourceWeight: document.getElementById('sourceWeight'),
    convertedWeight: document.getElementById('convertedWeight'),
    outputFormat: document.getElementById('outputFormat'),
    fileInfo: document.getElementById('fileInfo'),
    sourceFormat: document.getElementById('sourceFormat'),
    sourceDimensions: document.getElementById('sourceDimensions')
};

let originalImage = null;
let convertedImage = null;
let originalWidth = 0;
let originalHeight = 0;
let aspectRatio = 1;

// Event Listeners
els.fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
els.quality.addEventListener('input', updateQuality);
els.width.addEventListener('input', handleDimensionChange.bind(null, 'width'));
els.height.addEventListener('input', handleDimensionChange.bind(null, 'height'));
els.resetSize.addEventListener('click', resetSize);
els.downloadBtn.addEventListener('click', downloadImage);
els.dropZone.addEventListener('drop', handleDrop);
els.dropZone.addEventListener('dragover', e => e.preventDefault());
els.outputFormat.addEventListener('change', convertImage);

function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
}

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
    }

    els.sourceFormat.textContent = file.type.split('/')[1].toUpperCase();
    els.sourceWeight.textContent = formatSize(file.size);
    els.fileInfo.style.display = 'block';

    const reader = new FileReader();
    reader.onload = e => {
        originalImage = new Image();
        originalImage.onload = () => {
            originalWidth = originalImage.width;
            originalHeight = originalImage.height;
            aspectRatio = originalWidth / originalHeight;
            els.width.value = originalWidth;
            els.height.value = originalHeight;
            els.sourceDimensions.textContent = `${originalWidth} × ${originalHeight}px`;
            els.sourcePreview.src = originalImage.src;
            convertImage();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleDimensionChange(dimension) {
    if (els.keepRatio.checked) {
        if (dimension === 'width') {
            const newWidth = parseInt(els.width.value) || originalWidth;
            els.height.value = Math.round(newWidth / aspectRatio);
        } else {
            const newHeight = parseInt(els.height.value) || originalHeight;
            els.width.value = Math.round(newHeight * aspectRatio);
        }
    }
    convertImage();
}

function updateQuality() {
    els.qualityValue.textContent = els.quality.value + '%';
    if (originalImage) convertImage();
}

function resetSize() {
    els.width.value = originalWidth;
    els.height.value = originalHeight;
    convertImage();
}

function convertImage() {
    if (!originalImage) return;

    const width = parseInt(els.width.value) || originalWidth;
    const height = parseInt(els.height.value) || originalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(originalImage, 0, 0, width, height);

    const quality = els.quality.value / 100;
    convertedImage = canvas.toDataURL(els.outputFormat.value, quality);
    els.convertedPreview.src = convertedImage;

    fetch(convertedImage)
        .then(res => res.blob())
        .then(blob => {
            els.convertedWeight.textContent = formatSize(blob.size);
        });

    els.downloadBtn.disabled = false;
}

function downloadImage() {
    const extension = els.outputFormat.value.split('/')[1];
    const link = document.createElement('a');
    link.download = `image_convertie.${extension}`;
    link.href = convertedImage;
    link.click();
}

function formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}
