import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export const ButtonTest: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClicked, setLastClicked] = useState('');

  const handleClick = (buttonName: string) => {
    setClickCount(prev => prev + 1);
    setLastClicked(buttonName);
    console.log(`Button "${buttonName}" clicked!`);
  };

  return (
    <div className="p-8 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Button Test Component</h2>
      
      <div className="space-y-4">
        <Button 
          onClick={() => handleClick('Primary')}
          className="w-full"
          style={{ pointerEvents: 'auto' }}
        >
          Primary Button
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleClick('Outline')}
          className="w-full"
          style={{ pointerEvents: 'auto' }}
        >
          Outline Button
        </Button>
        
        <Button 
          variant="secondary"
          onClick={() => handleClick('Secondary')}
          className="w-full"
          style={{ pointerEvents: 'auto' }}
        >
          Secondary Button
        </Button>
        
        <button
          onClick={() => handleClick('Native')}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          style={{ pointerEvents: 'auto' }}
        >
          Native HTML Button
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <p><strong>Click Count:</strong> {clickCount}</p>
        <p><strong>Last Clicked:</strong> {lastClicked || 'None'}</p>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>If buttons are not responding, check:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Browser console for errors</li>
          <li>CSS pointer-events property</li>
          <li>Z-index conflicts</li>
          <li>Overlapping elements</li>
        </ul>
      </div>
    </div>
  );
};

