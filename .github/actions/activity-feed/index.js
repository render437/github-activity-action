const core = require('@actions/core');
const github = require('@actions/github');
const moment = require('moment');

async function run() {
    try {
        const githubToken = core.getInput('github_token', { required: true });
        const username = core.getInput('username') || github.context.actor; // Default to the workflow actor
        const maxEvents = parseInt(core.getInput('max_events') || '10');
        const eventTypes = core.getInput('event_types') ? core.getInput('event_types').split(',').map(s => s.trim()) : [];
        const excludeRepos = core.getInput('exclude_repos') ? core.getInput('exclude_repos').split(',').map(s => s.trim()) : [];
        const dateFormat = core.getInput('date_format') || 'YYYY-MM-DD HH:mm:ss';
        const displayHtmlLinks = core.getBooleanInput('display_html_links', { required: false })

        const octokit = github.getOctokit(githubToken);

        try {
            const events = await octokit.rest.activity.listEventsForUser({
                username: username,
                per_page: 100, // Adjust as needed
            });

            let activityFeed = '';
            let eventCount = 0;

            for (const event of events.data) {
                if (eventCount >= maxEvents) {
                    break;
                }

                if (excludeRepos.includes(event.repo.name)) {
                    continue;
                }

                if (eventTypes.length > 0 && !eventTypes.includes(event.type)) {
                    continue;
                }

                const eventDate = moment(event.created_at).format(dateFormat);

                // Customize the activity display based on the event type
                let eventDescription = '';
                switch (event.type) {
                    case 'PushEvent':
                        const commitLink = displayHtmlLinks ? `<a href="https://github.com/${event.repo.name}/commits/${event.payload.before}">Compare</a>` : `(Compare at https://github.com/${event.repo.name}/commits/${event.payload.before})`;
                        eventDescription = `Pushed ${event.payload.commits.length} commit(s) to ${event.repo.name} ${commitLink}`;
                        break;
                    case 'CreateEvent':
                        eventDescription = `Created a ${event.payload.ref_type} in ${event.repo.name}`;
                        break;
                    case 'PullRequestEvent':
                        const prLink = displayHtmlLinks ? `<a href="${event.payload.pull_request.html_url}">View</a>` : `(View at ${event.payload.pull_request.html_url})`;
                        eventDescription = `${event.payload.action} pull request in ${event.repo.name} ${prLink}`;
                        break;
                    case 'IssuesEvent':
                        const issueLink = displayHtmlLinks ? `<a href="${event.payload.issue.html_url}">View</a>` : `(View at ${event.payload.issue.html_url})`;
                        eventDescription = `${event.payload.action} issue in ${event.repo.name} ${issueLink}`;
                        break;
                    case 'WatchEvent':
                        eventDescription = `Starred ${event.repo.name}`;
                        break;

                    default:
                        eventDescription = `Performed a ${event.type} action in ${event.repo.name}`;
                }

                activityFeed += `- ${eventDate}: ${eventDescription}\n`;
                eventCount++;
            }
            core.setOutput('activity_feed', activityFeed);

        } catch (error) {
            core.setFailed(`Failed to fetch activity: ${error.message}`);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
