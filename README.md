# GitHub Activity Feed Action

A GitHub Action that displays a user's recent GitHub activity in a customizable format.

## Features

*   **Customizable Username:**  Display activity for any GitHub user.
*   **Event Type Filtering:** Include or exclude specific event types.
*   **Repository Exclusion:**  Exclude activity from specific repositories.
*   **Date Formatting:**  Format the dates using [Moment.js](https://momentjs.com/docs/#/displaying/format/) syntax.
*   **Control Number of Events:** Limit the number of events displayed.
*   **HTML Link Display:**  Choose whether to display HTML links to commits, pull requests, and issues.

## Usage

To use this action in your workflow, follow these steps:

### 1. Create a Workflow File

Create a new workflow file in your repository under `.github/workflows/your_workflow_name.yml` (e.g., `.github/workflows/activity.yml`).

### 2. Add the Action to Your Workflow

Add the following code to your workflow file, replacing `your-github-username/github-activity-action@v1` with the correct path to this action in your repository:

```yaml
name: Display GitHub Activity
on:
  workflow_dispatch:  # Allows manual triggering (you can use other triggers like 'push', 'schedule', etc.)

jobs:
  activity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Get GitHub Activity
        id: activity_feed
        uses: your-github-username/github-activity-action@v1  # Replace with your username and a tag or branch
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}  # Required
          username: your-github-username  # Optional: Defaults to the workflow actor
          max_events: 10  # Optional: Defaults to 10
          event_types: PushEvent,PullRequestEvent,IssuesEvent  # Optional: Comma-separated list
          exclude_repos: your-github-username/private-repo  # Optional: Comma-separated list
          date_format: 'YYYY-MM-DD HH:mm:ss'  # Optional: Uses Moment.js format
          display_html_links: true # Optional:  Whether to display HTML links (true/false, default true)

      - name: Print Activity Feed
        run: echo "${{ steps.activity_feed.outputs.activity_feed }}"
