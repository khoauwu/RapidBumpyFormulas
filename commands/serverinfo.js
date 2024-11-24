const { EmbedBuilder } = require('discord.js');
const config = require(`../config.json`);

module.exports = {
  name: 'serverinfo',
  description: 'Hiển thị thông tin về máy chủ',
  usage: '[prefix]serverinfo',
  execute(message, args) {
    const prefix = '.'; // Thay đổi prefix ở đây

    if (message.content.startsWith(`${prefix}serverinfo`)) {
      const { guild } = message;

      const serverEmbed = new EmbedBuilder()
        .setColor('#2d2d31')
        .setTitle(`Thông tin về máy chủ ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: 'ID máy chủ', value: guild.id, inline: true },
          { name: 'Số kênh', value: guild.channels.cache.size.toString(), inline: true },
          { name: 'Số vai trò', value: guild.roles.cache.size.toString(), inline: true },
          { name: 'Số thành viên', value: guild.memberCount.toString(), inline: true },
          { name: 'Chủ sở hữu', value: guild.owner?.user.tag || 'Không xác định', inline: true },
          { name: 'Ngày tạo', value: guild.createdAt.toLocaleString('vi-VN'), inline: true }
        )
        .setFooter({ text: `${message.client.user.username}`, iconURL: 'https://cdn.discordapp.com/attachments/1262131507636473856/1286365827389587466/images.jpg?ex=66eda508&is=66ec5388&hm=3019eba665d166552638542ccb7b37dd1020eea3a3e99262a81b9c273908bd7d&' })
        .setTimestamp();

      message.channel.send({ embeds: [serverEmbed] });
    }
  },
};