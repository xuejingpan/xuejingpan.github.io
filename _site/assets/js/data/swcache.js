const resource = [
    /* --- CSS --- */
    '/xuejingpan.github.io/assets/css/style.css',

    /* --- PWA --- */
    '/xuejingpan.github.io/app.js',
    '/xuejingpan.github.io/sw.js',

    /* --- HTML --- */
    '/xuejingpan.github.io/index.html',
    '/xuejingpan.github.io/404.html',

    
        '/xuejingpan.github.io/categories/',
    
        '/xuejingpan.github.io/tags/',
    
        '/xuejingpan.github.io/archives/',
    
        '/xuejingpan.github.io/about/',
    

    /* --- Favicons & compressed JS --- */
    
    
        '/xuejingpan.github.io/assets/img/favicons/android-chrome-192x192.png',
        '/xuejingpan.github.io/assets/img/favicons/android-chrome-512x512.png',
        '/xuejingpan.github.io/assets/img/favicons/apple-touch-icon.png',
        '/xuejingpan.github.io/assets/img/favicons/favicon-16x16.png',
        '/xuejingpan.github.io/assets/img/favicons/favicon-32x32.png',
        '/xuejingpan.github.io/assets/img/favicons/favicon.ico',
        '/xuejingpan.github.io/assets/img/favicons/mstile-150x150.png',
        '/xuejingpan.github.io/assets/js/dist/categories.min.js',
        '/xuejingpan.github.io/assets/js/dist/commons.min.js',
        '/xuejingpan.github.io/assets/js/dist/home.min.js',
        '/xuejingpan.github.io/assets/js/dist/misc.min.js',
        '/xuejingpan.github.io/assets/js/dist/page.min.js',
        '/xuejingpan.github.io/assets/js/dist/post.min.js'
];

/* The request url with below domain will be cached */
const allowedDomains = [
    

    'localhost:4000',

    
        'chirpy-img.netlify.app',
    

    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    'polyfill.io'
];

/* Requests that include the following path will be banned */
const denyUrls = [];

