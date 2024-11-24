const { EmbedBuilder } = require('discord.js');
const { readDB } = require('../utils/db.util.js');
const ticketConfig = require('../ticket.config.json');

module.exports = {
    name: 'pendingtickets',
    description: 'Hiển thị số lượng tickets chưa xử lý',
    async execute(message, args, client) {
        // Kiểm tra quyền hạn cho lệnh pendingtickets
        if (!ticketConfig.shopOwnerIds.includes(message.author.id)) {
            return message.reply('Bạn không có quyền sử dụng lệnh này.');
        }

        try {
            const db = await readDB();
            const pendingTicketsCount = db.pendingTickets.length;

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Tickets Chưa Xử Lý')
                .setDescription(
                    `Hiện có ${pendingTicketsCount} ticket(s) đang chờ xử lý.`
                )
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Lỗi khi đọc dữ liệu pendingTickets:', error);
            await message.reply(
                'Có lỗi xảy ra khi kiểm tra tickets chưa xử lý.'
            );
        }
    },
};
