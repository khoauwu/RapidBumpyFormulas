const {
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits,
} = require('discord.js');
const config = require(`../config.json`);
const emoji = require('../utils/emoji.js');

module.exports = {
    name: 'ticket',
    execute: (message) => {
        // Kiểm tra xem lệnh có bắt đầu bằng prefix không
        if (!message.content.startsWith(config.prefix)) {
            return; // Không thực hiện lệnh nếu không có prefix
        }

        // Kiểm tra quyền
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('Bạn không có quyền để sử dụng lệnh này!');
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('muahang')
                .setEmoji(`${emoji.cart}`)
                .setLabel('Mua Hàng')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('baohanh')
                .setEmoji(`${emoji.support}`)
                .setLabel('Bảo Hành')
                .setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
            .setColor('#CC99FF')
            .setDescription(
                `Chọn option phù hợp để **Mở ticket**\n\n- ${emoji.cart} **Mua Hàng**\nChọn option này nếu bạn muốn mua sản phẩm ở cửa hàng.\n\n- ${emoji.support} **Bảo Hành**\nChọn option này nếu sản phẩm bạn gặp vấn đề, gọi hỗ trợ.`
            )
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }) // Lấy avatar server cho footer
            })
            .setThumbnail(
                'https://media.discordapp.net/attachments/1262131507636473856/1298622031365144587/wweee.png?ex=671a3b83&is=6718ea03&hm=d8d6318606dbfd7c47e9e808140f30faee64fa64b07474c7c3b452fc74891443&'
            )
            .setTimestamp()
            .setAuthor({
                name: 'Pretty Store - Khu Vực Mua Hàng',
                iconURL: 'https://cdn-icons-png.flaticon.com/512/708/708904.png', // Lấy avatar server cho author
            });

        message.channel.send({ embeds: [embed], components: [row] });
    },
    baohanhInteraction: async (interaction) => {
        // Kiểm tra nếu customId khớp với 'baohanh'
        if (interaction.customId === 'baohanh') {
            const modal = new ModalBuilder()
                .setCustomId('baohanhModal')
                .setTitle('Bảo lỗi, bảo hành dịch vụ');

            const productNameInput = new TextInputBuilder()
                .setCustomId('productName')
                .setLabel('Sản phẩm bạn cần bảo hành là gì?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Nhập tên sản phẩm bạn muốn bảo lỗi...')
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(productNameInput);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }
    },
    muahangInteraction: async (interaction) => {
        // Kiểm tra nếu customId khớp với 'muahang'
        if (interaction.customId === 'muahang') {
            const modal = new ModalBuilder()
                .setCustomId('muahangModal')
                .setTitle('Mua, gia hạn dịch vụ');

            const productNameInput = new TextInputBuilder()
                .setCustomId('productName')
                .setLabel('Sản phẩm bạn cần mua là gì?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Nhập tên sản phẩm bạn muốn mua...')
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(productNameInput);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }
    },
};
