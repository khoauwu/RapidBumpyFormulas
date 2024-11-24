const fs = require("fs").promises;
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db", "db.json");

async function readDB() {
	try {
		const data = await fs.readFile(DB_PATH, "utf8");
		return JSON.parse(data);
	} catch (error) {
		if (error.code === "ENOENT") {
			// File doesn't exist, return object with empty tickets array
			return { tickets: [] };
		}
		throw error;
	}
}

async function writeDB(data) {
	await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function storeTicketToDB(ticket) {
	const db = await readDB();
	db.tickets.push(ticket);
	await writeDB(db);
}

async function storeChannelToDB(channel) {
	const db = await readDB();
	db.channels.push(channel);
	await writeDB(db);
}

async function getTicketFromDB(ticketId) {
	const db = await readDB();
	return db.tickets.find((ticket) => ticket.id === ticketId);
}

async function getChannelFromDB(channelId) {
	const db = await readDB();
	return db.channels.find((channel) => channel.id === channelId);
}

async function getChannelByNameFromDB(channelName) {
	const db = await readDB();
	return db.channels.find((channel) => channel.name === channelName);
}

async function updateTicket(ticketId, updatedTicket) {
	const db = await readDB();
	const index = db.tickets.findIndex((ticket) => ticket.id === ticketId);
	if (index !== -1) {
		db.tickets[index] = { ...db.tickets[index], ...updatedTicket };
		await writeDB(db);
		return true;
	}
	return false;
}

async function deleteTicketFromDB(ticketId) {
	const db = await readDB();
	db.tickets = db.tickets.filter((ticket) => ticket.id !== ticketId);
	await writeDB(db);
}

async function getTickets(userId) {
	const db = await readDB();
	const userTickets = db.tickets.filter((ticket) => ticket.userId === userId);
	return userTickets.sort(
		(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
	);
}

module.exports = {
	readDB,
	storeTicketToDB,
	getTicketFromDB,
	updateTicket,
	deleteTicketFromDB,
	getTickets,
};
