import React from 'react';

const WhatsAppFloat: React.FC = () => {
  const phoneNumber = "905419407534";
  const message = "Merhaba! Scarwey hakkında bilgi almak istiyorum.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
      title="WhatsApp ile iletişime geç"
    >
       <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.25.59 4.45 1.71 6.38l-1.83 6.68 6.87-1.8c1.87.99 3.97 1.51 6.05 1.51h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.74-9.05-2.41-2.41-5.63-3.74-9.05-3.74zm0 23.5c-1.73 0-3.43-.46-4.92-1.33l-.35-.2-4.07 1.07 1.08-3.95-.22-.36c-1.1-1.78-1.68-3.83-1.68-5.93 0-6.26 5.09-11.35 11.35-11.35 3.03 0 5.88 1.18 8.03 3.32s3.32 5 3.32 8.03c0 6.26-5.09 11.35-11.35 11.35zm6.27-8.62c-.34-.17-2.01-.99-2.32-1.1-.31-.11-.54-.17-.77.17-.23.34-.88 1.1-1.08 1.33-.2.23-.4.25-.74.08-.34-.17-1.43-.53-2.73-1.7-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.08-.17-.77-1.86-1.05-2.55-.27-.65-.55-.56-.77-.57h-.66c-.23 0-.6.08-.91.43s-1.19 1.17-1.19 2.84 1.22 3.3 1.39 3.53c.17.23 2.41 3.68 5.85 5.16.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.01-.82 2.29-1.61.29-.8.29-1.49.2-1.61-.08-.11-.31-.17-.65-.34z"/>
  </svg>
    </a>
  );
};

export default WhatsAppFloat;
