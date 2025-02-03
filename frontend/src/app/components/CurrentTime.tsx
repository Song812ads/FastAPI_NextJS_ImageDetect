
'use client';
import React, { useState, useEffect } from 'react';

// Define the prop types for the CurrentTime component
interface CurrentTimeProps {
  onDataChange: (data: string) => void; // Function that accepts a Date object
}

const CurrentTime: React.FC<CurrentTimeProps> = ({ onDataChange }) => {

  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      const timeNew = newTime.toLocaleDateString('en-GB') + "-" + newTime.toLocaleTimeString('en-GB')
      setCurrentTime(timeNew); // Update the time every second
      onDataChange(timeNew); // Pass updated time to parent
    }, 1000);

    // Clean up the timer when the component unmounts
    return () => clearInterval(timer);
  }, [onDataChange, currentTime]); // Include currentTime and onDataChange in the dependency array

  return (
    <div className="mt-5">
      <span suppressHydrationWarning>
        {!currentTime
          ? "Current Date and Time: Loading..."
          : "Current Date-Time: " + currentTime}
      </span>
    </div>
  );
};

export default CurrentTime;
