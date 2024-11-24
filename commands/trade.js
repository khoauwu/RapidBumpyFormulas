const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'trade',
  description: 'Chuyển đổi tiền từ USD sang VND',
  usage: '[prefix]trade <số tiền USD>',
  async execute(message, args) {
    const prefix = '.'; // Thay đổi prefix ở đây

    if (message.content.startsWith(`${prefix}trade`)) {
      if (!args[0] || isNaN(parseFloat(args[0]))) {
        return message.reply('Vui lòng cung cấp số tiền USD để chuyển đổi.');
      }

      const usdAmount = parseFloat(args[0]);

      try {
        // Gọi API để lấy tỷ giá USD/VND
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const vndRate = data.rates.VND;

        const vndAmount = usdAmount * vndRate;

        // Định dạng số tiền VND
        const formatVND = (amount) => {
          if (amount >= 1000) {
            return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k';
          }
          return amount.toString();
        };

        const formattedVND = formatVND(vndAmount);

        // Tạo embed thông báo kết quả chuyển đổi
        const convertEmbed = new EmbedBuilder()
          .setColor('#2d2d31')
          .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
          .setDescription(`**${usdAmount.toFixed(2)} USD = ${formattedVND} VND **`);

        await message.reply({ embeds: [convertEmbed] });
      } catch (error) {
        console.error(error);
        message.reply('Có lỗi xảy ra khi lấy tỷ giá. Vui lòng thử lại sau.');
      }
    }
  },
};
