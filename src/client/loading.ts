export function toggleLoading() {
    const overlay = document.querySelector('.loading-overlay') as HTMLElement;
    const body = document.body;
    
    if (overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        body.classList.remove('overlay-active');
    } else {
        overlay.classList.add('active');
        body.classList.add('overlay-active');
    }
}
