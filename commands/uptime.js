const os = require('os');
const moment = require('moment-timezone');

module.exports = {
  name: 'uptime',
  description: 'Displays the bot\'s uptime in Vietnam time',
  aliases: ['ut'],
  usage: '[prefix]uptime',
  execute(message, args) {
    const prefix = '.'; // Thay đổi prefix ở đây
    if (message.content.startsWith(`${prefix}uptime`) || message.content.startsWith(`${prefix}ut`)) {
      const uptime = process.uptime();
      const now = moment().tz('Asia/Ho_Chi_Minh');
      const startTime = moment().subtract(uptime, 'seconds').tz('Asia/Ho_Chi_Minh');

      let uptimeString = '';
      const duration = moment.duration(now.diff(startTime));
      const days = Math.floor(duration.asDays());
      const hours = Math.floor(duration.asHours()) % 24;
      const minutes = Math.floor(duration.asMinutes()) % 60;
      const seconds = Math.floor(duration.asSeconds()) % 60;

      if (days > 0) {
        uptimeString += `${days} ngày, `;
      }
      if (hours > 0) {
        uptimeString += `${hours} giờ, `;
      }
      if (minutes > 0) {
        uptimeString += `${minutes} phút, `;
      }
      uptimeString += `${seconds} giây`;

      message.reply(`Bot đã hoạt động trong \`${uptimeString}\` (theo giờ **Việt Nam**).`);
    }
  },
};