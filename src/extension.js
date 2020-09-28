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
	constructor(jira_base_url) {
		this.jira_base_url = jira_base_url;
	}

	provideTerminalLinks(context, token) {
		return new Promise((resolve) => {
			const fileRegex = /\b[A-Z]+-[0-9]+\b/g;
			const results = [];
			var match;
			while ((match = fileRegex.exec(context.line)) !== null &&
					!token.isCancellationRequested) {
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
		const ticket_uri = `${this.jira_base_url}/${link.ticket}`;
		vscode.env.openExternal(vscode.Uri.parse(ticket_uri));
	}
}

function activate(context) {
	const init = () => {
		while (context.subscriptions.length > 1) {
			context.subscriptions.pop()?.dispose();
		}
		const jira_base_url = vscode.workspace.getConfiguration().get(
			'jira_ticket_links.jira_url');

		if (jira_base_url == '') {
			console.error('[Jira Ticket Links] Must set Jira base URI in the extension settings.');
			return;
		}

		try {
			vscode.Uri.parse(jira_base_url, true)
		} catch (e) {
			console.error('[Jira Ticket Links] Unable to parse user-provided Jira base URL');
			return;
		}

		vscode.window.registerTerminalLinkProvider(new TerminalLinkProvider(jira_base_url));
	};

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration('jira_ticket_links')) {
				init();
			}
		}));

	init();
}

function deactivate() { }

exports.activate = activate;
exports.deactivate = deactivate;