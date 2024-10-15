const dropContainer = document.getElementById("dropContainer");
const fileInput = document.getElementById("fileSelectorBtn");
const folderInput = document.getElementById("folderSelectorBtn");
const form = document.getElementById("imageForm");
const tableBody = document.getElementById("tableBody");

dropContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
}, false);

dropContainer.addEventListener("dragenter", () => {
    dropContainer.classList.add("drag-active");
});

dropContainer.addEventListener("dragleave", () => {
    dropContainer.classList.remove("drag-active");
});

dropContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    dropContainer.classList.remove("drag-active");

    const files = e.dataTransfer.files;

    // Если перетаскиваются только файлы
    if (files.length > 0) {
        fileInput.files = files;
    }
});

// Определение функции getRequest
function getRequest(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    let url = document.location;
    let route = "/flaskwebgui-keep-server-alive";
    let interval_request = 3 * 1000; // 3 seconds

    // Функция для поддержания активности сервера
    function keep_alive_server() {
        getRequest(url + route)
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    }

    // Правильный вызов setInterval
    setInterval(keep_alive_server, interval_request);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
    }

    for (let i = 0; i < folderInput.files.length; i++) {
        formData.append('images', folderInput.files[i]);
    }

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Отладочный вывод
        if (data.error) {
            console.log("Error uploading images!", data.error);
        } else {
            tableBody.innerHTML = '';
            data.forEach(imageData => {
                const newRow = tableBody.insertRow(-1);
                newRow.insertCell(0).textContent = imageData.filename;
                newRow.insertCell(1).textContent = imageData.size;
                newRow.insertCell(2).textContent = imageData.dpi;
                newRow.insertCell(3).textContent = imageData.mode;
                newRow.insertCell(4).textContent = imageData.compression;
            });
        }
    })
    .catch(error => console.error('Error uploading images:', error));
});