const settings = require('../settings.json');
const axios = require('axios')
var AsciiTable = require('ascii-table')

module.exports = {
	name: 'strafbakken',
	description: 'Update de strafbakken',
	args: true,
	args_length: 2,
	usage: [{cmd: `${settings.prefix}strafbakken <persoon> <plus of min>`,
			desc: 'Update de strafbakken per persoon'},
			{
			cmd: `${settings.prefix}strafbakken`,
			desc: 'Bekijk alle strafbakken'}],
	noArgsReply: () => {
		return new Promise((resolve, reject) => {
			console.log("No args reply");
			axios({
					url: settings.strafbakken,
					method: 'get',
					headers: {
						name: 'Danny', // not sure why we need this name header
						token: settings.strafbakkenPass
					}
				})
				.then(res => {
					if (res.status === 200) {
						let table = new AsciiTable('Strafbakken')
						table.setHeading('Naam', 'Strafbakken')
						const data = res.data;

						// no idea if this data is already sorted
						// didn't build the backend and too lazy to check
						let sorted = data.sort((a, b) => b.bakken - a.bakken);

						for (let row of sorted) {
							table.addRow(row.name, row.bakken)
						}
						
						resolve(`Strafbakken lijst:\n\`\`\`${table.toString()}\`\`\``);
					} else {
						reject('Strafbakken is weer stuk!');
					}
				})
				.catch(err => {
					console.error(err);
					reject('Strafbakken is weer stuk!');
				});
		});
	},
	execute: async (msg, args) => {
		let method;
		if (args.length === 1) {
			method = 'get';
		} else if (args[1] === '+') {
			method = 'post';
		} else if (args[1] === '-') {
			method = 'delete';
		} else {
			method = 'get';
		}

		// Verander de naam naar kleine letters en de eerste letter een hoofletter zodat het klopt met de namen in de database
		let name = args[0][0].toUpperCase() + args[0].slice(1).toLowerCase();

		// Verander andere (bij)namen naar de naam zoals hij staat in de database
		switch (name) {
			case 'Nelis':
			case 'Onderwijs':
				name = 'Niels';
				break;
			case 'Ivo':
				name = 'Komma';
				break;
			case 'Naut':
			case 'Das':
				name = 'Nutru';
				break;
			case 'Dopje':
				name = 'Imre';
				break;
			case 'Arnold':
				name = 'Sonny';
				break;
			case 'Daan':
			case 'Otis':
				name = 'Nugget';
				break;
			case 'Ryon':
				name = 'Ryan';
				break;
			case 'Sylvan':
				name = 'Ice';
				break;
			case 'Daniel':
			case 'Jonko':
			case 'Feut':
				name = 'Danny';
				break;
		}

		axios({
				url: settings.strafbakken,
				method: method,
				headers: {
					name: name,
					token: settings.strafbakkenPass
				}
			})
			.then(res => {
				if (res.status === 200) {
					if (method === 'get') {
						const data = res.data;
						let found = false;
						for (const row of data) {
							if (row.name === name) {
								msg.channel.send(`${name}: ${row.bakken}`);
								found = true;
							}
						}
						if (!found) msg.channel.send(`Ik kan de naam ${name} niet vinden`);
					} else {
						msg.channel.send(`Yes hoppa ${name} heeft een bak ${method === 'post' ? 'verdiend' : 'getrokken'}!`);
					}
				} else {
					msg.channel.send('Strafbakken is weer stuk!');
				}
			})
			.catch(err => {
				console.error(err);
				msg.channel.send('Strafbakken is weer stuk!');
			});
	}
}