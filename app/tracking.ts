import { v4 as uuidv4 } from "uuid"

// Tipos para perfil comportamental
type UserProfile = 'impulsivo' | 'analitico' | 'indeciso' | 'unknown';

interface TimelineEvent {
  eventName: string;
  timestamp: string;
  data?: any;
}

interface BrowserContext {
  userAgent: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  platform: string;
  connectionType?: string;
}

const getBrowserContext = (): BrowserContext => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    platform: navigator.platform,
    connectionType: (navigator as any)?.connection?.effectiveType || 'unknown'
  };
};

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('firepower_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('firepower_session_id', sessionId);
    localStorage.setItem('firepower_session_start', new Date().toISOString());
    localStorage.removeItem('firepower_replay_sent');
    initializeSessionTimeline();
  }
  return sessionId;
};

const safeSendBeacon = (url: string, data: object) => {
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } catch (e) {
    console.error('Erro ao usar sendBeacon:', e);
  }
};

const handleTracking = async (eventName: string, eventData: object = {}) => {
  const sessionId = getSessionId();

  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get('utm_source') || '';
  const utm_campaign = urlParams.get('utm_campaign') || '';
  const fbclid = urlParams.get('fbclid') || '';

  const browserContext = getBrowserContext();

  const payload = {
    eventName,
    sessionId,
    timestamp: new Date().toISOString(),
    utm_source,
    utm_campaign,
    fbclid,
    url: window.location.href,
    ...browserContext,
    ...eventData
  };

  addEventToTimeline(eventName, payload);
  updateUserProfile(eventName, payload);

  try {
    const response = await fetch('https://webhook-xls-production.up.railway.app/fire/power/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    sendPendingEvents();
    return true;
  } catch (error) {
    console.error('Erro ao enviar evento:', error);
    saveEventToLocalStorage(payload);
    return false;
  }
};

const initializeSessionTimeline = () => {
  localStorage.setItem('firepower_session_timeline', JSON.stringify([]));
};

const addEventToTimeline = (eventName: string, eventData: any) => {
  try {
    const timeline: TimelineEvent[] = JSON.parse(localStorage.getItem('firepower_session_timeline') || '[]');
    timeline.push({ eventName, timestamp: new Date().toISOString(), data: eventData });
    localStorage.setItem('firepower_session_timeline', JSON.stringify(timeline));
    if (timeline.length >= 10 && !localStorage.getItem('firepower_replay_sent')) {
      sendSessionReplay();
    }
  } catch (error) {
    console.error('Erro ao adicionar evento à timeline:', error);
  }
};

const sendSessionReplay = async () => {
  try {
    const sessionId = getSessionId();
    const timeline = JSON.parse(localStorage.getItem('firepower_session_timeline') || '[]');
    if (!timeline.length || localStorage.getItem('firepower_replay_sent')) return;

    const payload = { sessionId, timestamp: new Date().toISOString(), timeline };
    const response = await fetch('https://webhook-xls-production.up.railway.app/fire/power/session_replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    localStorage.setItem('firepower_replay_sent', 'true');
    console.log('Session replay enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar session replay:', error);
  }
};

const saveEventToLocalStorage = (eventData: object) => {
  try {
    const pendingEvents = JSON.parse(localStorage.getItem('firepower_pending_events') || '[]');
    pendingEvents.push(eventData);
    localStorage.setItem('firepower_pending_events', JSON.stringify(pendingEvents));
  } catch (error) {
    console.error('Erro ao salvar evento no localStorage:', error);
  }
};

const sendPendingEvents = async () => {
  try {
    const pendingEvents = JSON.parse(localStorage.getItem('firepower_pending_events') || '[]');
    if (!pendingEvents.length) return;

    const remainingEvents = [];
    for (const event of pendingEvents) {
      try {
        const response = await fetch('https://webhook-xls-production.up.railway.app/fire/power/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

        if (!response.ok) throw new Error();
      } catch {
        remainingEvents.push(event);
      }
    }
    localStorage.setItem('firepower_pending_events', JSON.stringify(remainingEvents));
  } catch (error) {
    console.error('Erro ao reenviar eventos pendentes:', error);
  }
};

const updateUserProfile = (eventName: string, eventData: any) => {
  try {
    let profile = JSON.parse(localStorage.getItem('firepower_user_profile') || '{}');
    const sessionStart = new Date(localStorage.getItem('firepower_session_start') || new Date().toISOString());
    const now = new Date();
    const timeOnSite = (now.getTime() - sessionStart.getTime()) / 1000;

    if (!profile.eventCounts) {
      profile = {
        sessionId: getSessionId(),
        firstVisit: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        profileType: 'unknown' as UserProfile,
        eventCounts: {
          page_view: 0,
          scroll_depth_25: 0,
          scroll_depth_50: 0,
          scroll_depth_75: 0,
          scroll_depth_100: 0,
          click_cta: 0,
          click_compra: 0,
          view_offer_section: 0,
          testimonial_image_click: 0
        },
        timeOnSite,
        maxScrollDepth: 0,
        utm_source: eventData.utm_source || '',
        utm_campaign: eventData.utm_campaign || '',
        fbclid: eventData.fbclid || ''
      };
    }

    if (profile.eventCounts.hasOwnProperty(eventName)) {
      profile.eventCounts[eventName]++;
    }

    if (eventName.startsWith('scroll_depth_')) {
      const depth = parseInt(eventName.split('_')[2]);
      if (depth > profile.maxScrollDepth) {
        profile.maxScrollDepth = depth;
      }
    }

    profile.timeOnSite = timeOnSite;
    profile.lastUpdate = new Date().toISOString();

    determineProfileType(profile);
    localStorage.setItem('firepower_user_profile', JSON.stringify(profile));

    if (shouldSendProfile(profile)) {
      sendUserProfile(profile);
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
  }
};

const determineProfileType = (profile: any) => {
  if (profile.eventCounts.click_cta > 0 && profile.maxScrollDepth <= 25 && profile.timeOnSite < 30) {
    profile.profileType = 'impulsivo';
  } else if (profile.maxScrollDepth >= 75 && (profile.eventCounts.testimonial_image_click > 0 || profile.timeOnSite > 60)) {
    profile.profileType = 'analitico';
  } else if (profile.eventCounts.view_offer_section > 0 && profile.eventCounts.click_compra === 0 && profile.timeOnSite > 45) {
    profile.profileType = 'indeciso';
  }
};

const shouldSendProfile = (profile: any): boolean => {
  const lastSent = localStorage.getItem('firepower_profile_last_sent');
  if (!lastSent) return true;
  const lastSentTime = new Date(lastSent).getTime();
  return (new Date().getTime() - lastSentTime) > 30000;
};

const sendUserProfile = async (profile: any) => {
  try {
    const response = await fetch('https://webhook-xls-production.up.railway.app/fire/power/session_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    localStorage.setItem('firepower_profile_last_sent', new Date().toISOString());
    console.log('Perfil do usuário enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar perfil do usuário:', error);
  }
};

const trackLastButtonClicked = (buttonId: string, buttonText: string) => {
  const lastButtonData = {
    id: buttonId,
    text: buttonText,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('firepower_last_button', JSON.stringify(lastButtonData));
  handleTracking('modal_inatividade_botao_clicado', lastButtonData);
};

const trackPurchaseClick = (plano: string, buttonId: string, buttonText: string) => {
  handleTracking('click_compra', { plano, buttonId, buttonText });
  trackLastButtonClicked(buttonId, buttonText);
};

const initializeAdvancedTracking = () => {
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const totalHeight = document.body.scrollHeight;
    const scrollPercentage = Math.floor((scrollPosition / totalHeight) * 100);
    const thresholds = [25, 50, 75, 100];

    const reachedThresholds = JSON.parse(localStorage.getItem('firepower_scroll_thresholds') || '[]');

    thresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && !reachedThresholds.includes(threshold)) {
        reachedThresholds.push(threshold);
        localStorage.setItem('firepower_scroll_thresholds', JSON.stringify(reachedThresholds));
        handleTracking(`scroll_depth_${threshold}`, { scrollPercentage, scrollPosition, totalHeight });
      }
    });
  });

  window.addEventListener('beforeunload', () => {
    const sessionStart = localStorage.getItem('firepower_session_start');
    if (sessionStart) {
      const startTime = new Date(sessionStart).getTime();
      const endTime = new Date().getTime();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);
      const durationFormatted = `${Math.floor(durationSeconds / 3600)}h ${Math.floor((durationSeconds % 3600) / 60)}m ${durationSeconds % 60}s`;

      const sessionId = getSessionId();
      const timeline = JSON.parse(localStorage.getItem('firepower_session_timeline') || '[]');
      const profile = JSON.parse(localStorage.getItem('firepower_user_profile') || '{}');

      const replayPayload = { sessionId, timestamp: new Date().toISOString(), timeline };

      safeSendBeacon('https://webhook-xls-production.up.railway.app/fire/power/session_replay', replayPayload);
      safeSendBeacon('https://webhook-xls-production.up.railway.app/fire/power/session_profile', profile);

      handleTracking('session_duration', {
        duration_seconds: durationSeconds,
        duration_formatted: durationFormatted
      });

      const lastButton = localStorage.getItem('firepower_last_button');
      if (lastButton) {
        handleTracking('last_button_before_unload', JSON.parse(lastButton));
      }
    }
  });

  handleTracking('page_view');
  sendPendingEvents();
};

export {
  handleTracking,
  sendSessionReplay,
  getBrowserContext,
  updateUserProfile,
  addEventToTimeline,
  sendUserProfile,
  sendPendingEvents,
  trackLastButtonClicked,
  trackPurchaseClick,
  initializeAdvancedTracking
};
