const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const { getLastDeletedMessage } = require('../events/messageDelete'); // Lấy hàm từ file messageDelete.js

module.exports = {
    name: 'snipe',
    description: 'Hiển thị tin nhắn đã bị xóa gần nhất.',
    async execute(message) {
        const lastDeletedMessage = getLastDeletedMessage(); // Lấy tin nhắn đã bị xóa gần nhất

        if (!lastDeletedMessage) {
            return message.reply('Không có tin nhắn nào bị xóa gần đây.');
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: lastDeletedMessage.author.tag,
                iconURL: lastDeletedMessage.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(lastDeletedMessage.content || '*Không có nội dung*')
            .setColor('#CC99FF')
            .setFooter({
                text: `Đã xóa vào lúc ${moment(lastDeletedMessage.createdAt).format('HH:mm:ss')} - Ngày ${moment(lastDeletedMessage.createdAt).format('DD/MM/YYYY')}`,
                iconURL: message.guild.iconURL({ dynamic: true })
            })

        message.channel.send({ embeds: [embed] });
    }
};
