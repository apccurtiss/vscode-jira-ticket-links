'use strict';

const vscode = require('vscode');

class TerminalLink {
	constructor(startIndex, length, ticket) {
		this.startIndex = startIndex;
		this.length = length;
		this.ticket = ticket;
	}
}

class TerminalLinkProvider {
	provideTerminalLinks(context, token) {
		return new Promise((resolve) => {
			const fileRegex = /\b[A-Z]+-[0-9]+\b/g;
			const results = [];
			var match;
			while ((match = fileRegex.exec(context.line)) !== null && !token.isCancellationRequested) {
				const matchIndex = fileRegex.lastIndex;
				const ticket = match[0];
				const offset = matchIndex - ticket.length;
				const length = ticket.length;

				results.push(new TerminalLink(offset, length, ticket));
			}
			resolve(results);
		});
	}

	handleTerminalLink(link) {
		vscode.env.openExternal(vscode.Uri.parse(`http://go/j/${link.ticket}`));
	}
}

function activate(context) {
	const init = () => {
		while (context.subscriptions.length > 1) {
			context.subscriptions.pop()?.dispose();
		}
		vscode.window.registerTerminalLinkProvider(new TerminalLinkProvider());
	};
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration('terminalFileLink')) {
				init();
			}
		}));

	init();
}

function deactivate() { }

exports.activate = activate;
exports.deactivate = deactivate;