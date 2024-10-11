const darkModeBtn = document.querySelector(".darkmode");
const body = document.querySelector("body")

let condition = 0;

darkModeBtn.addEventListener('click', (event)=> {
    event.preventDefault();
    event.target.classList.toggle('active');

    if (!body.classList.contains('darkmode')) {
        body.classList.toggle('darkmode');
    } else {
        event.target.classList.remove('active');
        body.classList.remove('darkmode');
    }
});