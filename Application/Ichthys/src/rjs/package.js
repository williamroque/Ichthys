document.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();

    [...e.dataTransfer.files]
        .forEach(f => {
            if (f.path.endsWith('.ichs')) {
                ipcRenderer.sendSync('install-package', f.path);
            }
        });

    overlay.classList.add('hide');
});

document.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('dragenter', e => {
    e.preventDefault();

    overlay.classList.remove('hide');
});

document.addEventListener('dragleave', e => {
    e.preventDefault();

    if (e.clientX === 0 && e.clientY === 0) {
        overlay.classList.add('hide');
    }
});
