const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
} = require('discord.js');
const config = require(`../config.json`);
const emoji = require('../utils/emoji');

module.exports = {
    name: 'giadichvu',
    execute: (message) => {
        // console.log('gia dich vu');
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Chọn bảng giá')
                .addOptions([
                    {
                        label: 'Nitro Boost',
                        value: 'nitrogift',
                        emoji: `${emoji.boost12Months}`,
                    },
                    {
                        label: 'Nitro Trial',
                        value: 'nitrotrial',
                        emoji: `${emoji.nitrotrial}`,
                    },
                    {
                        label: 'Boost Server',
                        value: 'boostserver',
                        emoji: `${emoji.nitroserver}`,
                    },
                    {
                        label: 'Buff Member Discord',
                        value: 'buffmember',
                        emoji: `${emoji.discordLogo}`,
                    },
                    {
                        label: 'Spotify',
                        value: 'spotify',
                        emoji: `${emoji.spotify}`,
                    },
                    {
                        label: 'YouTube',
                        value: 'youtube',
                        emoji: `${emoji.youtube}`,
                    },
                    {
                        label: 'Netflix',
                        value: 'netflix',
                        emoji: `${emoji.netflix}`,
                    },
                    {
                        label: 'Canva',
                        value: 'canva',
                        emoji: `${emoji.canva}`,
                    },
                    {
                        label: 'Tài Khoản Trữ Cow',
                        value: 'cow',
                        emoji: `${emoji.discordLogo}`,
                    },
                    {
                        label: 'OWO',
                        value: 'owo',
                        emoji: `${emoji.owo}`,
                    },
                    {
                        label: 'ChatGPT 4',
                        value: 'chatgpt',
                        emoji: `${emoji.chatgpt}`,
                    },
                    {
                        label: 'Duolingo Super',
                        value: 'duolingo',
                        emoji: `${emoji.duolingo}`,
                    },
                    {
                        label: 'Google One',
                        value: 'ggone',
                        emoji: `${emoji.ggone}`,
                    },{
                        label: 'Windows 10/11 Pro',
                        value: 'window',
                        emoji: `${emoji.window}`,
                    },
                    {
                        label: 'Dịch vụ khác',
                        value: 'dichvukhac',
                        emoji: `${emoji.dichvukhac}`,
                    },
                ])
        );

        const embed = new EmbedBuilder()
            .setThumbnail(
                'https://cdn-icons-png.flaticon.com/256/5269/5269319.png'
            )
            .setColor('#CC99FF')
            .setDescription(
                `> ${emoji.dot} Nhấn vào thanh công cụ phía dưới để chọn giá sản phẩm.\n> \n> ${emoji.fire} Cửa hàng nhận thanh toán qua các phương thức **Ngân hàng**, **Momo**, Thẻ cào **(+20% phí gạch thẻ)**\n> \n> ${emoji.dot} Sau khi xem giá nếu muốn mua dịch vụ [vui lòng nhấn vào đây!](https://discord.com/channels/1262128190915088495/1267984880076066910)`
            )
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }) // Lấy avatar server cho footer
            })
            .setAuthor({
                name: 'Bảng Giá Dịch Vụ',
                iconURL:
                    'https://cdn-icons-png.flaticon.com/512/3900/3900101.png',
            });

        message.channel.send({
            embeds: [embed],
            components: [row],
        });
    },
};
