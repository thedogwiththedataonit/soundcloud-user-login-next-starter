'use client';

import React from 'react';

const SoundCloudSignIn = () => {
  const handleSignIn = () => {
    // Redirect to our API route which will handle the OAuth flow
    window.location.href = '/api/auth/soundcloud';
  };

  return (
    <button
      onClick={handleSignIn}
      className="bg-[#ff5500] hover:bg-[#e64a00] text-white font-bold py-3 px-6 rounded-lg flex items-center gap-3 transition-colors duration-200 shadow-lg hover:shadow-xl"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="flex-shrink-0"
      >
        <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm2 0h1v-8.448l-.621-.857c-.178-.309-.392-.592-.621-.857l.242.857v9.305zm3-2.506c-.146-.434-.321-.852-.527-1.241l-.473 1.241v2.506h1v-2.506zm2-1.441c-.508-.479-1.103-.85-1.766-1.103l-.234.103c.663.253 1.258.624 1.766 1.103l.234-.103zm1-2.439c-.508-.479-1.103-.85-1.766-1.103l-.234.103c.663.253 1.258.624 1.766 1.103l.234-.103z"/>
      </svg>
      Sign in with SoundCloud
    </button>
  );
};

export default SoundCloudSignIn; 