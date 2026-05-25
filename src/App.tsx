import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Your AI Chatbot Website is Ready!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Visit <strong>index.html</strong> to see your complete website with all the premium features.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-3">Features Included:</h2>
          <ul className="text-left space-y-2 text-sm">
            <li>✨ Animated hero section with gradient text</li>
            <li>🤖 Interactive chatbot demo</li>
            <li>📊 Dynamic pricing table</li>
            <li>📝 Advanced contact form</li>
            <li>📱 Fully responsive design</li>
            <li>🎨 Premium animations & effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;