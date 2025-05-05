import puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import createClient from '@/lib/supabase';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Apply the stealth plugin to puppeteer
puppeteerExtra.use(StealthPlugin());

interface TranscriptionResult {
  success: boolean;
  meetingId: string;
  transcript?: string;
  error?: string;
}

export async function joinGoogleMeetAndTranscribe(
  meetingUrl: string,
  maxDurationMinutes: number = 60
): Promise<TranscriptionResult> {
  let browser: Browser | null = null;
  let meetingId = '';
  let captionInterval: NodeJS.Timeout;
  let saveInterval: NodeJS.Timeout;
  let heartbeatInterval: NodeJS.Timeout;
  let participantCheckInterval: NodeJS.Timeout;
  const transcriptParts: string[] = []; // Initialize transcript parts array
  
  // Define a function to clean up resources at the end
  const leaveAndCleanup = async (reason: string) => {
    console.log(`Leaving meeting because: ${reason}`);
    
    // Clear all intervals
    if (captionInterval) clearInterval(captionInterval);
    if (saveInterval) clearInterval(saveInterval);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (participantCheckInterval) clearInterval(participantCheckInterval);
    
    try {
      const supabase = await createClient();
      
      // Final save of transcript if we have transcription parts
      if (typeof transcriptParts !== 'undefined' && Array.isArray(transcriptParts)) {
        const finalTranscript = transcriptParts.join('\n');
        
        try {
          await supabase.from('meeting_transcripts').update({
            transcript: finalTranscript,
            status: reason.startsWith('Error:') ? 'error' : 'completed',
            error_message: reason.startsWith('Error:') ? reason.substring(7) : null,
            last_updated: new Date().toISOString(),
            end_time: new Date().toISOString(),
            exit_reason: reason
          }).eq('meeting_id', meetingId);
          console.log('Final transcript saved successfully');
        } catch (error) {
          console.error('Error saving final transcript:', error);
        }
      } else {
        // Just update status
        await supabase.from('meeting_transcripts').update({
          status: reason.startsWith('Error:') ? 'error' : 'completed',
          error_message: reason.startsWith('Error:') ? reason.substring(7) : null,
          last_updated: new Date().toISOString(),
          end_time: new Date().toISOString(),
          exit_reason: reason
        }).eq('meeting_id', meetingId);
      }
    } catch (dbError) {
      console.error('Error updating database during cleanup:', dbError);
    }
    
    // Try to leave the call if we have an active page
    if (browser) {
      try {
        const pages = await browser.pages();
        for (const page of pages) {
          if (!page.isClosed()) {
            try {
              await page.click('button[aria-label="Leave call"]').catch(() => {});
              console.log('Left the meeting');
            } catch (e) {
              // Ignore errors when trying to leave
            }
          }
        }
      } catch (e) {
        // Ignore errors when trying to close pages
      }
      
      // Close the browser after a short delay
      setTimeout(async () => {
        if (browser) {
          await browser.close();
          browser = null;
        }
      }, 2000);
    }
  };
  
  try {
    // Extract meeting ID from URL
    const meetingUrlObj = new URL(meetingUrl);
    if (meetingUrlObj.hostname === 'meet.google.com') {
      // Extract just the meeting code without any URL parameters
      meetingId = meetingUrlObj.pathname.replace('/', '').split('?')[0];
      console.log(meetingId);
      console.log("meeting url", meetingUrl);
    } else {
      throw new Error('Invalid Google Meet URL');
    }
    
    console.log(`Starting browser automation for meeting: ${meetingId}`);
    
    // Launch browser using puppeteer-extra with stealth plugin
    browser = await puppeteerExtra.launch({
      headless: false,
      args: [
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-infobars',
        '--no-sandbox',
        // '--disable-setuid-sandbox',
        // '--use-fake-ui-for-media-stream', // Auto-allow camera/mic permissions
        // '--use-fake-device-for-media-stream', // Use fake media devices
        // '--disable-blink-features=AutomationControlled', // Disable automation detection
      ],
      defaultViewport: { width: 1280, height: 720 },
      // ignoreDefaultArgs: ['--mute-audio'], // Don't mute audio
    });

    console.log('Browser launched successfully');
    
    // Detect browser disconnection events
    browser.on('disconnected', () => {
      console.log('Browser was disconnected');
    });
    
    const page = (await browser.pages())[0];
    console.log('Got browser page');
    
    // Set up audio/video permissions
    await page.evaluateOnNewDocument(() => {
      // Override permissions API
      const originalQuery = window.navigator.permissions.query;
      // @ts-ignore
      window.navigator.permissions.query = (parameters: any) => {
        if (parameters.name === 'microphone' || parameters.name === 'camera') {
          return Promise.resolve({ state: 'granted' });
        }
        return originalQuery(parameters);
      };
      
      // Override getUserMedia
      const enumerateDevices = navigator.mediaDevices.enumerateDevices;
      navigator.mediaDevices.enumerateDevices = async () => {
        const devices = await enumerateDevices.call(navigator.mediaDevices);
        if (!devices.some(device => device.kind === 'audioinput')) {
          devices.push({
            deviceId: 'default-audio-input',
            kind: 'audioinput',
            label: 'Default Audio Input',
            groupId: '',
            toJSON: () => {}
          });
        }
        if (!devices.some(device => device.kind === 'videoinput')) {
          devices.push({
            deviceId: 'default-video-input',
            kind: 'videoinput',
            label: 'Default Video Input',
            groupId: '',
            toJSON: () => {}
          });
        }
        return devices;
      };
    });

    // Override more automation detection flags
    await page.evaluateOnNewDocument(() => {
      // Pass webdriver check
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Overwrite the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          // This just needs to have `length > 0` for the current purpose.
          return [1, 2, 3, 4, 5];
        },
      });
      
      // Overwrite the `languages` property to use a custom getter.
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    // Go to Google Meet
    console.log('Navigating to Google Meet page:', meetingUrl);
    
    // First navigate to Google for cookies
    // await page.goto('https://accounts.google.com', { waitUntil: 'networkidle2' });
    
    // // Check if we need to sign in
    // const signInButton = await page.$('a[href*="signin"]');
    // if (signInButton) {
    //   console.log('Not signed in. Please sign in manually in the browser window.');
    //   // Wait for manual sign-in (up to 2 minutes)
    //   await page.waitForNavigation({ timeout: 120000, waitUntil: 'networkidle2' })
    //     .catch(() => console.log('Timed out waiting for sign-in. Continuing anyway...'));
    // }
    
    // Then navigate to Meet URL
    await page.goto(meetingUrl, { waitUntil: 'networkidle2'});
    console.log('Navigated to Google Meet page');
    
    // Check URL again after potential redirects
    const finalUrl = page.url();
    console.log('Final URL after waiting:', finalUrl);
    // Log the current URL
    console.log('Current URL:', page.url());

    // Wait for the UI to load - using a more reliable selector
    try {
      console.log('Waiting for Google Meet interface elements...');
      
      // Wait for any of these elements that might appear in Google Meet UI
      await Promise.race([
        page.waitForSelector('button[aria-label="Join now"]', { timeout: 30000 })
          .then(() => console.log('Found: Join now button')),
        page.waitForSelector('button[aria-label="Join"]', { timeout: 30000 })
          .then(() => console.log('Found: Join button')),
        page.waitForSelector('[data-is-muted]', { timeout: 30000 })
          .then(() => console.log('Found: Mute control')),
        page.waitForSelector('.zWfAib', { timeout: 30000 }) // Meet UI Container
          .then(() => console.log('Found: Meet UI container')),
        page.waitForSelector('.crqnQb', { timeout: 30000 }) // Another Meet UI element
          .then(() => console.log('Found: Meet crqnQb element')),
        page.waitForSelector('.NzPR9b', { timeout: 30000 }) // Bottom toolbar
          .then(() => console.log('Found: Bottom toolbar')),
        // Add selector for error message about not being able to join
        page.waitForSelector('.GvcuGe', { timeout: 30000 }) // Error message container
          .then(() => console.log('Found: Meet error message'))
      ]);
      
      console.log('Meet interface detected');
      
      // Check for error messages
      const errorMessage = await page.$('.GvcuGe');
      if (errorMessage) {
        const errorText = await page.evaluate(el => el.textContent, errorMessage);
        console.log('Found error message:', errorText);
        if (errorText && (
          errorText.includes("can't join") || 
          errorText.includes("cannot join") || 
          errorText.includes("not allowed")
        )) {
          throw new Error(`Google Meet error: ${errorText}`);
        }
      }
      
      // Detect if we need to enter a name first (happens for some meetings)
      try {
        const nameInput = await page.$('input[aria-label="Your name"]');
        if (nameInput) {
          console.log('Name input detected, entering name');
          await page.type('input[aria-label="Your name"]', 'Meeting Bot');
        }
      } catch (nameError) {
        console.log('No name input detected');
      }
      
      // Try to turn off camera and microphone if controls are available
      try {
        console.log('Attempting to mute camera and microphone');
        
        // Try different selectors for camera and mic buttons
        const cameraButtons = await page.$$('[aria-label*="camera"], [aria-label*="Camera"], [data-is-muted]');
        if (cameraButtons.length > 0) {
          await cameraButtons[0].click();
          console.log('Clicked camera button');
        }
        
        const micButtons = await page.$$('[aria-label*="microphone"], [aria-label*="Microphone"], [data-is-muted="true"]');
        if (micButtons.length > 0) {
          await micButtons[0].click();
          console.log('Clicked microphone button');
        }
      } catch (error) {
        console.warn('Could not manipulate camera/mic controls, continuing anyway');
      }
      
      // Look for either "Join now" or "Join" or "Ask to join" button with more flexible selectors
      console.log('Looking for join button');
      const joinButtonSelectors = [
        'button[aria-label="Join now"]',
        'button[aria-label="Join"]',
        'button[aria-label="Ask to join"]'
      ];
      
      let joinButton = null;
      for (const selector of joinButtonSelectors) {
        joinButton = await page.$(selector);
        if (joinButton) {
          console.log(`Found join button with selector: ${selector}`);
          break;
        }
      }
      
      // If no button found with aria-labels, try to find buttons by evaluating their text content
      if (!joinButton) {
        console.log('Trying to find join button by text content');
        const buttonByText = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(button => {
            const text = button.textContent || '';
            return text.includes('Join') || text.includes('join') || text.includes('Ask to join');
          });
        });
        
        // Check if a button was found and convert it to an ElementHandle that can be clicked
        if (buttonByText && await page.evaluate(el => el instanceof HTMLElement, buttonByText)) {
          joinButton = buttonByText as any;
          console.log('Found join button by text content');
        }
      }
      
      // Click the join button if found
      if (joinButton) {
        try {
          await joinButton.click();
          console.log('Clicked join button');
          
          // Wait a bit after joining to make sure we're in
          await new Promise(resolve => setTimeout(resolve, 5000));
          console.log('Joined the meeting');
        } catch (clickError) {
          console.warn('Error clicking join button:', clickError);
          
          // Try alternative click method using page.evaluate
          try {
            await page.evaluate(el => el.click(), joinButton);
            console.log('Clicked join button using evaluate');
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log('Joined the meeting');
          } catch (evalClickError) {
            console.warn('Failed to click join button using evaluate:', evalClickError);
          }
        }
      } else {
        console.warn('Join button not found, attempting to continue');
      }
    
    } catch (error) {
      console.warn('Timed out waiting for expected UI elements:', error);
      console.log('Attempting to continue anyway');
    }

    // Try to turn on captions if available
    try {
      await page.waitForSelector('button[aria-label="Turn on captions"]', { timeout: 10000 });
      await page.click('button[aria-label="Turn on captions"]');
      console.log('Turned on captions');
    } catch (error) {
      console.warn('Captions button not found or already enabled');
    }

    // Set up transcript collection
    const transcriptParts: string[] = [];
    
    // Function to collect captions that handles detached frames
    const collectCaptions = async () => {
      try {
        // Check if page is still valid
        if (!page.isClosed()) {
          try {
            const captionsContainer = await page.$('.VIpgJd-fmcmS');
            if (captionsContainer) {
              try {
                const captionText = await page.evaluate(el => el.textContent, captionsContainer);
                if (captionText && captionText.trim()) {
                  console.log(`Caption captured: ${captionText.trim().substring(0, 30)}...`);
                  transcriptParts.push(`[${new Date().toISOString()}] ${captionText.trim()}`);
                }
              } catch (evalError) {
                console.warn('Error evaluating caption text:', evalError);
              }
            }
          } catch (selectorError) {
            console.warn('Error finding captions container:', selectorError);
          }
        } else {
          console.log('Page is closed, stopping caption collection');
          clearInterval(captionInterval);
        }
      } catch (error) {
        console.warn('Error in caption collection, might be a detached frame:', error);
        // If we detect a detached frame error, stop the interval
        if (error instanceof Error && error.message.includes('detached')) {
          console.log('Detected detached frame, stopping caption collection');
          clearInterval(captionInterval);
        }
      }
    };

    // Function to check if everyone has left the meeting
    const checkIfEveryoneLeft = async () => {
      try {
        if (!page.isClosed()) {
          // Several ways to detect if everyone left:
          // 1. Look for "You're the only one here" message
          let aloneMessage = false;
          
          try {
            // Using page.evaluate to find text content is more reliable than text selectors
            aloneMessage = await page.evaluate(() => {
              const pageText = document.body.innerText;
              return pageText.includes("You're the only one here") || 
                     pageText.includes("You are the only one here") ||
                     pageText.includes("No one else is here");
            });
          } catch (evalError) {
            console.warn('Error checking for alone message:', evalError);
          }
          
          // 2. Look for participant count showing only 1 person
          let participantCount = null;
          try {
            participantCount = await page.evaluate(() => {
              // Try different selectors for participant count
              const countElement = 
                document.querySelector('[data-participant-count]') || 
                document.querySelector('[aria-label*="participant"]') ||
                document.querySelector('[data-is-muted]')?.closest('[role="button"]')?.previousElementSibling;
              
              if (countElement) {
                const countText = countElement.textContent || '';
                // Extract just the number from text like "1", "You", "You + 1", etc.
                const count = parseInt(countText.replace(/\D/g, '')) || 0;
                return count <= 1 ? 1 : count;
              }
              
              // Additional check: Look for a "You" text that indicates being alone
              const youIndicator = 
                Array.from(document.querySelectorAll('div, span')).find(el => 
                  el.textContent === 'You' && 
                  el.closest('[role="button"]')
                );
                
              return youIndicator && !document.querySelector('[aria-label*="participant"], [data-participant-count]') ? 1 : null;
            });
          } catch (countError) {
            console.warn('Error checking participant count:', countError);
          }

          // 3. Check for "call ended" screen or similar messages
          let callEndedScreen = false;
          try {
            callEndedScreen = await page.evaluate(() => {
              const pageText = document.body.innerText;
              return pageText.includes("Call ended") || 
                     pageText.includes("call has ended") ||
                     pageText.includes("The meeting has ended") ||
                     pageText.includes("meeting is over") ||
                     pageText.includes("left the meeting") ||
                     pageText.includes("removed from the meeting");
            });
          } catch (endedError) {
            console.warn('Error checking for call ended screen:', endedError);
          }

          console.log(`Participant check: aloneMessage=${aloneMessage}, participantCount=${participantCount}, callEndedScreen=${callEndedScreen}`);
          
          // If any of these conditions are true, everyone else has left
          if (aloneMessage || participantCount === 1 || callEndedScreen) {
            console.log('Everyone has left the meeting - bot will exit automatically');
            
            // Leave the meeting and clean up
            await leaveAndCleanup('Everyone left the meeting');
            return true;
          }
        }
      } catch (error) {
        console.warn('Error checking if everyone left:', error);
      }
      return false;
    };

    // Start collecting captions every 2 seconds
    captionInterval = setInterval(collectCaptions, 2000);
    
    // Start checking if everyone left the meeting every 30 seconds
    participantCheckInterval = setInterval(checkIfEveryoneLeft, 30000);
    
    // Add a heartbeat check to make sure the browser is still running
    heartbeatInterval = setInterval(async () => {
      try {
        if (browser && !browser.process()?.killed) {
          console.log(`Heartbeat check: Browser still running for meeting ${meetingId}`);
          
          // Also check if we can still interact with the page
          if (!page.isClosed()) {
            try {
              const pageUrl = await page.url();
              console.log(`Current page URL: ${pageUrl}`);
            } catch (urlError) {
              console.log('Unable to get page URL: possible disconnection');
            }
          } else {
            console.log('Page is closed but browser is still running');
          }
        } else {
          console.log('Browser process appears to be closed or killed');
        }
      } catch (error) {
        console.warn('Error in heartbeat check:', error);
      }
    }, 60000); // Check every minute
    
    // Save initial meeting info to database
    const supabase = await createClient();
    const { error: createError } = await supabase.from('meeting_transcripts').insert({
      meeting_id: meetingId,
      url: meetingUrl,
      status: 'in_progress',
      transcript: '',
      start_time: new Date().toISOString()
    });

    if (createError) {
      console.error('Error creating meeting record:', createError);
    }

    // Set up an interval to periodically save the transcript
    saveInterval = setInterval(async () => {
      const transcript = transcriptParts.join('\n');
      
      // Update the transcript in the database
      const { error: updateError } = await supabase.from('meeting_transcripts').update({
        transcript,
        last_updated: new Date().toISOString()
      }).eq('meeting_id', meetingId);

      if (updateError) {
        console.error('Error updating transcript:', updateError);
      }
    }, 30000); // Save every 30 seconds
    
    // Set a timeout to end the meeting after the specified duration
    setTimeout(async () => {
      await leaveAndCleanup('Maximum duration reached');
    }, maxDurationMinutes * 60 * 1000);

    // Return success with meeting ID
    return {
      success: true,
      meetingId,
    };
  } catch (error: any) {
    console.error('Puppeteer automation error:', error);
    
    // Use our leaveAndCleanup function for error cases
    try {
      await leaveAndCleanup(`Error: ${error.message}`);
    } catch (dbError) {
      console.error('Failed to update error status in database:', dbError);
    }
    
    return {
      success: false,
      meetingId,
      error: error.message
    };
  } finally {
    // We no longer close the browser in the finally block
    // This allows the browser to stay open for the duration of the meeting
  }
} 