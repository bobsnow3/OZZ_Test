// ВНИМАНИЕ: Когда Вы добавите новые фото или измените старые, 
// просто поменяйте номер версии (например, на v18, затем v19 и т.д.).
// Это даст команду телефону удалить старый кэш и скачать всё заново.
const CACHE_NAME = 'ozz-test-v18'; 

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Сначала обязательно и строго кэшируем основные файлы (HTML, иконки)
      await cache.addAll(ASSETS);

      // 2. Теперь загружаем фотографии. 
      // Создаем массив задач для скачивания фото с 1 по 700
      const photoPromises = [];
      
      for (let i = 1; i <= 700; i++) {
        let url = `./images/${i}.png`;
        
        // Пытаемся скачать файл. 
        let p = fetch(url).then(response => {
          // Если файл существует (ответ 200 OK), кладем его в кэш
          if (response.ok) {
            return cache.put(url, response);
          }
        }).catch(() => {
          // Если файла нет или моргнул интернет — игнорируем ошибку и идем дальше
        });
        
        photoPromises.push(p);
      }
      
      // Ждем завершения проверки и скачивания всех фото
      await Promise.all(photoPromises);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
  // Удаляем старые версии кэша, если имя CACHE_NAME изменилось
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      // Отдаем файл из памяти телефона. Если его там нет — пробуем взять из интернета.
      return response || fetch(e.request).catch(() => {});
    })
  );
});