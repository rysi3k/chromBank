document.addEventListener('DOMContentLoaded', function(){
    var data = window.location.hash.substr(1);
    data = JSON.parse(decodeURIComponent(data));

    document.getElementById('title').innerHTML = data.title;
    document.getElementById('icon').src = data.image;
    document.getElementById('description').innerHTML = data.text;
});