if (location.pathname == '/profile.html') {
    location.replace('/profile/');
}
if (location.pathname == '/writing.html') {
    location.replace('/profile/writing.html');
}
if (location.pathname == '/speaking.html') {
    location.replace('/profile/speaking.html');
}
if (location.pathname == '/contact.html') {
    location.replace('/contact/');
}
if (location.pathname.indexOf('/blog/') === 0) {
    location.replace('https://inoccu.net' + location.pathname);
}