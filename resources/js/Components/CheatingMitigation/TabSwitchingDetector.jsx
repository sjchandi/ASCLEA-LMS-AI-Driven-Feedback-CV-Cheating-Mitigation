import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

const TabSwitchingDetector = ({ enabled, assessmentSubmissionId }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const time = new Date().toLocaleTimeString(); // Tinamad na ako mag change ng time sa laravel timestamp HAHHAHHAHA
      const message = document.hidden 
        ? `${time} - Student switched away from quiz` 
        : `${time} - Student returned to the quiz`;

    setEvents(prev => [...prev, message]);
    console.log(message);

      router.post(
          route("tab-switching.store"),
          {
            assessment_submission_id: assessmentSubmissionId,
            message: message, 
          },
          {
            preserveScroll: true,
            preserveState: true,
            showProgress: false,
          }
        );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return null; // no UI
};

export default TabSwitchingDetector;
TabSwitchingDetector.layout = null;
