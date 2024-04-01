import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function fetchAndSanitizeData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  let text = await response.text();
  text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"').replace(/ISODate\("([^"]+)"\)/g, '"$1"');
  return JSON.parse(text);
}

module.exports = async (req, res) => {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch and sanitize the notification settings
    const settings = await fetchAndSanitizeData('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/notification');
    const config = settings[0];
    const nextExecutionTime = new Date(config.nextExecutionTime);

    // Check if the current time has passed the next execution time
    if (new Date() >= nextExecutionTime) {
      // Fetch and sanitize the latest sensor readings
      const rawData = await fetchAndSanitizeData('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/latest/readings');
      
      // Process the sensor data and check for any conditions that meet the alert criteria
      let alerts = [];

      // Process rawData to get the latest readings for each device
      let sensors = rawData.reduce((acc, curr) => {
        if (!acc[curr.deviceName]) {
          acc[curr.deviceName] = [];
        }
        if (curr.time && typeof curr.time === 'string') {
          curr.time = new Date(curr.time);
        }
        acc[curr.deviceName].push(curr);
        return acc;
      }, {});

      // Get the last reading for each sensor
      for (const deviceName in sensors) {
        const lastReading = sensors[deviceName][sensors[deviceName].length - 1];
        const { type, data } = lastReading;

        if (type === 1) {
          const temperature = parseFloat(data.split(',')[0]);
          if (temperature < parseFloat(config.lowerTemperatureThreshold)) {
            alerts.push(`Sensor ${deviceName} recorded a temperature of ${temperature}°C, which is lower than the threshold limit of ${config.lowerTemperatureThreshold}°C.`);
          } else if (temperature > parseFloat(config.upperTemperatureThreshold)) {
              alerts.push(`Sensor ${deviceName} recorded a temperature of ${temperature}°C, which is higher than the threshold limit of ${config.upperTemperatureThreshold}°C.`);
          }
        } else if (type === 2) {
          const peopleCount = parseInt(data, 10);
          if (peopleCount > config.peopleCountThreshold) {
            alerts.push(`Sensor ${deviceName} recorded high people count of ${peopleCount}.`);
          }
        }
      }

      // Send out the alerts
      if (alerts.length > 0) {
        const message = `${config.messageBody}\n\n${alerts.join('\n')}`;
        const mailOptions = {
          to: config.notifcationRecipients,
          from: process.env.SENDGRID_EMAIL,
          subject: `Alert from Sensor Monitoring System`,
          text: message,
        };
        try {
          await sgMail.send(mailOptions);
          console.log('Email sent successfully');
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
        } else {
          console.log('Scheduler ran, but no alerts were triggered. Thresholds not met.');
        }

      // Calculate the next execution time
      const intervalMilliseconds = config.interval * 60000; // Convert mins to milliseconds
      const newNextExecutionTime = new Date(Date.now() + intervalMilliseconds).toISOString();

      // Update the next execution time in the database
      await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/post/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, nextExecutionTime: newNextExecutionTime }),
      });
    }

    res.status(200).json({ message: 'Scheduler ran successfully' });
  } catch (error) {
    console.error("Error with scheduler function", error);
    res.status(500).json({ error: 'Error with scheduler function' });
  }
};