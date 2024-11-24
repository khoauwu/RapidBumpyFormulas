const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder,
} = require("discord.js");
const QRCode = require("qrcode");

function parseAmount(amountStr) {
    const match = /^(\d+)(k?)$/i.exec(amountStr);
    if (!match) {
        throw new Error("Invalid amount format");
    }
    let [_, amount, k] = match;
    amount = parseInt(amount);
    if (k === "k") {
        amount *= 1000;
    } else if (k === "tr" || k === "m") {
        amount *= 1000000;
    }

    return amount;
}

function generateRandomString(length) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

module.exports = {
    name: "momo",
    async execute(message, args) {
        const content = message.content.toLowerCase().trim();

        // Kiểm tra nếu tin nhắn chứa "momo" hoặc "stk"
        if (!content.includes("momo") && !content.includes("stk")) return;

        // Tách phần tin nhắn thành các phần tử
        const parts = content.split(/\s+/);
        const amountStr = parts[1] || null;
        const productName = parts.slice(2).join(" ");

        let amount;
        let qrData;
        const randomPaymentInfo = generateRandomString(10); // Chuỗi ngẫu nhiên

        if (amountStr) {
            try {
                amount = parseAmount(amountStr);
                // Dữ liệu QR Code với thông tin thanh toán theo format của MoMo
                qrData = `momo://payment?P=${randomPaymentInfo}&A=${amount}&R=0345613726&F=${randomPaymentInfo}&name=${productName}`;
            } catch (error) {
                await message.reply(
                    "Số tiền không hợp lệ. Vui lòng nhập số tiền chính xác",
                );
                return;
            }
        } else {
            qrData = "https://i.imgur.com/Dy7PKFz.png"; // Thay thế bằng link hình ảnh QR của bạn";
        }

        // Tạo QR Code từ dữ liệu
        const qrUrl = await QRCode.toDataURL(qrData);
        const qrBuffer = Buffer.from(qrUrl.split(",")[1], "base64"); // Tạo buffer từ QR Code Base64

        const attachment = new AttachmentBuilder(qrBuffer, {
            name: "qrcode.png",
        });

        // Tạo mô tả embed
        let description = `**Ví thanh toán Momo <:ps_momo:1291483000328163420>\nSố Tài Khoản: \`0345613726\`\nChủ Tài Khoản: Le Dang Khoa** <a:ps_succes:1310182870962274344>`;

        if (amount) {
            const formattedAmount = amount.toLocaleString("vi-VN"); // Định dạng số theo chuẩn Việt Nam
            description += `\n**Số Tiền: ${formattedAmount}đ**`;
        }

        // Tạo embed thanh toán
        const embed = new EmbedBuilder()
            .setTitle("Thông Tin Thanh Toán")
            .setColor("#2d2d31")
            .setDescription(description)
            .setFooter({
                text: `${message.client.user.username}`,
                iconURL: message.guild.iconURL({ dynamic: true }),
            })
            .setImage("https://i.imgur.com/Dy7PKFz.png"); // Hiển thị mã QR trong embed

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("copy-account")
                .setLabel("Copy Số Tài Khoản")
                .setStyle(ButtonStyle.Secondary),
        );

        // Gửi embed kèm theo nút "Copy" và QR Code
        const replyMessage = await message.channel.send({
            content: `Đây là thông tin thanh toán của nhân viên <@${message.author.id}>.\nQuét mã QR bên dưới hoặc bấm nút Copy để sao chép số tài khoản.`,
            embeds: [embed],
            components: [row],
        });

        // Bộ lọc để chỉ nhận tương tác từ người gọi lệnh
        const filter = (interaction) =>
            interaction.customId === "copy-account" &&
            interaction.user.id === message.author.id;
        const collector = replyMessage.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "copy-account") {
                await interaction.reply({
                    content: "0345613726",
                    ephemeral: true,
                });
            }
        });
    },
};
