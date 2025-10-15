document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
    const imageInput = document.getElementById('image-input');
    const imageToCrop = document.getElementById('image-to-crop');
    const cropBtn = document.getElementById('crop-btn');
    const exportBtn = document.getElementById('export-btn');
    const captureArea = document.getElementById('capture-area');
    const creditFooterForImage = document.getElementById('credit-footer-for-image');
    // 新增：获取 h1 标题元素
    const mainTitle = document.querySelector('#capture-area h1');

    if (!gridContainer || !modal || !exportBtn || !captureArea || !creditFooterForImage || !mainTitle) {
        console.error('错误：页面缺少必要的HTML元素！');
        return;
    }

    let currentCell = null;
    let cropper = null;

    gridContainer.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            currentCell = cell;
            modal.style.display = 'flex';
            imageInput.value = '';
            if (cropper) {
                cropper.destroy();
                cropper = null;
                imageToCrop.src = '';
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (cropper) { cropper.destroy(); cropper = null; }
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imageToCrop.src = event.target.result;
                if (cropper) { cropper.destroy(); }
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, viewMode: 1, background: false,
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    cropBtn.addEventListener('click', () => {
        if (cropper && currentCell) {
            const canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500,
                imageSmoothingQuality: 'high',
            });
            const imageElement = currentCell.querySelector('.cell-image');
            if (imageElement) {
                imageElement.src = canvas.toDataURL();
            }
            modal.style.display = 'none';
            if (cropper) { cropper.destroy(); cropper = null; }
        }
    });

    // 【最终版核心修改】
    exportBtn.addEventListener('click', () => {
        // 1. 在截图前，为标题“穿上”加大版样式
        mainTitle.classList.add('for-canvas');
        
        creditFooterForImage.style.display = 'block';
        exportBtn.style.display = 'none';
        
        const scale = window.devicePixelRatio > 2 ? window.devicePixelRatio : 3;

        html2canvas(captureArea, {
            backgroundColor: '#ffffff',
            useCORS: true,
            scale: scale,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-wota-life-final.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('生成图片失败:', err);
        }).finally(() => {
            // 3. 无论成功或失败，截图后都恢复原样
            mainTitle.classList.remove('for-canvas'); // 为标题“脱下”加大版样式
            creditFooterForImage.style.display = 'none';
            exportBtn.style.display = 'block';
        });
    });
});