import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://octopus-app-afr3m.ondigitalocean.app/Decoder/api/get/all/latest/readings');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let text = await response.text();

    // Replace ObjectId and ISODate formats with valid JSON
    text = text.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
    text = text.replace(/ISODate\("([^"]+)"\)/g, '"$1"');

    const rawData = JSON.parse(text);

    // Process rawData to get the latest readings for each device
    let sensors = rawData.reduce((acc, curr) => {
      if (!acc[curr.deviceName]) {
        acc[curr.deviceName] = [];
      }

      // Convert time string to Date object, if needed
      if (curr.time && typeof curr.time === 'string') {
        curr.time = new Date(curr.time);
      }

      acc[curr.deviceName].push(curr);
      return acc;
    }, {});

    function getLastReading(deviceName) {
      // Assuming the last reading is at the last index (latest timestamp)
      return sensors[deviceName][sensors[deviceName].length - 1];
    }

    let alerts = [];

    // Check each device for temperature and people count alerts
    for (const [deviceName, readings] of Object.entries(sensors)) {
      const lastReading = getLastReading(deviceName);
      const { type, data } = lastReading;
      if (type === 1) {
        const temperature = parseFloat(data.split(',')[0]);
        if (temperature > 30.5) {
          alerts.push(`Sensor ${deviceName} recorded high temperature of ${temperature}°C.`);
        }
      } else if (type === 2) {
        const peopleCount = parseInt(data, 10);
        if (peopleCount > 4) {
          alerts.push(`Sensor ${deviceName} recorded high people count of ${peopleCount}.`);
        }
      }
    }

    if (alerts.length > 0) {
      const message = alerts.join('\n');
      const content = {
        to: process.env.EMAIL_TO,
        from: process.env.SENDGRID_EMAIL,
        subject: `Alert from Sensor Monitoring System`,
        text: message,
      };

      await sgMail.send(content);
      res.status(200).json({ message: 'Alert email sent successfully' });
    } else {
      res.status(200).json({ message: 'No alerts to send' });
    }
  } catch (error) {
    console.error("Error fetching sensor data or sending email", error);
    res.status(500).json({ error: 'Error processing sensor data' });
  }
};